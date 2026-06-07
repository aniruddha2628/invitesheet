import { Request, Response, NextFunction } from 'express';
import { verifyAccess } from '../utils/jwt.js';
import { AppError } from '../utils/ownershipCheck.js';

/**
 * Middleware: Extract Bearer token from Authorization header,
 * verify JWT, and attach decoded payload to req.user.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const payload = verifyAccess(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error: any) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    if (error.name === 'TokenExpiredError') {
      next(new AppError(401, 'TOKEN_EXPIRED', 'Access token has expired.'));
      return;
    }
    if (error.name === 'JsonWebTokenError') {
      next(new AppError(401, 'TOKEN_INVALID', 'Invalid access token.'));
      return;
    }
    next(new AppError(401, 'UNAUTHORIZED', 'Authentication required.'));
  }
}
