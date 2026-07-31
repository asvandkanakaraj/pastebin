import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (status >= 500) {
    logger.error(`[Internal Server Error]: ${message}\nStack: ${err.stack || err}`);
  } else {
    logger.warn(`[Client Error] ${err.name || 'Error'} (${status}): ${message}`);
  }

  res.status(status).json({
    error: err.name || 'InternalServerError',
    message,
    details: err.details || null,
  });
}
