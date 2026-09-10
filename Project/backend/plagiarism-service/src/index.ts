import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { connectDB, disconnectDB } from './config/db';
import { connectRedis, redisClient } from './config/redis';
import plagiarismRouter from './routes/plagiarism';

const app = express();
const PORT = process.env.PORT || 4002;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === CORS_ORIGIN || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use('/plagiarism', plagiarismRouter);
app.use('/api/plagiarism', plagiarismRouter);
app.use('/', plagiarismRouter);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route not found: [${req.method}] ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Plagiarism Service Error]', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

const startServer = async () => {
  try {
    console.log('====================================================');
    console.log('🔍 AlgoFlow Plagiarism Detection & Fingerprinting Service');
    console.log('====================================================');

    await connectDB();
    await connectRedis();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Plagiarism Service listening on http://localhost:${PORT}`);
      console.log('====================================================');
    });

    const shutdown = async () => {
      console.log('\n[Plagiarism Service] Shutting down gracefully...');
      server.close(async () => {
        await disconnectDB();
        await redisClient.quit();
        console.log('[Plagiarism Service] All resources closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error: any) {
    console.error('[Plagiarism Service] Startup error:', error);
    process.exit(1);
  }
};

startServer();

export default app;
