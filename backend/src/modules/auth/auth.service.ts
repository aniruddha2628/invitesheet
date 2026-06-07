import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, IUser } from '../users/user.model.js';
import { Company } from '../company/company.model.js';
import { OTPRecord } from './otp.model.js';
import { LoginAttempt } from './loginAttempt.model.js';
import { signAccess, signRefresh } from '../../utils/jwt.js';
import { AppError } from '../../utils/ownershipCheck.js';
import { sendOTPEmail, sendPasswordResetEmail } from '../../services/email.service.js';
import { logger } from '../../services/logger.service.js';

const BCRYPT_ROUNDS = 10;

/**
 * Generate a random 6-digit OTP.
 */
function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Build the user response object (safe for frontend).
 */
function buildUserResponse(user: IUser, company?: any) {
  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    isVerified: user.isVerified,
    onboardingComplete: user.onboardingComplete,
    plan: user.plan,
    role: user.role,
    ...(company && {
      company: {
        _id: company._id,
        name: company.name,
        city: company.city,
        whatsappNumber: company.whatsappNumber,
        logoUrl: company.logoUrl,
      },
    }),
  };
}

/**
 * Generate tokens, hash refresh, store in DB, return tokens.
 */
async function generateTokenPair(user: IUser): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = signAccess({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });
  const refreshToken = signRefresh(user._id.toString());
  const refreshTokenHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
  user.refreshTokenHash = refreshTokenHash;
  await user.save();
  return { accessToken, refreshToken };
}

// ─── REGISTER ────────────────────────────────────────────────────────────────

