import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/ownershipCheck.js';
import { logger } from '../services/logger.service.js';

/**
 * Central error handler — always the last middleware.
 * Maps error types to the standard response shape.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // AppError — known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.fields && { fields: err.fields }),
      },
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const fields: Record<string, string[]> = {};
    const mongooseErr = err as any;
    if (mongooseErr.errors) {
      for (const [key, val] of Object.entries(mongooseErr.errors)) {
        fields[key] = [(val as any).message];
      }
    }
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed.',
        fields,
      },
    });
    return;
  }

  // Mongoose duplicate key error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const keyPattern = (err as any).keyPattern || {};
    const field = Object.keys(keyPattern)[0] || 'unknown';
    res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: `A record with this ${field} already exists.`,
      },
    });
    return;
  }

  // Mongoose CastError (bad ObjectId etc)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Invalid resource identifier.',
      },
    });
    return;
  }

  // Unknown errors — log and return generic 500
  console.error('🔴 UNHANDLED ERROR:', err);
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
    },
  });
}
