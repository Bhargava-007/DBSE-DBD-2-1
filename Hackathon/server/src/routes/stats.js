const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Agent = require('../models/Agent');

router.get('/', async (req, res, next) => {
  try {
    // 1. Status counts
    const statusAgg = await Ticket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusCounts = {
      open: 0,
      in_progress: 0,
      waiting: 0,
      resolved: 0,
      closed: 0,
    };
    statusAgg.forEach((item) => {
      if (statusCounts[item._id] !== undefined) {
        statusCounts[item._id] = item.count;
      }
    });

    // 2. Priority counts
    const priorityAgg = await Ticket.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);
    const priorityCounts = {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    priorityAgg.forEach((item) => {
      if (priorityCounts[item._id] !== undefined) {
        priorityCounts[item._id] = item.count;
      }
    });

    // 3. SLA Breached count
    const slaBreachedCount = await Ticket.countDocuments({
      $or: [
        { slaBreached: true },
        {
          status: { $nin: ['resolved', 'closed'] },
          slaDueAt: { $lt: new Date() },
        },
      ],
    });

    // 4. Average resolution time
    const resolvedTickets = await Ticket.find({
      status: { $in: ['resolved', 'closed'] },
    }).select('createdAt updatedAt history status');

    let totalResolutionMinutes = 0;
    let resolvedCount = 0;

    resolvedTickets.forEach((ticket) => {
      // Find resolution event from history if present
      const resolveEvent = ticket.history.find(
        (h) => h.action === 'status_changed' && ['resolved', 'closed'].includes(h.to)
      );
      const resolvedAt = resolveEvent ? new Date(resolveEvent.at) : new Date(ticket.updatedAt);
      const diffMinutes = Math.max(0, (resolvedAt - new Date(ticket.createdAt)) / (1000 * 60));
      totalResolutionMinutes += diffMinutes;
      resolvedCount++;
    });

    let avgResolutionHours = 0;
    let avgResolutionFormatted = '0h';
    if (resolvedCount > 0) {
      avgResolutionHours = Number((totalResolutionMinutes / resolvedCount / 60).toFixed(1));
      if (avgResolutionHours < 1) {
        avgResolutionFormatted = `${Math.round(totalResolutionMinutes / resolvedCount)}m`;
      } else {
        avgResolutionFormatted = `${avgResolutionHours}h`;
      }
    }

    // 5. Tickets per agent
    const agents = await Agent.find().sort({ name: 1 });
    const agentWorkload = await Ticket.aggregate([
      {
        $group: {
          _id: '$assignedAgent',
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $in: ['$status', ['open', 'in_progress', 'waiting']] }, 1, 0],
            },
          },
          resolved: {
            $sum: {
              $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0],
            },
          },
        },
      },
    ]);

    const agentWorkloadMap = agentWorkload.reduce((acc, curr) => {
      if (curr._id) {
        acc[curr._id.toString()] = curr;
      }
      return acc;
    }, {});

    const ticketsPerAgent = agents.map((agent) => {
      const stats = agentWorkloadMap[agent._id.toString()] || {
        total: 0,
        active: 0,
        resolved: 0,
      };
      return {
        agentId: agent._id,
        name: agent.name,
        role: agent.role,
        active: agent.active,
        total: stats.total,
        open: stats.active,
        resolved: stats.resolved,
      };
    });

    // 6. Last 7 days volume
    const last7Days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fullDate = d.toISOString().split('T')[0];

      last7Days.push({
        date: label,
        fullDate,
        start: startOfDay,
        end: endOfDay,
        count: 0,
      });
    }

    const minDate = last7Days[0].start;
    const recentTickets = await Ticket.find({
      createdAt: { $gte: minDate },
    }).select('createdAt');

    recentTickets.forEach((t) => {
      const tTime = new Date(t.createdAt).getTime();
      const match = last7Days.find(
        (day) => tTime >= day.start.getTime() && tTime <= day.end.getTime()
      );
      if (match) {
        match.count++;
      }
    });

    const volumeChart = last7Days.map(({ date, fullDate, count }) => ({
      date,
      fullDate,
      count,
    }));

    // Total tickets count
    const totalTickets = await Ticket.countDocuments();

    res.json({
      totalTickets,
      statusCounts,
      priorityCounts,
      slaBreachedCount,
      avgResolutionHours,
      avgResolutionFormatted,
      resolvedCount,
      ticketsPerAgent,
      volumeChart,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
