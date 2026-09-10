import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/algoflow';

  try {
    mongoose.set('strictQuery', true);
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB connected successfully to ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error);
    // In production we would exit, in local dev we log warning so gateway can still operate
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB connection disconnected.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[Database] MongoDB connection error event:', err);
  });
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('[Database] MongoDB disconnected cleanly.');
};
