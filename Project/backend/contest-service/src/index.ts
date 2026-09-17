import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { connectDB, disconnectDB } from './config/db';
import { connectRedis, redisClient } from './config/redis';
import { initSocketServer, getIO } from './socket/SocketManager';
import { contestLifecycle } from './contest/ContestLifecycle';

// Routes
import contestsRouter from './routes/contests';
import healthRouter from './routes/health';

const app = express();
const PORT = process.env.PORT || 4001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// 1. Create HTTP Server
const httpServer = http.createServer(app);

// 2. Attach Socket.io Server
const io = initSocketServer(httpServer);

// 3. Global Express Middlewares
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

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// 4. Mount Routes
app.use('/contests', contestsRouter);
app.use('/api/contests', contestsRouter);
app.use('/', healthRouter);

// 5. 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route not found: [${req.method}] ${req.originalUrl}`,
  });
});

// 6. Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Contest Service Error]', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// 7. Startup Sequence
const startServer = async () => {
  try {
    console.log('====================================================');
    console.log('🏆 AlgoFlow Contest & Live Leaderboard Service');
    console.log('====================================================');

    // Connect DB & Redis
    await connectDB();
    await connectRedis();

    // Start automated lifecycle cron job
    contestLifecycle.start();

    // Start HTTP & Socket server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Contest Service & WebSocket listening on http://localhost:${PORT}`);
      console.log(`📡 WebSocket endpoint ready for live leaderboard streaming`);
      console.log('====================================================');
    });

    // Graceful Shutdown
    let isShuttingDown = false;
    const shutdown = async (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      console.log(`\n[Contest Service] Received ${signal}. Initiating graceful shutdown...`);

      try {
        // Step 1: Stop cron & socket, and close HTTP server
        contestLifecycle.stop();
        io.close();
        await new Promise<void>((resolve) => {
          httpServer.close((err) => {
            if (err) console.warn('[Contest Service] HTTP server close notice:', err.message);
            console.log('[Contest Service] 1. HTTP server closed.');
            resolve();
          });
        });

        // Step 2: Disconnect MongoDB
        try {
          await disconnectDB();
          console.log('[Contest Service] 2. MongoDB disconnected.');
        } catch (dbErr: any) {
          console.warn('[Contest Service] MongoDB disconnect notice:', dbErr.message);
        }

        // Step 3: Disconnect Redis
        try {
          await redisClient.quit();
          console.log('[Contest Service] 3. Redis disconnected.');
        } catch (redisErr: any) {
          console.warn('[Contest Service] Redis disconnect notice:', redisErr.message);
        }

        console.log('[Contest Service] Graceful shutdown completed. Exiting code 0.');
        process.exit(0);
      } catch (err: any) {
        console.error('[Contest Service] Error during shutdown:', err);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error: any) {
    console.error('[Contest Service] Fatal startup error:', error);
    process.exit(1);
  }
};

startServer();

export default app;
