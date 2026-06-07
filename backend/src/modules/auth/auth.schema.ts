import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const registerSchema = z.object({
  companyName: z.string().min(2, 'Company name must be 2–100 characters').max(100),
  fullName: z.string().min(2, 'Full name must be 2–100 characters').max(100),
  email: z.string().email('Enter a valid email').toLowerCase().trim(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  password: passwordSchema,
});

export const verifyOtpSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  code: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
});

export const resendOtpSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email().toLowerCase().trim(),
    code: z.string().length(6).regex(/^\d{6}$/),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const onboardingSchema = z.object({
  name: z.string().min(2, 'Company name must be 2–100 characters').max(100),
  city: z.string().min(1, 'City is required'),
  whatsapp: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
});
