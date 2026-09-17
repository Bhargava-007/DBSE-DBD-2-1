import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './config/db';
import { connectRedis, redisClient } from './config/redis';
import { dockerSandbox } from './sandbox/DockerSandbox';
import { startJudgeWorker } from './worker';

const PORT = process.env.PORT || 4003;

const initWorkerService = async () => {
  console.log('====================================================');
  console.log('⚡ AlgoFlow Judge Worker Service Initializing...');
  console.log('====================================================');

  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Connect Redis
    await connectRedis();

    // 3. Check Docker Engine connectivity
    const isDockerOnline = await dockerSandbox.isDockerAvailable();
    if (isDockerOnline) {
      console.log('🐳 Docker Engine: ONLINE (Local sandbox isolation ready)');
      console.log('[Sandbox] Pre-pulling language images in background...');
      const images = ['gcc:13', 'python:3.12-alpine', 'openjdk:21-alpine', 'node:20-alpine'];
      Promise.all(images.map(img => dockerSandbox.ensureImage(img)))
        .then(() => console.log('[Sandbox] All language images ready.'))
        .catch(err => console.warn('[Sandbox] Image pre-pull notice:', err.message));
    } else {
      console.warn('⚠️  Docker Engine: OFFLINE. C++ and Java submissions will return an error until Docker Desktop is started. Python and JavaScript will execute on host.');
    }

    // 4. Start BullMQ Worker
    const worker = startJudgeWorker();

    // 5. Health Check HTTP Server
    const healthServer = http.createServer(async (req, res) => {
      const url = req.url || '/';
      if (req.method === 'GET' && (url === '/health' || url === '/api/health' || url === '/')) {
        const isMongoOnline = mongoose.connection.readyState === 1;
        const isRedisOnline = redisClient.status === 'ready' || redisClient.status === 'connect';
        const isDockerReady = await dockerSandbox.isDockerAvailable();

        const responsePayload = {
          service: 'judge-worker',
          status: 'ok',
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          mongodb: isMongoOnline ? 'connected' : 'disconnected',
          redis: isRedisOnline ? 'connected' : 'disconnected',
          docker: isDockerReady ? 'online' : 'offline',
          connections: {
            mongodb: isMongoOnline ? 'connected' : 'disconnected',
            redis: isRedisOnline ? 'connected' : 'disconnected',
            docker: isDockerReady ? 'online' : 'offline',
          },
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(responsePayload));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Not Found' }));
      }
    });

    healthServer.listen(PORT, () => {
      console.log(`🚀 Judge Worker Health Server listening on http://localhost:${PORT}`);
    });

    // 6. Graceful Shutdown
    let isShuttingDown = false;
    const shutdown = async (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      console.log(`\n[Judge Worker] Received ${signal}. Initiating graceful shutdown...`);

      try {
        // Step 1: Close HTTP health server
        await new Promise<void>((resolve) => {
          healthServer.close((err) => {
            if (err) console.warn('[Judge Worker] HTTP server close notice:', err.message);
            console.log('[Judge Worker] 1. HTTP server closed.');
            resolve();
          });
        });

        // Step 2: Close BullMQ Worker
        try {
          await worker.close();
          console.log('[Judge Worker] 2. BullMQ worker closed.');
        } catch (workerErr: any) {
          console.warn('[Judge Worker] Worker close notice:', workerErr.message);
        }

        // Step 3: Disconnect MongoDB
        try {
          await disconnectDB();
          console.log('[Judge Worker] 3. MongoDB disconnected.');
        } catch (dbErr: any) {
          console.warn('[Judge Worker] MongoDB disconnect notice:', dbErr.message);
        }

        // Step 4: Disconnect Redis
        try {
          await redisClient.quit();
          console.log('[Judge Worker] 4. Redis disconnected.');
        } catch (redisErr: any) {
          console.warn('[Judge Worker] Redis disconnect notice:', redisErr.message);
        }

        console.log('[Judge Worker] Graceful shutdown completed. Exiting code 0.');
        process.exit(0);
      } catch (err: any) {
        console.error('[Judge Worker] Error during shutdown:', err);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error: any) {
    console.error('[Worker Service] Initialization failure:', error);
    process.exit(1);
  }
};

initWorkerService();
