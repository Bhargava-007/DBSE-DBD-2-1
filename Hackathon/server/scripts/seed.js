require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const initEssentials = require('../src/initEssentials');
const { seedDatabase } = require('../src/utils/seedData');

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/supportdesk';
  console.log(`Connecting to MongoDB at ${uri}...`);
  await mongoose.connect(uri);

  console.log('Ensuring essential agents and SLA policies...');
  await initEssentials();

  console.log('Seeding demo data (15 customers, ~40 realistic tickets)...');
  const result = await seedDatabase();

  console.log(`Successfully seeded:`);
  console.log(`- ${result.customersCount} demo customers`);
  console.log(`- ${result.ticketsCount} demo tickets (tagged demo: true)`);

  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});

