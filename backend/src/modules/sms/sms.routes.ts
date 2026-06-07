import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { requireAuth } from '../../middleware/requireAuth.js';
import * as ctrl from './sms.controller.js';

const router = Router({ mergeParams: true });

const smsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'SMS sending limit reached. Max 5 per event per hour.' } },
});

/** GET /api/v1/events/:eventId/sms/preview — Preview SMS recipients */
router.get('/preview', requireAuth, ctrl.previewSMSHandler);

/** POST /api/v1/events/:eventId/sms — Send SMS */
router.post('/', requireAuth, smsLimiter, ctrl.sendSMSHandler);

export default router;
