const Agent = require('./models/Agent');
const SlaPolicy = require('./models/SlaPolicy');

const DEFAULT_AGENTS = [
  { name: 'Sarah Chen', email: 'sarah.chen@supportdesk.internal', role: 'admin', active: true, demo: false },
  { name: 'Alex Rivera', email: 'alex.rivera@supportdesk.internal', role: 'agent', active: true, demo: false },
  { name: 'Marcus Vance', email: 'marcus.vance@supportdesk.internal', role: 'agent', active: true, demo: false },
  { name: 'Priya Patel', email: 'priya.patel@supportdesk.internal', role: 'agent', active: true, demo: false },
  { name: 'Jordan Lee', email: 'jordan.lee@supportdesk.internal', role: 'agent', active: true, demo: false },
];

const DEFAULT_SLA_POLICIES = [
  { priority: 'urgent', durationMinutes: 60, description: 'Urgent priority - 1 hour response/resolution SLA' },
  { priority: 'high', durationMinutes: 240, description: 'High priority - 4 hours response/resolution SLA' },
  { priority: 'medium', durationMinutes: 1440, description: 'Medium priority - 24 hours response/resolution SLA' },
  { priority: 'low', durationMinutes: 4320, description: 'Low priority - 72 hours response/resolution SLA' },
];

const initEssentials = async () => {
  try {
    // 1. Ensure 5 default agents exist
    for (const agentData of DEFAULT_AGENTS) {
      const exists = await Agent.findOne({ email: agentData.email });
      if (!exists) {
        await Agent.create(agentData);
      }
    }

    // 2. Ensure 4 SLA policies exist
    for (const policy of DEFAULT_SLA_POLICIES) {
      const exists = await SlaPolicy.findOne({ priority: policy.priority });
      if (!exists) {
        await SlaPolicy.create(policy);
      }
    }

    console.log('[Init] Essential system agents and SLA policies checked/initialized.');
  } catch (err) {
    console.error('[Init] Error initializing essentials:', err.message);
  }
};

module.exports = initEssentials;

