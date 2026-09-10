import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/algoflow';

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Plagiarism DB] Connected to MongoDB at ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error: any) {
    console.warn(`[Plagiarism DB] MongoDB connection error: ${error.message}`);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[Plagiarism DB] MongoDB disconnected.');
  });
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('[Plagiarism DB] MongoDB disconnected cleanly.');
};
