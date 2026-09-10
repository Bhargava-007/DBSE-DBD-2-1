import { Router, Request, Response } from 'express';
import { redisClient } from '../config/redis';
import { getActiveConnectionsCount } from '../socket/SocketManager';
import mongoose from 'mongoose';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  const isRedisOnline = redisClient.status === 'ready' || redisClient.status === 'connect';
  const isMongoOnline = mongoose.connection.readyState === 1;
  const activeSockets = getActiveConnectionsCount();

  res.status(200).json({
    success: true,
    service: 'AlgoFlow Contest & WebSocket Service',
    status: 'online',
    timestamp: new Date().toISOString(),
    connections: {
      mongodb: isMongoOnline ? 'connected' : 'disconnected/standby',
      redis: isRedisOnline ? 'connected' : 'disconnected/standby',
      activeWebSockets: activeSockets,
    },
  });
});

export default router;
