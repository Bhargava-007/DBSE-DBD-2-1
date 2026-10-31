const Customer = require('../models/Customer');
const Agent = require('../models/Agent');
const Ticket = require('../models/Ticket');
const Counter = require('../models/Counter');
const SlaPolicy = require('../models/SlaPolicy');

const DEMO_CUSTOMERS = [
  { name: 'Liam Davis', email: 'liam@apexlogistics.io', company: 'Apex Logistics', demo: true },
  { name: 'Elena Rostova', email: 'elena@novadynamics.com', company: 'Nova Dynamics', demo: true },
  { name: 'Arthur Pendelton', email: 'arthur@sterlingwealth.co', company: 'Sterling Wealth', demo: true },
  { name: 'Chloe Bennet', email: 'chloe@luminahealth.org', company: 'Lumina Health', demo: true },
  { name: 'David Zhao', email: 'david.zhao@hyperioncloud.com', company: 'Hyperion Cloud', demo: true },
  { name: 'Samantha Miller', email: 'sam@kineticrobotics.net', company: 'Kinetic Robotics', demo: true },
  { name: 'Mateo Silva', email: 'mateo@solisenergy.com', company: 'Solis Energy', demo: true },
  { name: 'Aaliyah Khan', email: 'aaliyah@nimbusmedia.co', company: 'Nimbus Media', demo: true },
  { name: 'Oliver Wright', email: 'oliver@bluerockmfg.com', company: 'BlueRock Manufacturing', demo: true },
  { name: 'Isabella Rossi', email: 'isabella@bellaretail.it', company: 'Bella Retail', demo: true },
  { name: 'Kenji Takahashi', email: 'kenji@sakurasoft.jp', company: 'Sakura Software', demo: true },
  { name: 'Fatima Al-Hassan', email: 'fatima@oasisglobal.com', company: 'Oasis Global Trading', demo: true },
  { name: 'Lucas Martin', email: 'lucas@zenithtele.fr', company: 'Zenith Telecom', demo: true },
  { name: 'Hannah Schmidt', email: 'hannah@alpinefin.de', company: 'Alpine Financial', demo: true },
  { name: 'Marcus Brookes', email: 'marcus@veritasconsulting.io', company: 'Veritas Consulting', demo: true },
];

