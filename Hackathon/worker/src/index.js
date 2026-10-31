const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();
const mongoose = require('mongoose');
const cron = require('node-cron');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/supportdesk';

// Minimal Ticket model definition matching server schema
const ticketSchema = new mongoose.Schema(
  {
    ticketId: String,
    subject: String,
    status: String,
    priority: String,
    slaDueAt: Date,
    slaBreached: Boolean,
    history: [
      {
        action: String,
        from: String,
        to: String,
        by: String,
        at: { type: Date, default: Date.now },
      },
    ],
    updatedAt: Date,
  },
  { timestamps: false }
);

const Ticket = mongoose.model('Ticket', ticketSchema);

async function checkSlaBreaches() {
  const now = new Date();
  try {
    const expiredTickets = await Ticket.find({
      slaDueAt: { $lt: now },
      slaBreached: { $ne: true },
      status: { $nin: ['resolved', 'closed'] },
    });

    if (expiredTickets.length > 0) {
      console.log(`[SLA Worker] Found ${expiredTickets.length} ticket(s) breaching SLA.`);
      for (const ticket of expiredTickets) {
        ticket.slaBreached = true;
        ticket.history.push({
          action: 'sla_breached',
          from: 'within_sla',
          to: 'breached',
          by: 'SLA Worker',
          at: now,
        });
        ticket.updatedAt = now;
        await ticket.save();
        console.log(`[SLA Worker] Ticket ${ticket.ticketId} marked as SLA breached.`);
      }
    }
  } catch (err) {
    console.error('[SLA Worker] Error checking SLA breaches:', err.message);
  }
}

async function startWorker() {
  try {
    console.log(`[SLA Worker] Connecting to MongoDB at ${uri}...`);
    await mongoose.connect(uri);
    console.log('[SLA Worker] Connected. Starting SLA monitoring schedule (every minute)...');

    // Run once on boot
    await checkSlaBreaches();

    // Schedule every minute
    cron.schedule('* * * * *', async () => {
      await checkSlaBreaches();
    });
  } catch (err) {
    console.error('[SLA Worker] Fatal error:', err);
    process.exit(1);
  }
}

startWorker();
