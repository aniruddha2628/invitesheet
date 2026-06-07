import winston from 'winston';
import * as Sentry from '@sentry/node';
import { env } from '../config/env.js';

/** Scrub PII from log data */
const scrubPII = winston.format((info) => {
  const scrubKeys = ['password', 'passwordHash', 'otp', 'otpHash', 'token', 'accessToken', 'refreshToken', 'refreshTokenHash'];
  if (typeof info.message === 'object' && info.message !== null) {
    for (const key of scrubKeys) {
      if (key in (info.message as Record<string, unknown>)) {
        (info.message as Record<string, unknown>)[key] = '[REDACTED]';
      }
    }
  }
  // Also scrub from meta/splat
  for (const key of scrubKeys) {
    if (key in info) {
      (info as Record<string, unknown>)[key] = '[REDACTED]';
    }
  }
  return info;
});

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    scrubPII(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
            return `${timestamp} [${level}]: ${message}${metaStr}`;
          })
        )
  ),
  transports: [new winston.transports.Console()],
  defaultMeta: { service: 'invitesheet-api' },
});

/** Initialize Sentry with PII scrubbing */
export function initSentry(): void {
  if (env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      beforeSend(event) {
        // Scrub PII from Sentry events
        if (event.request?.cookies) {
          event.request.cookies = {};
        }
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
        return event;
      },
    });
    logger.info('Sentry initialized');
  }
}
