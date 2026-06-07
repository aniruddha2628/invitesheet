import { z } from 'zod';

export const createEventSchema = z.object({
  name: z.string().min(2, 'Event name must be at least 2 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  eventType: z.enum(['Wedding', 'Corporate', 'Social', 'Other']),
  startDate: z.string().or(z.date()).transform((v) => new Date(v)),
  endDate: z.string().or(z.date()).transform((v) => new Date(v)),
  defaultColumns: z.array(z.string()).optional(),
});

export const updateEventSchema = z.object({
  name: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
  eventType: z.enum(['Wedding', 'Corporate', 'Social', 'Other']).optional(),
  startDate: z.string().or(z.date()).transform((v) => new Date(v)).optional(),
  endDate: z.string().or(z.date()).transform((v) => new Date(v)).optional(),
});

export const eventParamsSchema = z.object({
  eventId: z.string().min(1),
});

export const listEventsQuerySchema = z.object({
  status: z.enum(['upcoming', 'active', 'past', 'all']).default('all'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