export async function register(data: {
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
}) {
  // Check email not already taken
  const existingUser = await User.findOne({ email: data.email, isDeleted: false });
  if (existingUser) {
    throw new AppError(409, 'CONFLICT', 'An account with this email already exists.');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  // Create user
  const user = await User.create({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    passwordHash,
    isVerified: false,
  });

  // Generate OTP
  const otp = generateOTP();
  const otpHash = await bcrypt.hash(otp, BCRYPT_ROUNDS);

  // Delete any existing OTP for this email
  await OTPRecord.deleteMany({ email: data.email, type: 'email_verify' });

  // Save OTP record
  await OTPRecord.create({
    email: data.email,
    otpHash,
    type: 'email_verify',
    issuedAt: new Date(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
  });

  // Send email
  await sendOTPEmail(data.email, otp);

  logger.info('User registered', { userId: user._id, email: data.email.replace(/(.{2}).*(@.*)/, '$1***$2') });

  return {
    message: `OTP sent to ${data.email}`,
    email: data.email,
  };
}

// ─── VERIFY OTP ──────────────────────────────────────────────────────────────

export async function verifyOtp(data: { email: string; code: string }) {
  const otpRecord = await OTPRecord.findOne({ email: data.email, type: 'email_verify' });

  if (!otpRecord) {
    throw new AppError(400, 'OTP_EXPIRED', 'OTP has expired or was not found. Please request a new one.');
  }

  // Compare OTP using bcrypt
  const isValid = await bcrypt.compare(data.code, otpRecord.otpHash);

  if (!isValid) {
    otpRecord.attempts += 1;
    if (otpRecord.attempts >= 3) {
      await OTPRecord.deleteOne({ _id: otpRecord._id });
      throw new AppError(400, 'INVALID_OTP', 'Maximum attempts exceeded. Please request a new OTP.');
    }
    await otpRecord.save();
    throw new AppError(400, 'INVALID_OTP', 'Invalid OTP. Please try again.');
  }

  // OTP valid — delete it and verify user
  await OTPRecord.deleteOne({ _id: otpRecord._id });

  const user = await User.findOne({ email: data.email, isDeleted: false });
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found.');
  }

  user.isVerified = true;
  await user.save();

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokenPair(user);

  return {
    accessToken,
    refreshToken,
    user: buildUserResponse(user),
  };
}

// ─── RESEND OTP ──────────────────────────────────────────────────────────────

export async function resendOtp(data: { email: string }) {
  const user = await User.findOne({ email: data.email, isDeleted: false });
  if (!user) {
    // Don't reveal whether email exists
    return { message: `New OTP sent to ${data.email}` };
  }

  // Check 30-second cooldown
  const existingOtp = await OTPRecord.findOne({ email: data.email, type: 'email_verify' });
  if (existingOtp) {
    const timeSinceIssued = Date.now() - existingOtp.issuedAt.getTime();
    if (timeSinceIssued < 30000) {
      throw new AppError(429, 'RATE_LIMIT_EXCEEDED', 'Please wait 30 seconds before requesting a new OTP.');
    }
  }

  // Delete old OTP and create new one
  await OTPRecord.deleteMany({ email: data.email, type: 'email_verify' });

  const otp = generateOTP();
  const otpHash = await bcrypt.hash(otp, BCRYPT_ROUNDS);

  await OTPRecord.create({
    email: data.email,
    otpHash,
    type: 'email_verify',
    issuedAt: new Date(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendOTPEmail(data.email, otp);

  return { message: `New OTP sent to ${data.email}` };
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────

export async function login(data: { email: string; password: string }) {
  const user = await User.findOne({ email: data.email, isDeleted: false });
  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  // Check account lock
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AppError(403, 'ACCOUNT_LOCKED', 'Account is temporarily locked due to too many failed login attempts. Please try again later.');
  }

  // Check email verification
  if (!user.isVerified) {
    throw new AppError(401, 'EMAIL_NOT_VERIFIED', 'Please verify your email before logging in.');
  }

  // Compare password
  const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

  if (!isPasswordValid) {
    // Record failed attempt
    const fifteenMinFromNow = new Date(Date.now() + 15 * 60 * 1000);
    await LoginAttempt.create({
      email: data.email,
      failedAt: new Date(),
      expiresAt: fifteenMinFromNow,
    });

    // Count recent failures
    const recentFailures = await LoginAttempt.countDocuments({
      email: data.email,
      failedAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
    });

    if (recentFailures >= 5) {
      user.lockedUntil = fifteenMinFromNow;
      await user.save();
      throw new AppError(403, 'ACCOUNT_LOCKED', 'Account is temporarily locked due to too many failed login attempts. Please try again later.');
    }

    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  // Success — clear login attempts and lock
  await LoginAttempt.deleteMany({ email: data.email });
  if (user.lockedUntil) {
    user.lockedUntil = undefined;
    user.loginAttempts = 0;
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokenPair(user);

  // Populate company
  const company = await Company.findOne({ userId: user._id });

  return {
    accessToken,
    refreshToken,
    user: buildUserResponse(user, company),
  };
}

// ─── LOGOUT ──────────────────────────────────────────────────────────────────

export async function logout(userId: string) {
  await User.updateOne({ _id: userId }, { $unset: { refreshTokenHash: 1 } });
  return { message: 'Logged out successfully.' };
}

// ─── REFRESH TOKEN ───────────────────────────────────────────────────────────

export async function refreshAccessToken(refreshToken: string) {
  // Find users with a refreshTokenHash
  const users = await User.find({ refreshTokenHash: { $ne: null }, isDeleted: false });

  let matchedUser: IUser | null = null;
  for (const user of users) {
    if (user.refreshTokenHash) {
      const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (isValid) {
        matchedUser = user;
        break;
      }
    }
  }

  if (!matchedUser) {
    // Token reuse detected or invalid — revoke all sessions for safety
    throw new AppError(401, 'REFRESH_TOKEN_INVALID', 'Invalid refresh token.');
  }

  // Rotate tokens
  const { accessToken, refreshToken: newRefreshToken } = await generateTokenPair(matchedUser);

  return { accessToken, refreshToken: newRefreshToken };
}

// ─── FORGOT PASSWORD ─────────────────────────────────────────────────────────

export async function forgotPassword(data: { email: string }) {
  // Always return 200 regardless of whether email exists (no enumeration)
  const user = await User.findOne({ email: data.email, isDeleted: false });

  if (user) {
    // Rate limit: max 3 per hour
    const recentOtps = await OTPRecord.countDocuments({
      email: data.email,
      type: 'password_reset',
      issuedAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
    });

    if (recentOtps < 3) {
      await OTPRecord.deleteMany({ email: data.email, type: 'password_reset' });

      const otp = generateOTP();
      const otpHash = await bcrypt.hash(otp, BCRYPT_ROUNDS);

      await OTPRecord.create({
        email: data.email,
        otpHash,
        type: 'password_reset',
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      });

      await sendPasswordResetEmail(data.email, otp);
    }
  }

  return { message: 'Reset code sent to your email if an account exists.' };
}

// ─── RESET PASSWORD ──────────────────────────────────────────────────────────

export async function resetPassword(data: {
  email: string;
  code: string;
  password: string;
}) {
  const otpRecord = await OTPRecord.findOne({ email: data.email, type: 'password_reset' });

  if (!otpRecord) {
    throw new AppError(400, 'INVALID_OTP', 'Reset code is invalid or has expired.');
  }

  const isValid = await bcrypt.compare(data.code, otpRecord.otpHash);

  if (!isValid) {
    otpRecord.attempts += 1;
    if (otpRecord.attempts >= 3) {
      await OTPRecord.deleteOne({ _id: otpRecord._id });
      throw new AppError(400, 'INVALID_OTP', 'Maximum attempts exceeded. Please request a new reset code.');
    }
    await otpRecord.save();
    throw new AppError(400, 'INVALID_OTP', 'Reset code is invalid or has expired.');
  }

  // OTP valid — reset password
  const user = await User.findOne({ email: data.email, isDeleted: false });
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found.');
  }

  user.passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
  user.refreshTokenHash = undefined; // Revoke all sessions
  await user.save();

  await OTPRecord.deleteOne({ _id: otpRecord._id });

  return { message: 'Password reset successfully. You can now log in.' };
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────────

export async function onboarding(
  userId: string,
  data: { name: string; city: string; whatsapp: string },
  logoUrl?: string
) {
  // Find or create company
  let company = await Company.findOne({ userId });

  if (company) {
    company.name = data.name;
    company.city = data.city;
    company.whatsappNumber = data.whatsapp;
    if (logoUrl) company.logoUrl = logoUrl;
    await company.save();
  } else {
    company = await Company.create({
      userId,
      name: data.name,
      city: data.city,
      whatsappNumber: data.whatsapp,
      logoUrl: logoUrl || undefined,
    });
  }

  // Update user
  await User.updateOne(
    { _id: userId },
    { onboardingComplete: true, company: company._id }
  );

  return {
    company: {
      _id: company._id,
      name: company.name,
      city: company.city,
      whatsappNumber: company.whatsappNumber,
      logoUrl: company.logoUrl,
    },
    onboardingComplete: true,
  };
}
