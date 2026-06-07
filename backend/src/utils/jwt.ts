import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
  type: 'refresh';
}

/**
 * Sign a short-lived access token (default 15m).
 */
export function signAccess(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
  };
  return jwt.sign(
    { userId: payload.userId, email: payload.email, role: payload.role },
    env.JWT_ACCESS_SECRET,
    options
  );
}

/**
 * Sign a long-lived refresh token (default 7d).
 */
export function signRefresh(userId: string): string {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  };
  return jwt.sign(
    { userId, type: 'refresh' },
    env.JWT_REFRESH_SECRET,
    options
  );
}

/**
 * Verify and decode an access token.
 * Throws on invalid/expired tokens.
 */
export function verifyAccess(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

/**
 * Verify and decode a refresh token.
 * Throws on invalid/expired tokens.
 */
export function verifyRefresh(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}
