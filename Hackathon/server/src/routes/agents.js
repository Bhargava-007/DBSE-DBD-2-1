const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const Ticket = require('../models/Ticket');

// GET all agents with workload statistics
router.get('/', async (req, res, next) => {
  try {
    const agents = await Agent.find().sort({ name: 1 });

    const agentIds = agents.map((a) => a._id);

    // Aggregate workload
    const workload = await Ticket.aggregate([
      { $match: { assignedAgent: { $in: agentIds } } },
      {
        $group: {
          _id: '$assignedAgent',
          totalTickets: { $sum: 1 },
          openTickets: {
            $sum: {
              $cond: [{ $in: ['$status', ['open', 'in_progress', 'waiting']] }, 1, 0],
            },
          },
          resolvedTickets: {
            $sum: {
              $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0],
            },
          },
        },
      },
    ]);

    const workloadMap = workload.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr;
      return acc;
    }, {});

    const enriched = agents.map((a) => {
      const stats = workloadMap[a._id.toString()] || {
        totalTickets: 0,
        openTickets: 0,
        resolvedTickets: 0,
      };
      return {
        ...a.toObject(),
        workload: stats,
      };
    });

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

// POST create a new agent
router.post('/', async (req, res, next) => {
  try {
    const { name, email, role, active, demo } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await Agent.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ error: 'Agent with this email already exists' });
    }

    const agent = await Agent.create({
      name: name.trim(),
      email: cleanEmail,
      role: role === 'admin' ? 'admin' : 'agent',
      active: active !== undefined ? Boolean(active) : true,
      demo: Boolean(demo),
    });

    res.status(201).json(agent);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
