import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = new Redis(redisUrl, {
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
  lazyConnect: true,
});

redisClient.on('connect', () => {
  console.log('[Plagiarism Redis] Connected to Redis successfully.');
});

redisClient.on('error', (err) => {
  console.warn('[Plagiarism Redis] Redis notice:', err.message);
});

export const connectRedis = async (): Promise<void> => {
  try {
    if (redisClient.status !== 'ready' && redisClient.status !== 'connecting') {
      await redisClient.connect();
    }
  } catch (error: any) {
    console.warn(`[Plagiarism Redis] Redis not reachable at ${redisUrl}: ${error.message}`);
  }
};
