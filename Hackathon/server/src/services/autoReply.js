const Ticket = require('../models/Ticket');
const Customer = require('../models/Customer');

const CATEGORY_TIPS = {
  billing: 'have your invoice number handy',
  technical: 'a screenshot or the exact error message helps us fix it faster',
  account: "avoid repeated login attempts so the account doesn't lock",
  shipping: 'keep your order or tracking number ready',
  general: 'feel free to add any extra details',
};

const SLA_TIMES = {
  urgent: '1 hour',
  high: '4 hours',
  medium: '24 hours',
  low: '72 hours',
};

async function autoReply(ticket, event, extra = {}) {
  if (!ticket) return null;

  // Do not send bot reply when an agent changes status on a demo-seeded ticket (demo: true)
  if (ticket.demo && event !== 'created') {
    return ticket;
  }

  // Populate customer if only ID is present
  let customerName = 'there';
  if (ticket.customer) {
    if (ticket.customer.name) {
      customerName = ticket.customer.name.trim().split(' ')[0] || 'there';
    } else {
      try {
        const cust = await Customer.findById(ticket.customer);
        if (cust && cust.name) {
          customerName = cust.name.trim().split(' ')[0] || 'there';
        }
      } catch (e) {
        // fallback
      }
    }
  }

  const category = ticket.category || 'general';
  const priority = ticket.priority || 'medium';
  const categoryTip = CATEGORY_TIPS[category] || CATEGORY_TIPS.general;
  const slaTime = SLA_TIMES[priority] || '24 hours';
  const ticketId = ticket.ticketId || 'your ticket';
  const agentName = extra.agent || 'An agent';

  let body = '';

  switch (event) {
    case 'created':
      body = `Hi ${customerName}, thanks for reaching out. We've logged your request as ${ticketId} under ${category} with ${priority} priority. Our team will respond within ${slaTime}. Meanwhile: ${categoryTip}.`;
      break;
    case 'assigned':
      body = `${agentName} from our support team is now handling your ticket.`;
      break;
    case 'in_progress':
      body = "We're actively working on your issue.";
      break;
    case 'waiting':
      body = 'We need a bit more information from you to continue. Please reply here.';
      break;
    case 'resolved':
      body = "We've marked this as resolved. If it isn't fixed, just reply and we'll reopen it.";
      break;
    case 'closed':
      body = 'This ticket is now closed. Feel free to open a new one anytime.';
      break;
    case 'reopened':
      body = "Thanks for the update, we've reopened your ticket and an agent will take another look.";
      break;
    default:
      return ticket;
  }

  ticket.messages.push({
    author: 'Support Assistant',
    authorType: 'bot',
    body,
    createdAt: new Date(),
  });

  ticket.history.push({
    action: 'auto_reply_sent',
    from: '',
    to: '',
    by: 'Support Assistant',
    at: new Date(),
  });

  ticket.updatedAt = new Date();
  await ticket.save();
  return ticket;
}

module.exports = { autoReply };