const TICKET_TEMPLATES = [
  {
    subject: 'Production API returning 500 error on checkout',
    description: 'Our customer checkout flow is failing with HTTP 500 internal server error. Immediate assistance needed as orders are failing.',
    category: 'technical',
    priority: 'urgent',
    daysAgo: 1,
    status: 'in_progress',
    agentIndex: 1,
    customerIndex: 4,
    slaHours: 1,
    messages: [
      { authorType: 'customer', body: 'Our customer checkout flow is failing with HTTP 500 internal server error. Immediate assistance needed as orders are failing.' },
      { authorType: 'agent', body: 'Investigating now. Found a connection pool timeout in the payments cluster. Deploying a hotfix.' },
      { authorType: 'customer', body: 'Thank you, error rates are starting to dip. Please keep us updated.' }
    ]
  },
  {
    subject: 'Double charge on October SaaS invoice #INV-4091',
    description: 'We were billed twice on our corporate Mastercard for invoice #INV-4091 on October 24th. Please issue a refund for the duplicate transaction.',
    category: 'billing',
    priority: 'high',
    daysAgo: 3,
    status: 'resolved',
    agentIndex: 0,
    customerIndex: 2,
    slaHours: 4,
    messages: [
      { authorType: 'customer', body: 'We were billed twice on our corporate Mastercard for invoice #INV-4091 on October 24th. Please issue a refund for the duplicate transaction.' },
      { authorType: 'agent', body: 'Hello Arthur, apologies for the inconvenience. I verified the duplicate charge and have initiated a full refund of $480.00 back to your card.' },
      { authorType: 'customer', body: 'Refund confirmed on our statement. Thank you for the quick resolution!' }
    ]
  },
  {
    subject: 'Urgent: Unable to log in after enforcing 2FA',
    description: 'Our executive team got locked out of the enterprise console after 2FA was required. We need admin session reset asap.',
    category: 'account',
    priority: 'urgent',
    daysAgo: 0.3,
    status: 'open',
    agentIndex: 3,
    customerIndex: 1,
    slaHours: 1,
    messages: [
      { authorType: 'customer', body: 'Our executive team got locked out of the enterprise console after 2FA was required. We need admin session reset asap.' }
    ]
  },
  {
    subject: 'Hardware sensor package delayed in customs transit',
    description: 'Tracking number EXP-994821 shows shipment stuck in customs for 4 business days. Need updated carrier manifest.',
    category: 'shipping',
    priority: 'medium',
    daysAgo: 4,
    status: 'waiting',
    agentIndex: 2,
    customerIndex: 5,
    slaHours: 24,
    messages: [
      { authorType: 'customer', body: 'Tracking number EXP-994821 shows shipment stuck in customs for 4 business days. Need updated carrier manifest.' },
      { authorType: 'agent', body: 'We contacted DHL Express international brokerage. They requested an updated commercial invoice which we just uploaded.' },
      { authorType: 'customer', body: 'Understood. Please let us know when customs releases the crate.' }
    ]
  },
  {
    subject: 'How to configure custom webhook authentication headers?',
    description: 'We are integrating webhooks into our internal ERP. Is there documentation on signing webhook payloads with HMAC SHA-256?',
    category: 'technical',
    priority: 'low',
    daysAgo: 6,
    status: 'closed',
    agentIndex: 4,
    customerIndex: 10,
    slaHours: 72,
    messages: [
      { authorType: 'customer', body: 'We are integrating webhooks into our internal ERP. Is there documentation on signing webhook payloads with HMAC SHA-256?' },
      { authorType: 'agent', body: 'Hi Kenji, you can find our complete cryptographic signing specification and code samples at /docs/webhooks/security.' },
      { authorType: 'customer', body: 'Exactly what we needed. Thanks!' }
    ]
  },
  {
    subject: 'Discrepancy in annual enterprise discount calculation',
    description: 'Our signed contract guarantees a 20% volume rebate on exceeding 50,000 monthly active users. The latest invoice did not reflect this.',
    category: 'billing',
    priority: 'medium',
    daysAgo: 5,
    status: 'in_progress',
    agentIndex: 0,
    customerIndex: 3,
    slaHours: 24,
    messages: [
      { authorType: 'customer', body: 'Our signed contract guarantees a 20% volume rebate on exceeding 50,000 monthly active users. The latest invoice did not reflect this.' },
      { authorType: 'agent', body: 'Checking with our enterprise accounts manager to review the schedule addendum.' }
    ]
  },
  {
    subject: 'SSO SAML certificate expiration notice',
    description: 'Our Okta identity metadata certificate expires in 3 days. Need assistance updating the X.509 certificate on your end without downtime.',
    category: 'account',
    priority: 'high',
    daysAgo: 2,
    status: 'open',
    agentIndex: 1,
    customerIndex: 6,
    slaHours: 4,
    messages: [
      { authorType: 'customer', body: 'Our Okta identity metadata certificate expires in 3 days. Need assistance updating the X.509 certificate on your end without downtime.' }
    ]
  },
  {
    subject: 'Damaged shipment container on arrival at distribution hub',
    description: 'Pallet arrived with water damage on outer boxes. Need replacement units dispatched and RMA claim initiated.',
    category: 'shipping',
    priority: 'urgent',
    daysAgo: 7,
    status: 'resolved',
    agentIndex: 2,
    customerIndex: 8,
    slaHours: 1,
    messages: [
      { authorType: 'customer', body: 'Pallet arrived with water damage on outer boxes. Need replacement units dispatched and RMA claim initiated.' },
      { authorType: 'agent', body: 'Claim RMA-4401 filed. Replacement batch dispatched via priority air freight.' },
      { authorType: 'customer', body: 'Replacements received in pristine condition. Ticket can be closed.' }
    ]
  },
  {
    subject: 'Request for vendor SOC2 Type II compliance audit report',
    description: 'Our security team requires your latest annual SOC 2 Type II report and third-party penetration test summary for compliance vendor review.',
    category: 'general',
    priority: 'low',
    daysAgo: 8,
    status: 'resolved',
    agentIndex: 0,
    customerIndex: 13,
    slaHours: 72,
    messages: [
      { authorType: 'customer', body: 'Our security team requires your latest annual SOC 2 Type II report and third-party penetration test summary for compliance vendor review.' },
      { authorType: 'agent', body: 'Sent our NDA-covered security package to your security email address via secure transfer.' },
      { authorType: 'customer', body: 'Received and forwarded to our compliance officer. Thank you.' }
    ]
  },
  {
    subject: 'Critical: Database query timeouts causing page latency spikes',
    description: 'Multiple reports from regional teams about dashboard spinning indefinitely. Queries to /api/v2/analytics are timing out after 30 seconds.',
    category: 'technical',
    priority: 'urgent',
    daysAgo: 0.5,
    status: 'in_progress',
    agentIndex: 1,
    customerIndex: 0,
    slaHours: 1,
    messages: [
      { authorType: 'customer', body: 'Multiple reports from regional teams about dashboard spinning indefinitely. Queries to /api/v2/analytics are timing out after 30 seconds.' },
      { authorType: 'agent', body: 'We identified an unindexed composite query created during this morning’s migration. Adding background index now.' }
    ]
  },
  {
    subject: 'Updating billing tax exempt certificate for 2026',
    description: 'Attached our renewed state tax exemption certificate. Please update our billing profile so future invoices exclude sales tax.',
    category: 'billing',
    priority: 'low',
    daysAgo: 9,
    status: 'closed',
    agentIndex: 0,
    customerIndex: 7,
    slaHours: 72,
    messages: [
      { authorType: 'customer', body: 'Attached our renewed state tax exemption certificate. Please update our billing profile so future invoices exclude sales tax.' },
      { authorType: 'agent', body: 'Tax exemption certificate processed and approved. Tax will be exempt on all recurring invoices.' }
    ]
  },
  {
    subject: 'Cannot unlock user account after 5 failed password attempts',
    description: 'User r.taylor@luminahealth.org is locked out. Self-service unlock email did not arrive in spam or inbox.',
    category: 'account',
    priority: 'medium',
    daysAgo: 1.5,
    status: 'open',
    agentIndex: 3,
    customerIndex: 3,
    slaHours: 24,
    messages: [
      { authorType: 'customer', body: 'User r.taylor@luminahealth.org is locked out. Self-service unlock email did not arrive in spam or inbox.' }
    ]
  },
  {
    subject: 'Delivery address correction before warehouse dispatch',
    description: 'Order #90212 has incorrect suite number. Please update shipping address to Suite 400B before FedEx pickup at 3pm today.',
    category: 'shipping',
    priority: 'high',
    daysAgo: 1,
    status: 'in_progress',
    agentIndex: 2,
    customerIndex: 9,
    slaHours: 4,
    messages: [
      { authorType: 'customer', body: 'Order #90212 has incorrect suite number. Please update shipping address to Suite 400B before FedEx pickup at 3pm today.' },
      { authorType: 'agent', body: 'Intercepted package at dispatch bay. Label re-printed with Suite 400B.' }
    ]
  },
  {
    subject: 'Mobile app crash on iOS 18 device launch',
    description: 'Users running iOS 18 report instant crash on splash screen. Crashlytics indicates null reference in auth handshake.',
    category: 'technical',
    priority: 'high',
    daysAgo: 3.5,
    status: 'waiting',
    agentIndex: 4,
    customerIndex: 11,
    slaHours: 4,
    messages: [
      { authorType: 'customer', body: 'Users running iOS 18 report instant crash on splash screen. Crashlytics indicates null reference in auth handshake.' },
      { authorType: 'agent', body: 'We have prepared test build v2.4.1 (build 88) on TestFlight. Could you invite a few affected users to test?' }
    ]
  },
  {
    subject: 'Need VAT invoice breakdown for quarterly filing',
    description: 'Our accounting department needs European VAT receipts separated by member country for Q3.',
    category: 'billing',
    priority: 'medium',
    daysAgo: 11,
    status: 'resolved',
    agentIndex: 0,
    customerIndex: 12,
    slaHours: 24,
    messages: [
      { authorType: 'customer', body: 'Our accounting department needs European VAT receipts separated by member country for Q3.' },
      { authorType: 'agent', body: 'Detailed VAT itemized report has been generated and sent to your billing address.' }
    ]
  },
  {
    subject: 'General inquiry on data retention policies',
    description: 'Where can we review the automatic log purge schedule and GDPR data processing terms for archived tickets?',
    category: 'general',
    priority: 'low',
    daysAgo: 10,
    status: 'closed',
    agentIndex: 3,
    customerIndex: 14,
    slaHours: 72,
    messages: [
      { authorType: 'customer', body: 'Where can we review the automatic log purge schedule and GDPR data processing terms for archived tickets?' },
      { authorType: 'agent', body: 'Our trust center and DPA agreement are published at /privacy/dpa. Default retention is 90 days with custom options available.' }
    ]
  },
  {
    subject: 'SLA Breached: Urgent server connectivity blackout',
    description: 'Our primary gateway lost peering connection. SLA deadline passed with no recovery yet.',
    category: 'technical',
    priority: 'urgent',
    daysAgo: 2,
    status: 'open',
    agentIndex: 1,
    customerIndex: 4,
    slaHours: 1,
    breached: true,
    messages: [
      { authorType: 'customer', body: 'Our primary gateway lost peering connection. SLA deadline passed with no recovery yet.' }
    ]
  },
  {
    subject: 'Incorrect currency billed on multi-national account',
    description: 'We were billed in USD instead of EUR as specified in our European branch master service agreement.',
    category: 'billing',
    priority: 'medium',
    daysAgo: 8,
    status: 'resolved',
    agentIndex: 0,
    customerIndex: 12,
    slaHours: 24,
    messages: [
      { authorType: 'customer', body: 'We were billed in USD instead of EUR as specified in our European branch master service agreement.' },
      { authorType: 'agent', body: 'Currency preference has been set to EUR and foreign exchange adjustment credited to next invoice.' }
    ]
  },
  {
    subject: 'Tracking shows delivered but package not in mailroom',
    description: 'Carrier status shows signed by J. Doe at 10:14am, but our front desk has no record of delivery.',
    category: 'shipping',
    priority: 'high',
    daysAgo: 0.8,
    status: 'in_progress',
    agentIndex: 2,
    customerIndex: 7,
    slaHours: 4,
    messages: [
      { authorType: 'customer', body: 'Carrier status shows signed by J. Doe at 10:14am, but our front desk has no record of delivery.' },
      { authorType: 'agent', body: 'Opened direct trace with carrier dispatch. Driver confirms dropping off at adjacent loading dock 4B by mistake.' }
    ]
  },
  {
    subject: 'How to revoke API key permissions for departing employee?',
    description: 'An administrator is leaving today. We need to revoke their specific scoped token without invalidating production worker keys.',
    category: 'account',
    priority: 'medium',
    daysAgo: 1.2,
    status: 'resolved',
    agentIndex: 3,
    customerIndex: 0,
    slaHours: 24,
    messages: [
      { authorType: 'customer', body: 'An administrator is leaving today. We need to revoke their specific scoped token without invalidating production worker keys.' },
      { authorType: 'agent', body: 'You can navigate to Settings -> API Tokens -> Select the token tagged with their user ID -> Click "Revoke Immediately".' },
      { authorType: 'customer', body: 'Done and verified. Thanks for the quick response!' }
    ]
  }
];

