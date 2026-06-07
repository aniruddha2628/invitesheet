import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import {
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  onboardingSchema,
} from './auth.schema.js';
import * as ctrl from './auth.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

// ── Per-route rate limiters ──

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again later.' } },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many registration attempts. Please try again later.' } },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many reset attempts. Please try again later.' } },
});

const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests.' } },
});

// ── Routes ──

/** POST /api/v1/auth/register — Create a new account and send OTP */
router.post('/register', registerLimiter, validate({ body: registerSchema }), ctrl.registerHandler);

/** POST /api/v1/auth/verify-otp — Verify email OTP and get tokens */
router.post('/verify-otp', authLimiter, validate({ body: verifyOtpSchema }), ctrl.verifyOtpHandler);

/** POST /api/v1/auth/resend-otp — Resend verification OTP (30s cooldown) */
router.post('/resend-otp', authLimiter, validate({ body: resendOtpSchema }), ctrl.resendOtpHandler);

/** POST /api/v1/auth/login — Login with email + password */
router.post('/login', authLimiter, validate({ body: loginSchema }), ctrl.loginHandler);

/** POST /api/v1/auth/logout — Revoke refresh token */
router.post('/logout', requireAuth, ctrl.logoutHandler);

/** POST /api/v1/auth/refresh — Rotate refresh token and get new access token */
router.post('/refresh', refreshLimiter, ctrl.refreshHandler);

/** POST /api/v1/auth/forgot-password — Send password reset OTP */
router.post('/forgot-password', forgotPasswordLimiter, validate({ body: forgotPasswordSchema }), ctrl.forgotPasswordHandler);

/** POST /api/v1/auth/reset-password — Reset password with OTP */
router.post('/reset-password', authLimiter, validate({ body: resetPasswordSchema }), ctrl.resetPasswordHandler);

/** POST /api/v1/auth/onboarding — Set up company profile (multipart/form-data) */
router.post('/onboarding', requireAuth, upload.single('logo'), validate({ body: onboardingSchema }), ctrl.onboardingHandler);

export default router;
