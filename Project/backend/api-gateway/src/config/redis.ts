import Redis from 'ioredis';
import logger from '../logger';

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
  logger.info('[Redis] Connected to Redis server successfully.');
});

redisClient.on('error', (err) => {
  logger.warn({ err: err.message }, '[Redis] Redis error or server unreachable');
});

export const connectRedis = async (): Promise<void> => {
  try {
    if (redisClient.status !== 'ready' && redisClient.status !== 'connecting') {
      await redisClient.connect();
    }
  } catch (error: any) {
    logger.warn({ err: error.message }, `[Redis] Note: Redis server at ${redisUrl} not currently active.`);
  }
};
