import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number').optional(),
});

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, 'Current password is required'),
    next: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirm: z.string(),
  })
  .refine((data) => data.next === data.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

export const deleteAccountSchema = z.object({
  confirmText: z.string(),
});
