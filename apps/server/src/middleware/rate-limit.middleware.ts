import { Request, Response, NextFunction } from 'express';

const ipCache = new Map<string, { count: number; resetTime: number }>();

export function deleteRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const LIMIT = 5; // Max 5 deletions
  const WINDOW_MS = 60000; // per 1 minute

  const record = ipCache.get(ip);

  if (!record || now > record.resetTime) {
    ipCache.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return next();
  }

  if (record.count >= LIMIT) {
    return res.status(429).json({
      error: 'TooManyRequests',
      message: 'Too many delete requests from this IP. Please try again after 1 minute.',
    });
  }

  record.count += 1;
  next();
}
