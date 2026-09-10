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
    const shutdown = async () => {
      console.log('\n[Contest Service] Initiating graceful shutdown...');
      try {
        contestLifecycle.stop();
        io.close();
        httpServer.close(() => {
          console.log('[Contest Service] HTTP Server stopped.');
        });
        await disconnectDB();
        await redisClient.quit();
        console.log('[Contest Service] All services terminated safely.');
        process.exit(0);
      } catch (err) {
        console.error('[Contest Service] Error during shutdown:', err);
        process.exit(1);
      }
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error: any) {
    console.error('[Contest Service] Fatal startup error:', error);
    process.exit(1);
  }
};

startServer();

export default app;
