import dotenv from 'dotenv';
// Load environment variables before any other imports
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db';
import { connectRedis, redisClient } from './config/redis';

// Route Imports
import authRoutes from './routes/auth';
import problemsRoutes from './routes/problems';
import submissionsRoutes from './routes/submissions';
import contestsRoutes from './routes/contests';

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// 1. Global Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, postman) or matching frontend
      if (!origin || origin === CORS_ORIGIN || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev mode
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 2. Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 300 : 3000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP address. Please try again later.',
  },
});

app.use('/api/', globalLimiter);

// 3. Health & System Telemetry Endpoint
app.get('/health', async (_req: Request, res: Response) => {
  const isRedisActive = redisClient.status === 'ready' || redisClient.status === 'connect';
  res.status(200).json({
    success: true,
    service: 'AlgoFlow API Gateway',
    timestamp: new Date().toISOString(),
    status: 'online',
    redis: isRedisActive ? 'connected' : 'disconnected/standby',
  });
});

app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to AlgoFlow Online Code Judge API Gateway v1.0',
    endpoints: {
      auth: '/api/auth',
      problems: '/api/problems',
      submissions: '/api/submissions',
      contests: '/api/contests',
      health: '/health',
    },
  });
});

// 4. Mount Domain Routers
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/contests', contestsRoutes);

// 5. 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route not found: [${req.method}] ${req.originalUrl}`,
  });
});

// 6. Global Unhandled Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Global Error Handler]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// 7. Server Initialization
const startServer = async () => {
  try {
    // Initialize DB Connection
    await connectDB();

    // Initialize Redis Client
    await connectRedis();

    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🚀 AlgoFlow API Gateway running on http://localhost:${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔒 CORS Origin: ${CORS_ORIGIN}`);
      console.log('====================================================');
    });

    // Graceful Shutdown
    const shutdown = () => {
      console.log('\n[Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[Server] Failed to initialize server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