// Generate ~40 tickets by expanding variations
function generateAllTickets() {
  const all = [...TICKET_TEMPLATES];
  const variations = [
    { subject: 'Error 502 Bad Gateway during load spike', cat: 'technical', prio: 'high', status: 'open', daysAgo: 0.4 },
    { subject: 'Failed recurring subscription charge notification', cat: 'billing', prio: 'medium', status: 'in_progress', daysAgo: 2.1 },
    { subject: 'Courier delayed delivery due to adverse weather', cat: 'shipping', prio: 'low', status: 'waiting', daysAgo: 4.5 },
    { subject: 'Single Sign-On login loop on Chrome browser', cat: 'account', prio: 'high', status: 'resolved', daysAgo: 5.2 },
    { subject: 'Question regarding custom SLA enterprise tiers', cat: 'general', prio: 'low', status: 'closed', daysAgo: 12.0 },
    { subject: 'Urgent: Payment gateway returning invalid signature', cat: 'billing', prio: 'urgent', status: 'in_progress', daysAgo: 0.2 },
    { subject: 'Memory leak in worker background process', cat: 'technical', prio: 'high', status: 'open', daysAgo: 1.8 },
    { subject: 'Package missing required hazardous material label', cat: 'shipping', prio: 'medium', status: 'resolved', daysAgo: 7.1 },
    { subject: 'Reset admin email address for parent organization', cat: 'account', prio: 'medium', status: 'waiting', daysAgo: 3.3 },
    { subject: 'Export all billing history to CSV format', cat: 'billing', prio: 'low', status: 'closed', daysAgo: 13.5 },
    { subject: 'WebSocket disconnects every 60 seconds on client', cat: 'technical', prio: 'medium', status: 'in_progress', daysAgo: 2.7 },
    { subject: 'SLA Breached: Critical export job stuck in queue', cat: 'technical', prio: 'urgent', status: 'open', daysAgo: 1.9, breached: true },
    { subject: 'Wrong item received in shipment order #8841', cat: 'shipping', prio: 'high', status: 'resolved', daysAgo: 6.4 },
    { subject: 'Cannot add new team member seat to organization', cat: 'account', prio: 'low', status: 'open', daysAgo: 0.9 },
    { subject: 'Feedback on new dashboard UI navigation redesign', cat: 'general', prio: 'low', status: 'closed', daysAgo: 9.0 },
    { subject: 'Outage: Cloud storage buckets returning 403 Forbidden', cat: 'technical', prio: 'urgent', status: 'resolved', daysAgo: 3.0 },
    { subject: 'Chargeback inquiry from customer card issuer', cat: 'billing', prio: 'high', status: 'in_progress', daysAgo: 1.1 },
    { subject: 'International express shipping estimate inquiry', cat: 'shipping', prio: 'low', status: 'closed', daysAgo: 11.2 },
    { subject: 'Two-factor SMS verification code not arriving', cat: 'account', prio: 'urgent', status: 'resolved', daysAgo: 4.8 },
    { subject: 'Bug in PDF report generator truncating tables', cat: 'technical', prio: 'medium', status: 'waiting', daysAgo: 2.4 }
  ];

  variations.forEach((v, idx) => {
    all.push({
      subject: v.subject,
      description: `Detailed description for "${v.subject}". Encountered during normal operations. Assistance requested.`,
      category: v.cat,
      priority: v.prio,
      daysAgo: v.daysAgo,
      status: v.status,
      agentIndex: idx % 5,
      customerIndex: idx % DEMO_CUSTOMERS.length,
      slaHours: v.prio === 'urgent' ? 1 : v.prio === 'high' ? 4 : v.prio === 'medium' ? 24 : 72,
      breached: v.breached || false,
      messages: [
        { authorType: 'customer', body: `Detailed description for "${v.subject}". Encountered during normal operations.` },
        ...(v.status !== 'open' ? [{ authorType: 'agent', body: 'Reviewing this ticket and looking into relevant logs.' }] : [])
      ]
    });
  });

  return all;
}

