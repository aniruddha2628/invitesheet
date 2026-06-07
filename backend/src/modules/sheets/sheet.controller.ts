import { Request, Response, NextFunction } from 'express';
import * as sheetService from './sheet.service.js';
import { AppError } from '../../utils/ownershipCheck.js';

/** GET /api/v1/events/:eventId/sheets */
export async function listSheetsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const includeHidden = req.query.includeHidden === 'true';
    const data = await sheetService.listSheets(req.params.eventId, req.user.userId, includeHidden);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** POST /api/v1/events/:eventId/sheets */
export async function createSheetHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const data = await sheetService.createSheet(req.params.eventId, req.user.userId, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/v1/events/:eventId/sheets/:sheetId */
export async function updateSheetHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const data = await sheetService.updateSheet(req.params.eventId, req.params.sheetId, req.user.userId, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/v1/events/:eventId/sheets/:sheetId */
export async function deleteSheetHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const data = await sheetService.deleteSheet(req.params.eventId, req.params.sheetId, req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
