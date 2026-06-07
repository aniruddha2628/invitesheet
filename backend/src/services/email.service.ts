import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.service.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

/**
 * Send a verification OTP email.
 */
export async function sendOTPEmail(to: string, otp: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"InviteSheet" <${env.EMAIL_FROM}>`,
      to,
      subject: 'Verify your InviteSheet account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #10b981;">InviteSheet</h2>
          <p>Your verification code is:</p>
          <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #065f46;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
    logger.info('OTP email sent', { to: to.replace(/(.{2}).*(@.*)/, '$1***$2') });
  } catch (error) {
    logger.error('Failed to send OTP email', { error });
    throw error;
  }
}

/**
 * Send a password reset OTP email.
 */
export async function sendPasswordResetEmail(to: string, otp: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"InviteSheet" <${env.EMAIL_FROM}>`,
      to,
      subject: 'Reset your InviteSheet password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #10b981;">InviteSheet</h2>
          <p>You requested a password reset. Your reset code is:</p>
          <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #92400e;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code expires in <strong>15 minutes</strong>. Do not share it with anyone.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">If you didn't request this, your account is safe — just ignore this email.</p>
        </div>
      `,
    });
    logger.info('Password reset email sent', { to: to.replace(/(.{2}).*(@.*)/, '$1***$2') });
  } catch (error) {
    logger.error('Failed to send password reset email', { error });
    throw error;
  }
}
