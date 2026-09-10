import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

export interface AuthenticatedSocket extends Socket {
  data: {
    user?: IUser;
    userId?: string;
    username?: string;
  };
}

let io: SocketIOServer | null = null;
const JWT_SECRET = process.env.JWT_SECRET || 'algoflow_jwt_secret_dev_key_2026';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

/**
 * Initialize Socket.io server attached to Express HTTP server with JWT Handshake Auth
 */
export const initSocketServer = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || origin === CORS_ORIGIN || origin.startsWith('http://localhost:')) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // JWT Handshake Authentication Middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error: Missing authentication token.'));
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error('Authentication error: User not found.'));
      }

      socket.data = {
        user,
        userId: user._id.toString(),
        username: user.username,
      };

      next();
    } catch (err: any) {
      return next(new Error(`Authentication error: ${err.message}`));
    }
  });

  // Connection Lifecycle
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`[Socket] Client connected: socketId=${socket.id}, user=${socket.data.username} (${socket.data.userId})`);

    // Contest Room Join
    socket.on('join:contest', (contestId: string) => {
      const room = `contest:${contestId}`;
      socket.join(room);
      console.log(`[Socket] User ${socket.data.username} joined room: ${room}`);
      socket.emit('joined:contest', { contestId, room });
    });

    // Contest Room Leave
    socket.on('leave:contest', (contestId: string) => {
      const room = `contest:${contestId}`;
      socket.leave(room);
      console.log(`[Socket] User ${socket.data.username} left room: ${room}`);
      socket.emit('left:contest', { contestId, room });
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client disconnected: socketId=${socket.id}, reason=${reason}`);
    });
  });

  return io;
};

/**
 * Get active Socket.io instance
 */
export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io server has not been initialized.');
  }
  return io;
};

/**
 * Emit real-time event to all clients in a contest room
 */
export const emitToContest = (contestId: string, event: string, data: any): void => {
  if (!io) return;
  const room = `contest:${contestId}`;
  io.to(room).emit(event, data);
  console.log(`[Socket Broadcast] Emitted '${event}' to ${room}`);
};

/**
 * Global broadcast to all connected clients across the platform
 */
export const broadcastGlobal = (event: string, data: any): void => {
  if (!io) return;
  io.emit(event, data);
};

/**
 * Return total active socket connections count
 */
export const getActiveConnectionsCount = (): number => {
  if (!io) return 0;
  return io.sockets.sockets.size;
};
