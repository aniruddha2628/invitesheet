import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import { updateProfileSchema, changePasswordSchema, deleteAccountSchema } from './user.schema.js';
import * as ctrl from './user.controller.js';

const router = Router();

/** GET /api/v1/users/me — Get current user profile */
router.get('/me', requireAuth, ctrl.getMeHandler);

/** PATCH /api/v1/users/me — Update profile (fullName, phone) */
router.patch('/me', requireAuth, validate({ body: updateProfileSchema }), ctrl.updateMeHandler);

/** PATCH /api/v1/users/me/password — Change password */
router.patch('/me/password', requireAuth, validate({ body: changePasswordSchema }), ctrl.changePasswordHandler);

/** GET /api/v1/users/me/export — Export all user data as JSON */
router.get('/me/export', requireAuth, ctrl.exportDataHandler);

/** DELETE /api/v1/users/me — Permanently delete account */
router.delete('/me', requireAuth, validate({ body: deleteAccountSchema }), ctrl.deleteAccountHandler);

export default router;
