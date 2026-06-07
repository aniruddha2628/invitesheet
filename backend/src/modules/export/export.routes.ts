import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import * as ctrl from './export.controller.js';

const router = Router({ mergeParams: true });

/** GET /api/v1/events/:eventId/export — Download event as .xlsx */
router.get('/', requireAuth, ctrl.exportEventHandler);

export default router;
