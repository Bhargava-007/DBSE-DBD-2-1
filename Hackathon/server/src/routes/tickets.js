const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Customer = require('../models/Customer');
const Agent = require('../models/Agent');
const Counter = require('../models/Counter');
const SlaPolicy = require('../models/SlaPolicy');
const { classifyLocally } = require('../utils/classifier');

const SLA_DURATIONS = {
  urgent: 60,
  high: 240,
  medium: 1440,
  low: 4320,
};

// Helper to compute SLA due date
async function calculateSlaDueAt(priority) {
  const policy = await SlaPolicy.findOne({ priority });
  const duration = policy ? policy.durationMinutes : (SLA_DURATIONS[priority] || 1440);
  return new Date(Date.now() + duration * 60 * 1000);
}

// GET /api/tickets - List with filtering, pagination, search, sorting
router.get('/', async (req, res, next) => {
  try {
    const {
      status,
      priority,
      assignedAgent,
      customer,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }
    if (assignedAgent) {
      if (assignedAgent === 'unassigned') {
        filter.assignedAgent = null;
      } else if (assignedAgent !== 'all') {
        filter.assignedAgent = assignedAgent;
      }
    }
    if (customer) {
      filter.customer = customer;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { ticketId: searchRegex },
        { subject: searchRegex },
        { description: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const sortOption = {};
    sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [tickets, totalCount] = await Promise.all([
      Ticket.find(filter)
        .populate('customer', 'name email company')
        .populate('assignedAgent', 'name email role')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Ticket.countDocuments(filter),
    ]);

    res.json({
      tickets,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/tickets/:id - Get single ticket by ticketId or _id
router.get('/:id', async (req, res, next) => {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: req.params.id } : { ticketId: req.params.id };

    const ticket = await Ticket.findOne(query)
      .populate('customer', 'name email company')
      .populate('assignedAgent', 'name email role');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (err) {
    next(err);
  }
});

// POST /api/tickets - Create ticket
router.post('/', async (req, res, next) => {
  try {
    let {
      subject,
      description,
      customerId,
      customerEmail,
      customerName,
      customerCompany,
      assignedAgent,
      status,
      priority,
      category,
      demo,
      creatorName,
    } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ error: 'Subject and description are required' });
    }

    // 1. Resolve customer
    let customerDoc;
    if (customerId) {
      customerDoc = await Customer.findById(customerId);
    }
    if (!customerDoc && customerEmail) {
      customerDoc = await Customer.findOne({ email: customerEmail.trim().toLowerCase() });
      if (!customerDoc) {
        customerDoc = await Customer.create({
          name: customerName || customerEmail.split('@')[0],
          email: customerEmail.trim().toLowerCase(),
          company: customerCompany || '',
          demo: Boolean(demo),
        });
      }
    }
    if (!customerDoc) {
      return res.status(400).json({ error: 'A valid customer is required to create a ticket' });
    }

    // 2. Call classifier if category or priority not given
    let classifierResult = null;
    if (!category || !priority) {
      try {
        const classifierUrl = process.env.CLASSIFIER_URL || 'http://localhost:8000';
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1500);

        const response = await fetch(`${classifierUrl}/classify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, description }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (response.ok) {
          classifierResult = await response.json();
        }
      } catch (err) {
        // fallback local
        classifierResult = classifyLocally(subject, description);
      }

      if (!classifierResult) {
        classifierResult = classifyLocally(subject, description);
      }

      if (!category) category = classifierResult.category;
      if (!priority) priority = classifierResult.priority;
    }

    // 3. Generate sequential ticket ID
    const seq = await Counter.getNextSequence('ticketId');
    const ticketId = `TKT-${seq}`;

    // 4. Calculate SLA deadline
    const slaDueAt = await calculateSlaDueAt(priority || 'medium');

    const createdBy = creatorName || customerDoc.name || 'Customer';

    const ticket = new Ticket({
      ticketId,
      subject: subject.trim(),
      description: description.trim(),
      customer: customerDoc._id,
      assignedAgent: assignedAgent || null,
      status: status || 'open',
      priority: priority || 'medium',
      category: category || 'general',
      slaDueAt,
      slaBreached: false,
      demo: Boolean(demo),
      messages: [
        {
          author: customerDoc.name,
          authorType: 'customer',
          body: description.trim(),
          createdAt: new Date(),
        },
      ],
      history: [
        {
          action: 'created',
          from: '',
          to: 'open',
          by: createdBy,
          at: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (assignedAgent) {
      const agent = await Agent.findById(assignedAgent);
      if (agent) {
        ticket.history.push({
          action: 'assignee_changed',
          from: 'Unassigned',
          to: agent.name,
          by: createdBy,
          at: new Date(),
        });
      }
    }

    await ticket.save();

    const populated = await Ticket.findById(ticket._id)
      .populate('customer', 'name email company')
      .populate('assignedAgent', 'name email role');

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tickets/:id - Update status, priority, assignee (pushes changes to history)
router.patch('/:id', async (req, res, next) => {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: req.params.id } : { ticketId: req.params.id };

    const ticket = await Ticket.findOne(query).populate('assignedAgent', 'name email');
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const { status, priority, assignedAgent, by = 'Agent' } = req.body;
    let hasChanged = false;

    // Status change
    if (status && status !== ticket.status) {
      const oldStatus = ticket.status;
      ticket.status = status;
      ticket.history.push({
        action: 'status_changed',
        from: oldStatus,
        to: status,
        by,
        at: new Date(),
      });
      hasChanged = true;
    }

    // Priority change
    if (priority && priority !== ticket.priority) {
      const oldPriority = ticket.priority;
      ticket.priority = priority;

      // Optionally recalculate SLA if not resolved
      if (!['resolved', 'closed'].includes(ticket.status)) {
        ticket.slaDueAt = await calculateSlaDueAt(priority);
      }

      ticket.history.push({
        action: 'priority_changed',
        from: oldPriority,
        to: priority,
        by,
        at: new Date(),
      });
      hasChanged = true;
    }

    // Assignee change
    if (assignedAgent !== undefined) {
      const currentAgentId = ticket.assignedAgent ? ticket.assignedAgent._id.toString() : null;
      const newAgentId = assignedAgent ? assignedAgent.toString() : null;

      if (currentAgentId !== newAgentId) {
        const oldName = ticket.assignedAgent ? ticket.assignedAgent.name : 'Unassigned';
        let newName = 'Unassigned';

        if (newAgentId) {
          const newAgent = await Agent.findById(newAgentId);
          if (newAgent) {
            newName = newAgent.name;
            ticket.assignedAgent = newAgent._id;
          } else {
            ticket.assignedAgent = null;
          }
        } else {
          ticket.assignedAgent = null;
        }

        ticket.history.push({
          action: 'assignee_changed',
          from: oldName,
          to: newName,
          by,
          at: new Date(),
        });
        hasChanged = true;
      }
    }

    if (hasChanged) {
      ticket.updatedAt = new Date();
      await ticket.save();
    }

    const updated = await Ticket.findById(ticket._id)
      .populate('customer', 'name email company')
      .populate('assignedAgent', 'name email role');

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// POST /api/tickets/:id/messages - Add message to ticket
router.post('/:id/messages', async (req, res, next) => {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: req.params.id } : { ticketId: req.params.id };

    const ticket = await Ticket.findOne(query);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const { author, authorType = 'agent', body } = req.body;
    if (!body || !body.trim()) {
      return res.status(400).json({ error: 'Message body cannot be empty' });
    }

    const authorName = author || (authorType === 'customer' ? 'Customer' : 'Agent');

    const newMessage = {
      author: authorName,
      authorType,
      body: body.trim(),
      createdAt: new Date(),
    };

    ticket.messages.push(newMessage);
    ticket.history.push({
      action: 'message_added',
      from: '',
      to: '',
      by: authorName,
      at: new Date(),
    });

    // If ticket was waiting and customer replies, bump to open
    if (authorType === 'customer' && ticket.status === 'waiting') {
      ticket.history.push({
        action: 'status_changed',
        from: 'waiting',
        to: 'open',
        by: 'System',
        at: new Date(),
      });
      ticket.status = 'open';
    }

    ticket.updatedAt = new Date();
    await ticket.save();

    const updated = await Ticket.findById(ticket._id)
      .populate('customer', 'name email company')
      .populate('assignedAgent', 'name email role');

    res.status(201).json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
