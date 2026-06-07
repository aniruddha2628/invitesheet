import { Request, Response, NextFunction } from 'express';
import * as eventService from './event.service.js';
import { AppError } from '../../utils/ownershipCheck.js';

/** GET /api/v1/events */
export async function listEventsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const { status, page, limit } = req.query as any;
    const result = await eventService.listEvents(req.user.userId, {
      status: status || 'all',
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
}

/** POST /api/v1/events */
export async function createEventHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const data = await eventService.createEvent(req.user.userId, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** GET /api/v1/events/:eventId */
export async function getEventHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const data = await eventService.getEvent(req.params.eventId, req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/v1/events/:eventId */
export async function updateEventHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const data = await eventService.updateEvent(req.params.eventId, req.user.userId, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/v1/events/:eventId */
export async function deleteEventHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    const data = await eventService.deleteEvent(req.params.eventId, req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
