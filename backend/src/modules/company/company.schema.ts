import { z } from 'zod';

export const updateCompanySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  city: z.string().min(1).optional(),
  whatsappNumber: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number').optional(),
});
