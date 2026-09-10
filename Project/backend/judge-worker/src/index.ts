import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from './config/db';
import { connectRedis, redisClient } from './config/redis';
import { dockerSandbox } from './sandbox/DockerSandbox';
import { startJudgeWorker } from './worker';

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
    } else {
      console.warn('⚠️  Docker Engine: OFFLINE or socket unreachable. Ensure Docker Desktop / daemon is active for container execution.');
    }

    // 4. Start BullMQ Worker
    const worker = startJudgeWorker();

    // 5. Graceful Shutdown
    const shutdown = async () => {
      console.log('\n[Worker Service] Shutting down gracefully...');
      try {
        await worker.close();
        await disconnectDB();
        await redisClient.quit();
        console.log('[Worker Service] All resources closed cleanly. Exiting.');
        process.exit(0);
      } catch (err) {
        console.error('[Worker Service] Error during shutdown:', err);
        process.exit(1);
      }
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error: any) {
    console.error('[Worker Service] Initialization failure:', error);
    process.exit(1);
  }
};

initWorkerService();
