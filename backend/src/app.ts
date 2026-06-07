import express from 'express';
import * as Sentry from '@sentry/node';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env.js';
import { isDBConnected } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import companyRoutes from './modules/company/company.routes.js';
import eventRoutes from './modules/events/event.routes.js';
import sheetRoutes from './modules/sheets/sheet.routes.js';
import guestRoutes from './modules/guests/guest.routes.js';
import smsRoutes from './modules/sms/sms.routes.js';
import exportRoutes from './modules/export/export.routes.js';

const app = express();

// ── 1. Sentry request handler — must be first ──
if (env.SENTRY_DSN) {
  app.use(Sentry.Handlers.requestHandler());
}

// ── 2. Helmet — security headers ──
app.use(helmet());

// ── 3. CORS ──
app.use(
  cors({
    origin: env.CORS_ORIGINS.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

// ── 4. Body parsers ──
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── 5. Cookie parser ──
app.use(cookieParser());

// ── 6. Mongo sanitize — strips $ and . from req.body/query/params ──
app.use(mongoSanitize());

// ── 7. Morgan — HTTP request logging (dev only) ──
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health endpoints (no auth, no rate limiting) ──

/** GET /health → 200 */
app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

/** GET /ready → 200 if DB connected, else 503 */
app.get('/ready', (_req, res) => {
  if (isDBConnected()) {
    res.status(200).json({ success: true, data: { status: 'ok' } });
  } else {
    res.status(503).json({
      success: false,
      error: { code: 'SERVICE_UNAVAILABLE', message: 'Database not connected' },
    });
  }
});

// ── 8. Global rate limiter: 100 req/min on /api ──
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again later.' },
  },
});

app.use('/api', globalLimiter);

// ── 9. Route mounts under /api/v1 ──
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/events/:eventId/sheets', sheetRoutes);
app.use('/api/v1/events/:eventId/sheets/:sheetId/guests', guestRoutes);
app.use('/api/v1/events/:eventId/sms', smsRoutes);
app.use('/api/v1/events/:eventId/export', exportRoutes);

// ── 404 handler ──
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'The requested endpoint does not exist.' },
  });
});

// ── 10. Sentry error handler ──
if (env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// ── 11. Central error handler — always last ──
app.use(errorHandler);

export default app;
