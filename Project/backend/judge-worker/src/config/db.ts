import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/algoflow';

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Judge DB] Connected to MongoDB at ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error: any) {
    console.warn(`[Judge DB] MongoDB connection error: ${error.message}. Worker will retry on job processing.`);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[Judge DB] MongoDB disconnected.');
  });
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('[Judge DB] MongoDB disconnected cleanly.');
};
