import { Request, Response, NextFunction } from 'express';
import * as guestService from './guest.service.js';
import { AppError } from '../../utils/ownershipCheck.js';

/** POST /api/v1/events/:eventId/sheets/:sheetId/guests/bulk */
export async function bulkGuestsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const data = await guestService.bulkGuests(
      req.params.eventId,
      req.params.sheetId,
      req.user.userId,
      req.body
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/v1/events/:eventId/sheets/:sheetId/guests/:guestId */
export async function updateGuestHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const data = await guestService.updateGuest(
      req.params.eventId,
      req.params.sheetId,
      req.params.guestId,
      req.user.userId,
      req.body
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/v1/events/:eventId/sheets/:sheetId/guests/:guestId */
export async function deleteGuestHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const data = await guestService.deleteGuest(
      req.params.eventId,
      req.params.sheetId,
      req.params.guestId,
      req.user.userId
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/v1/events/:eventId/sheets/:sheetId/guests/bulk */
export async function bulkDeleteGuestsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const data = await guestService.bulkDeleteGuests(
      req.params.eventId,
      req.params.sheetId,
      req.user.userId,
      req.body.guestIds
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/v1/events/:eventId/sheets/:sheetId/guests/bulk-checkin */
export async function bulkCheckinHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const data = await guestService.bulkCheckin(
      req.params.eventId,
      req.params.sheetId,
      req.user.userId,
      req.body
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
