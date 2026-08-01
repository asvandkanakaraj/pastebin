import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  if (err.name === 'ZodError' || err.issues) {
    status = 400;
    if (Array.isArray(err.issues)) {
      message = err.issues.map((issue: any) => issue.message).join(', ');
      details = err.issues;
    }
  }

  if (status >= 500) {
    logger.error(`[Internal Server Error]: ${message}\nStack: ${err.stack || err}`);
  } else {
    logger.warn(`[Client Error] ${err.name || 'Error'} (${status}): ${message}`);
  }

  res.status(status).json({
    error: err.name || 'InternalServerError',
    message,
    details,
  });
}
