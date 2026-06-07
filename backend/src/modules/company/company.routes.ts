import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import { updateCompanySchema } from './company.schema.js';
import * as ctrl from './company.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

/** PATCH /api/v1/company — Update company profile (multipart/form-data) */
router.patch('/', requireAuth, upload.single('logo'), validate({ body: updateCompanySchema }), ctrl.updateCompanyHandler);

export default router;
