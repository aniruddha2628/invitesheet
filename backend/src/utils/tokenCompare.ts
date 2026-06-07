import crypto from 'crypto';

/**
 * Timing-safe comparison for tokens and OTP codes.
 * Uses crypto.timingSafeEqual to prevent timing attacks.
 * Returns false if lengths differ (but still takes constant time).
 */
export function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf-8');
    const bufB = Buffer.from(b, 'utf-8');

    if (bufA.length !== bufB.length) {
      // Compare against itself to take constant time even on length mismatch
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }

    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
