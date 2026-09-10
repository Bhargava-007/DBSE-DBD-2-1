import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Mandatory for BullMQ worker
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
  lazyConnect: true,
});

redisClient.on('connect', () => {
  console.log('[Judge Redis] Connected to Redis server successfully.');
});

redisClient.on('error', (err) => {
  console.warn('[Judge Redis] Redis connection notice:', err.message);
});

export const connectRedis = async (): Promise<void> => {
  try {
    if (redisClient.status !== 'ready' && redisClient.status !== 'connecting') {
      await redisClient.connect();
    }
  } catch (error: any) {
    console.warn(`[Judge Redis] Redis not currently reachable at ${redisUrl}: ${error.message}`);
  }
};
