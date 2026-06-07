import bcrypt from 'bcryptjs';
import { User } from './user.model.js';
import { Company } from '../company/company.model.js';
import { Event } from '../events/event.model.js';
import { Sheet } from '../sheets/sheet.model.js';
import { Guest } from '../guests/guest.model.js';
import { AppError } from '../../utils/ownershipCheck.js';

const BCRYPT_ROUNDS = 10;

/**
 * GET /users/me — Full profile with company and plan limits.
 */
export async function getMe(userId: string) {
  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found.');

  const company = await Company.findOne({ userId });
  const currentEventCount = await Event.countDocuments({ userId, isDeleted: false });

  const maxEvents = user.plan === 'free' ? 2 : Infinity;

  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    isVerified: user.isVerified,
    onboardingComplete: user.onboardingComplete,
    plan: user.plan,
    planLimits: { maxEvents, currentEventCount },
    role: user.role,
    createdAt: user.createdAt,
    company: company
      ? {
          _id: company._id,
          name: company.name,
          city: company.city,
          whatsappNumber: company.whatsappNumber,
          logoUrl: company.logoUrl,
        }
      : null,
  };
}

/**
 * PATCH /users/me — Update profile (fullName, phone only).
 */
export async function updateMe(userId: string, data: { fullName?: string; phone?: string }) {
  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found.');

  if (data.fullName) user.fullName = data.fullName;
  if (data.phone) user.phone = data.phone;
  await user.save();

  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
  };
}

/**
 * PATCH /users/me/password — Change password.
 */
export async function changePassword(
  userId: string,
  data: { current: string; next: string }
) {
  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found.');

  const isValid = await bcrypt.compare(data.current, user.passwordHash);
  if (!isValid) {
    throw new AppError(400, 'INVALID_CREDENTIALS', 'Current password is incorrect.');
  }

  user.passwordHash = await bcrypt.hash(data.next, BCRYPT_ROUNDS);
  user.refreshTokenHash = undefined; // Force re-login on other devices
  await user.save();

  return { message: 'Password updated successfully.' };
}

/**
 * GET /users/me/export — Export all user data as JSON.
 */
export async function exportData(userId: string) {
  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found.');

  const company = await Company.findOne({ userId });
  const events = await Event.find({ userId, isDeleted: false });

  const eventsWithData = await Promise.all(
    events.map(async (event) => {
      const sheets = await Sheet.find({ eventId: event._id });
      const sheetsWithGuests = await Promise.all(
        sheets.map(async (sheet) => {
          const guests = await Guest.find({ sheetId: sheet._id });
          return { ...sheet.toObject(), guests };
        })
      );
      return { ...event.toObject(), sheets: sheetsWithGuests };
    })
  );

  return {
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      plan: user.plan,
      createdAt: user.createdAt,
    },
    company: company?.toObject() || null,
    events: eventsWithData,
  };
}

/**
 * DELETE /users/me — Hard delete account and all data.
 */
export async function deleteAccount(userId: string, confirmText: string) {
  if (confirmText !== 'DELETE MY ACCOUNT') {
    throw new AppError(400, 'CONFIRM_TEXT_MISMATCH', 'Please type "DELETE MY ACCOUNT" to confirm.');
  }

  // Hard delete all data
  await Guest.deleteMany({ userId });
  await Sheet.deleteMany({ userId });
  await Event.deleteMany({ userId });
  await Company.deleteMany({ userId });
  await User.deleteOne({ _id: userId });

  return { message: 'Account permanently deleted.' };
}
