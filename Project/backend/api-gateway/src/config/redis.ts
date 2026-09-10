import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
  lazyConnect: true,
});

redisClient.on('connect', () => {
  console.log('[Redis] Connected to Redis server successfully.');
});

redisClient.on('error', (err) => {
  console.warn('[Redis] Redis error or server unreachable:', err.message);
});

export const connectRedis = async (): Promise<void> => {
  try {
    if (redisClient.status !== 'ready' && redisClient.status !== 'connecting') {
      await redisClient.connect();
    }
  } catch (error: any) {
    console.warn(`[Redis] Note: Redis server at ${redisUrl} not currently active. Submission queuing will fail until Redis starts: ${error.message}`);
  }
};
