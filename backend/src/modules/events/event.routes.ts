import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import { createEventSchema, updateEventSchema, eventParamsSchema, listEventsQuerySchema } from './event.schema.js';
import * as ctrl from './event.controller.js';

const router = Router();

/** GET /api/v1/events — List all events with stats */
router.get('/', requireAuth, validate({ query: listEventsQuerySchema }), ctrl.listEventsHandler);

/** POST /api/v1/events — Create a new event */
router.post('/', requireAuth, validate({ body: createEventSchema }), ctrl.createEventHandler);

/** GET /api/v1/events/:eventId — Get single event with sheets */
router.get('/:eventId', requireAuth, validate({ params: eventParamsSchema }), ctrl.getEventHandler);

/** PATCH /api/v1/events/:eventId — Update event */
router.patch('/:eventId', requireAuth, validate({ params: eventParamsSchema, body: updateEventSchema }), ctrl.updateEventHandler);

/** DELETE /api/v1/events/:eventId — Soft delete event */
router.delete('/:eventId', requireAuth, validate({ params: eventParamsSchema }), ctrl.deleteEventHandler);

export default router;
