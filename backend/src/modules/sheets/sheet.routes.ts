import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import { createSheetSchema, updateSheetSchema } from './sheet.schema.js';
import * as ctrl from './sheet.controller.js';

const router = Router({ mergeParams: true });

/** GET /api/v1/events/:eventId/sheets — List sheets with guests */
router.get('/', requireAuth, ctrl.listSheetsHandler);

/** POST /api/v1/events/:eventId/sheets — Create a new sheet */
router.post('/', requireAuth, validate({ body: createSheetSchema }), ctrl.createSheetHandler);

/** PATCH /api/v1/events/:eventId/sheets/:sheetId — Update sheet */
router.patch('/:sheetId', requireAuth, validate({ body: updateSheetSchema }), ctrl.updateSheetHandler);

/** DELETE /api/v1/events/:eventId/sheets/:sheetId — Delete sheet */
router.delete('/:sheetId', requireAuth, ctrl.deleteSheetHandler);

export default router;
