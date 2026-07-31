import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { APP_NAME } from '@pastebin/shared';
import pasteRoutes from './routes/paste.routes.js';
import authRoutes from './routes/auth.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { globalRateLimiter } from './middleware/rate-limit.middleware.js';

// Resolve directory name for ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Apply Helmet security headers
app.use(helmet());

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

// Structured JSON request logging format via Morgan
app.use(
  morgan((tokens, req, res) => {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number(tokens.status(req, res)),
      responseTime: tokens['response-time'](req, res) ? `${tokens['response-time'](req, res)} ms` : undefined,
      timestamp: new Date().toISOString(),
      ip: req.ip || req.socket.remoteAddress,
    });
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    app: APP_NAME,
  });
});

// Register API routes
app.use('/api/pastes', pasteRoutes);
app.use('/api/auth', authRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[${APP_NAME}] Server running at http://localhost:${PORT}`);
});
