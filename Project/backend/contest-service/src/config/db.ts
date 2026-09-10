import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/algoflow';

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Contest DB] Connected to MongoDB successfully at ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error: any) {
    console.warn(`[Contest DB] MongoDB connection warning: ${error.message}`);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[Contest DB] MongoDB disconnected.');
  });
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('[Contest DB] MongoDB disconnected cleanly.');
};
