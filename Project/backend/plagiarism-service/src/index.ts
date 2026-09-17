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

    let isShuttingDown = false;
    const shutdown = async (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      console.log(`\n[Plagiarism Service] Received ${signal}. Initiating graceful shutdown...`);

      try {
        // Step 1: Close HTTP server
        await new Promise<void>((resolve) => {
          server.close((err) => {
            if (err) console.warn('[Plagiarism Service] HTTP server close notice:', err.message);
            console.log('[Plagiarism Service] 1. HTTP server closed.');
            resolve();
          });
        });

        // Step 2: Disconnect MongoDB
        try {
          await disconnectDB();
          console.log('[Plagiarism Service] 2. MongoDB disconnected.');
        } catch (dbErr: any) {
          console.warn('[Plagiarism Service] MongoDB disconnect notice:', dbErr.message);
        }

        // Step 3: Disconnect Redis
        try {
          await redisClient.quit();
          console.log('[Plagiarism Service] 3. Redis disconnected.');
        } catch (redisErr: any) {
          console.warn('[Plagiarism Service] Redis disconnect notice:', redisErr.message);
        }

        console.log('[Plagiarism Service] Graceful shutdown completed. Exiting code 0.');
        process.exit(0);
      } catch (err: any) {
        console.error('[Plagiarism Service] Error during shutdown:', err);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error: any) {
    console.error('[Plagiarism Service] Startup error:', error);
    process.exit(1);
  }
};

startServer();

export default app;
