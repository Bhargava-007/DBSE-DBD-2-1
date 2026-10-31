require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { clearDemoData } = require('../src/utils/seedData');

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/supportdesk';
  console.log(`Connecting to MongoDB at ${uri}...`);
  await mongoose.connect(uri);

  console.log('Clearing all demo documents (where demo: true)...');
  const result = await clearDemoData();

  console.log(`Successfully cleared:`);
  console.log(`- ${result.deletedTickets} demo tickets deleted`);
  console.log(`- ${result.deletedCustomers} demo customers deleted`);

  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Clear error:', err);
  process.exit(1);
});
