import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/ownershipCheck.js';

/**
 * Role-based access control middleware.
 * V1: Only 'owner' role exists.
 */
export function roleGuard(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'UNAUTHORIZED', 'Authentication required.'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError(403, 'FORBIDDEN', 'You do not have permission to perform this action.'));
      return;
    }

    next();
  };
}
