const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Ticket = require('../models/Ticket');

// GET all customers
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }
    const customers = await Customer.find(query).sort({ createdAt: -1 });

    // Attach ticket count for each customer
    const customerIds = customers.map((c) => c._id);
    const counts = await Ticket.aggregate([
      { $match: { customer: { $in: customerIds } } },
      { $group: { _id: '$customer', count: { $sum: 1 } } },
    ]);
    const countMap = counts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    const enriched = customers.map((c) => ({
      ...c.toObject(),
      ticketCount: countMap[c._id.toString()] || 0,
    }));

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

// GET single customer by ID along with their tickets
router.get('/:id', async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const tickets = await Ticket.find({ customer: customer._id })
      .populate('assignedAgent', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ customer, tickets });
  } catch (err) {
    next(err);
  }
});

// POST create or find customer (e.g. for customer login / creation)
router.post('/', async (req, res, next) => {
  try {
    const { name, email, company, demo } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let customer = await Customer.findOne({ email: cleanEmail });

    if (customer) {
      // If company or name updated, update
      if (company && !customer.company) {
        customer.company = company;
        await customer.save();
      }
      return res.json(customer);
    }

    customer = await Customer.create({
      name: name.trim(),
      email: cleanEmail,
      company: company ? company.trim() : '',
      demo: Boolean(demo),
    });

    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
