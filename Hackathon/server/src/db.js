const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/supportdesk';
  try {
    await mongoose.connect(uri);
    console.log(`[Database] Connected to MongoDB at ${uri}`);
  } catch (err) {
    console.error('[Database] MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

