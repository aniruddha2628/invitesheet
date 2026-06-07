import { Request, Response, NextFunction } from 'express';
import * as smsService from './sms.service.js';
import { AppError } from '../../utils/ownershipCheck.js';

/** GET /api/v1/events/:eventId/sms/preview */
export async function previewSMSHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const recipientType = (req.query.recipientType as string) || 'all-sheets';
    const data = await smsService.previewSMS(req.params.eventId, req.user.userId, recipientType);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** POST /api/v1/events/:eventId/sms */
export async function sendSMSHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const data = await smsService.sendSMS(req.params.eventId, req.user.userId, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