async function seedDatabase() {
  const agents = await Agent.find().sort({ email: 1 });
  if (agents.length === 0) {
    throw new Error('Please ensure agents are initialized before seeding.');
  }

  // 1. Create or ensure customers
  const createdCustomers = [];
  for (const c of DEMO_CUSTOMERS) {
    let customer = await Customer.findOne({ email: c.email });
    if (!customer) {
      customer = await Customer.create(c);
    }
    createdCustomers.push(customer);
  }

  // 2. Prepare and insert tickets
  const ticketsToSeed = generateAllTickets();
  const now = Date.now();
  let createdCount = 0;

  for (const item of ticketsToSeed) {
    const customer = createdCustomers[item.customerIndex % createdCustomers.length];
    const agent = agents[item.agentIndex % agents.length];

    const seq = await Counter.getNextSequence('ticketId');
    const ticketId = `TKT-${seq}`;

    const createdTime = new Date(now - item.daysAgo * 24 * 60 * 60 * 1000);
    const slaDueAt = new Date(createdTime.getTime() + item.slaHours * 60 * 60 * 1000);
    const isBreached = item.breached || (slaDueAt < new Date() && !['resolved', 'closed'].includes(item.status));

    const messages = item.messages.map((m, mIdx) => ({
      author: m.authorType === 'customer' ? customer.name : agent.name,
      authorType: m.authorType,
      body: m.body,
      createdAt: new Date(createdTime.getTime() + (mIdx + 1) * 30 * 60 * 1000),
    }));

    const history = [
      {
        action: 'created',
        from: '',
        to: 'open',
        by: customer.name,
        at: createdTime,
      },
      {
        action: 'assignee_changed',
        from: 'Unassigned',
        to: agent.name,
        by: 'System Dispatch',
        at: new Date(createdTime.getTime() + 5 * 60 * 1000),
      },
    ];

    if (item.status !== 'open') {
      history.push({
        action: 'status_changed',
        from: 'open',
        to: item.status,
        by: agent.name,
        at: new Date(createdTime.getTime() + 45 * 60 * 1000),
      });
    }

    if (isBreached) {
      history.push({
        action: 'sla_breached',
        from: 'active',
        to: 'breached',
        by: 'SLA Worker',
        at: slaDueAt,
      });
    }

    const ticket = new Ticket({
      ticketId,
      subject: item.subject,
      description: item.description,
      customer: customer._id,
      assignedAgent: agent._id,
      status: item.status,
      priority: item.priority,
      category: item.category,
      slaDueAt,
      slaBreached: isBreached,
      messages,
      history,
      demo: true,
      createdAt: createdTime,
      updatedAt: new Date(createdTime.getTime() + 90 * 60 * 1000),
    });

    await ticket.save();
    createdCount++;
  }

  return {
    customersCount: createdCustomers.length,
    ticketsCount: createdCount,
  };
}

async function clearDemoData() {
  const ticketsResult = await Ticket.deleteMany({ demo: true });
  const customersResult = await Customer.deleteMany({ demo: true });
  return {
    deletedTickets: ticketsResult.deletedCount,
    deletedCustomers: customersResult.deletedCount,
  };
}

module.exports = {
  seedDatabase,
  clearDemoData,
};
