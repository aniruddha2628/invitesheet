import { z } from 'zod';

const guestObjectSchema = z.object({
  _id: z.string().optional(),
  name: z.string().default(''),
  contact: z.string().default(''),
  checkIn: z.boolean().default(false),
  status: z.enum(['Confirmed', 'Not Coming', 'VIP', 'Dont Call', 'Wrong Number', 'Pending', '']).default(''),
  idType: z.enum(['Aadhaar', 'Passport', 'Voter ID', 'Driving Licence', 'Other', 'Pending', '']).default(''),
  pax: z.number().nullable().default(null),
  roomNo: z.string().default(''),
  travel: z.enum(['By Train', 'By Flight', 'By Car', 'By Bus', 'Not Decided', '']).default(''),
  arrival: z.string().default(''),
  departure: z.string().default(''),
  comments: z.string().default(''),
  customFields: z.record(z.string(), z.string()).default({}),
});

export const bulkGuestsSchema = z.object({
  operation: z.enum(['replace', 'upsert']),
  guests: z.array(guestObjectSchema),
});

export const updateGuestSchema = guestObjectSchema.partial();

export const guestParamsSchema = z.object({
  eventId: z.string().min(1),
  sheetId: z.string().min(1),
  guestId: z.string().min(1),
});

export const bulkDeleteSchema = z.object({
  guestIds: z.array(z.string().min(1)),
});

export const bulkCheckinSchema = z.object({
  guestIds: z.array(z.string().min(1)),
  checkIn: z.boolean(),
});
