import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import { bulkGuestsSchema, updateGuestSchema, bulkDeleteSchema, bulkCheckinSchema } from './guest.schema.js';
import * as ctrl from './guest.controller.js';

const router = Router({ mergeParams: true });

/** POST /api/v1/events/:eventId/sheets/:sheetId/guests/bulk — Bulk replace/upsert guests */
router.post('/bulk', requireAuth, validate({ body: bulkGuestsSchema }), ctrl.bulkGuestsHandler);

/** PATCH /api/v1/events/:eventId/sheets/:sheetId/guests/bulk-checkin — Bulk check-in */
router.patch('/bulk-checkin', requireAuth, validate({ body: bulkCheckinSchema }), ctrl.bulkCheckinHandler);

/** DELETE /api/v1/events/:eventId/sheets/:sheetId/guests/bulk — Bulk delete */
router.delete('/bulk', requireAuth, validate({ body: bulkDeleteSchema }), ctrl.bulkDeleteGuestsHandler);

/** PATCH /api/v1/events/:eventId/sheets/:sheetId/guests/:guestId — Update single guest */
router.patch('/:guestId', requireAuth, validate({ body: updateGuestSchema }), ctrl.updateGuestHandler);

/** DELETE /api/v1/events/:eventId/sheets/:sheetId/guests/:guestId — Delete single guest */
router.delete('/:guestId', requireAuth, ctrl.deleteGuestHandler);

export default router;
