import { Request, Response, NextFunction } from 'express';
import * as userService from './user.service.js';
import { AppError } from '../../utils/ownershipCheck.js';

/** GET /api/v1/users/me */
export async function getMeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const data = await userService.getMe(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** GET /api/v1/users/me/dashboard-stats */
export async function getDashboardStatsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const data = await userService.getDashboardStats(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/v1/users/me */
export async function updateMeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const data = await userService.updateMe(req.user.userId, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/v1/users/me/password */
export async function changePasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const data = await userService.changePassword(req.user.userId, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** GET /api/v1/users/me/export */
export async function exportDataHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const data = await userService.exportData(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/v1/users/me */
export async function deleteAccountHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const data = await userService.deleteAccount(req.user.userId, req.body.confirmText);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      path: '/api/v1/auth/refresh',
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
