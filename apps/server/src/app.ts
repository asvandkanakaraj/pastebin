import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { APP_NAME } from '@pastebin/shared';
import { db } from '@pastebin/database';
import pasteRoutes from './routes/paste.routes.js';
import authRoutes from './routes/auth.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { globalRateLimiter } from './middleware/rate-limit.middleware.js';
import { logger } from './utils/logger.js';

// Resolve directory name for ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();

// Apply Helmet security headers with explicit Content-Security-Policy (CSP)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "http://localhost:5000", "http://localhost:5173"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// Apply Global Rate Limiting
app.use(globalRateLimiter);

// CORS configuration - only allow requests from specific frontend origins
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

app.use(express.json());

// Structured JSON request logging format via Morgan to Winston http level
app.use(
  morgan((tokens, req, res) => {
    const logData = {
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number(tokens.status(req, res)),
      responseTime: tokens['response-time'](req, res) ? `${tokens['response-time'](req, res)} ms` : undefined,
      timestamp: new Date().toISOString(),
      ip: req.ip || req.socket.remoteAddress,
    };
    logger.http(JSON.stringify(logData));
    return null; // Suppress default morgan stdout printing since we redirect to Winston
  })
);

// Advanced Health check endpoint with PostgreSQL connection check
app.get('/health', async (req, res) => {
  const uptime = `${process.uptime().toFixed(2)}s`;
  try {
    // Ping PostgreSQL database using Prisma queryRaw
    await db.$queryRaw`SELECT 1`;

    res.json({
      status: 'up',
      uptime,
      services: {
        database: 'connected',
        api: 'healthy',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error(`Health check failed: ${error.message}`);
    res.status(503).json({
      status: 'down',
      uptime,
      services: {
        database: 'disconnected',
        api: 'healthy',
      },
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// Register API routes
app.use('/api/pastes', pasteRoutes);
app.use('/api/auth', authRoutes);

// Global Error Handler
app.use(errorHandler);

export { app };
