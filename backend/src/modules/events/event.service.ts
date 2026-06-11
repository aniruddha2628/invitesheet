import { Event, IEvent } from './event.model.js';
import { Sheet } from '../sheets/sheet.model.js';
import { Guest } from '../guests/guest.model.js';
import { User } from '../users/user.model.js';
import { AppError } from '../../utils/ownershipCheck.js';
import { Types } from 'mongoose';

/**
 * Compute event status from dates.
 */
function computeStatus(startDate: Date, endDate: Date): 'upcoming' | 'active' | 'past' {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  if (start > today) return 'upcoming';
  if (end < today) return 'past';
  return 'active';
}

/**
 * GET /events — List events with aggregated stats.
 */
export async function listEvents(
  userId: string,
  options: { status: string; page: number; limit: number }
): Promise<{ data: any[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
  const query: any = { userId, isDeleted: false };
  const events = await Event.find(query).sort({ createdAt: -1 }).lean();

  // Compute status and filter
  let filtered = events.map((ev) => ({
    ...ev,
    status: computeStatus(ev.startDate, ev.endDate),
  }));

  if (options.status !== 'all') {
    filtered = filtered.filter((ev) => ev.status === options.status);
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / options.limit);
  const paginated = filtered.slice(
    (options.page - 1) * options.limit,
    options.page * options.limit
  );

  // Aggregate guest stats for each event
  const enriched = await Promise.all(
    paginated.map(async (ev) => {
      const eventId = ev._id;
      const [totalGuests, checkedIn, notComing, idsPending, sheetCount] = await Promise.all([
        Guest.countDocuments({ eventId, isHidden: false }),
        Guest.countDocuments({ eventId, checkIn: true, isHidden: false }),
        Guest.countDocuments({ eventId, status: 'Not Coming', isHidden: false }),
        Guest.countDocuments({ eventId, idType: 'Pending', isHidden: false }),
        Sheet.countDocuments({ eventId }),
      ]);

      return {
        ...ev,
        totalGuests,
        checkedIn,
        notComing,
        idsPending,
        sheetCount,
      };
    })
  );

  return {
    data: enriched,
    pagination: { total, page: options.page, limit: options.limit, totalPages },
  };
}

/**
 * POST /events — Create event with auto-generated sheets.
 */
export async function createEvent(
  userId: string,
  data: {
    name: string;
    location: string;
    eventType: 'Wedding' | 'Corporate' | 'Social' | 'Other';
    startDate: Date;
    endDate: Date;
    defaultColumns?: string[];
  }
) {
  // Check plan limit
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found.');

  const currentCount = await Event.countDocuments({ userId, isDeleted: false });
  const maxEvents = user.plan === 'free' ? 2 : Infinity;

  if (currentCount >= maxEvents) {
    throw new AppError(403, 'PLAN_LIMIT_REACHED', `Free plan allows up to ${maxEvents} events. Please upgrade to create more.`);
  }

  // Validate endDate >= startDate
  if (data.endDate < data.startDate) {
    throw new AppError(400, 'VALIDATION_ERROR', 'End date must be on or after start date.');
  }

  const defaultCols = data.defaultColumns || ['pax', 'arrival', 'departure', 'idType', 'travel', 'status'];
  console.log('[DEBUG] event.service createEvent', { eventName: data.name, receivedDefaultColumns: data.defaultColumns, resolvedDefaultCols: defaultCols });

  const event = await Event.create({
    userId,
    name: data.name,
    location: data.location,
    eventType: data.eventType,
    startDate: data.startDate,
    endDate: data.endDate,
    defaultColumns: defaultCols,
  });

  // Auto-create sheets based on event type
  const lockedColumns = ['name', 'contact', 'checkIn'];
  const visibleColumns = [...lockedColumns, ...defaultCols];

  let sheetNames: string[];
  switch (data.eventType) {
    case 'Wedding':
      sheetNames = ['Groom Side', 'Bride Side', 'Friends'];
      break;
    default:
      sheetNames = ['Sheet1'];
  }

  const sheets = await Promise.all(
    sheetNames.map((name, index) =>
      Sheet.create({
        eventId: event._id,
        userId,
        name,
        order: index,
        columnConfig: {
          visibleColumns,
          columnOrder: visibleColumns,
          customColumns: [],
        },
      })
    )
  );
  sheets.forEach(s => console.log('[DEBUG] event.service sheetCreated', { sheetName: s.name, visibleColumns: s.columnConfig?.visibleColumns }));

  return {
    _id: event._id,
    name: event.name,
    location: event.location,
    eventType: event.eventType,
    startDate: event.startDate,
    endDate: event.endDate,
    defaultColumns: event.defaultColumns,
    userId: event.userId,
    sheets: sheets.map((s) => ({ _id: s._id, name: s.name, order: s.order })),
    createdAt: event.createdAt,
  };
}

/**
 * GET /events/:eventId — Single event with sheets and stats.
 */
export async function getEvent(eventId: string, userId: string): Promise<any> {
  const event = await Event.findOne({ _id: eventId, userId, isDeleted: false }).lean();
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found.');

  const sheets = await Sheet.find({ eventId: event._id }).sort({ order: 1 }).lean();

  const sheetsWithStats = await Promise.all(
    sheets.map(async (sheet) => {
      const [guestCount, checkedIn] = await Promise.all([
        Guest.countDocuments({ sheetId: sheet._id, isHidden: false }),
        Guest.countDocuments({ sheetId: sheet._id, checkIn: true, isHidden: false }),
      ]);
      return { ...sheet, guestCount, checkedIn };
    })
  );

  const [totalGuests, totalCheckedIn, notComing, idsPending] = await Promise.all([
    Guest.countDocuments({ eventId: event._id, isHidden: false }),
    Guest.countDocuments({ eventId: event._id, checkIn: true, isHidden: false }),
    Guest.countDocuments({ eventId: event._id, status: 'Not Coming', isHidden: false }),
    Guest.countDocuments({ eventId: event._id, idType: 'Pending', isHidden: false }),
  ]);

  return {
    ...event,
    status: computeStatus(event.startDate, event.endDate),
    sheets: sheetsWithStats,
    totals: { totalGuests, checkedIn: totalCheckedIn, notComing, idsPending },
  };
}

/**
 * PATCH /events/:eventId — Update event fields.
 */
export async function updateEvent(
  eventId: string,
  userId: string,
  data: Partial<{ name: string; location: string; eventType: string; startDate: Date; endDate: Date }>
) {
  const event = await Event.findOne({ _id: eventId, userId, isDeleted: false });
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found.');

  if (data.name) event.name = data.name;
  if (data.location) event.location = data.location;
  if (data.eventType) event.eventType = data.eventType as IEvent['eventType'];
  if (data.startDate) event.startDate = data.startDate;
  if (data.endDate) event.endDate = data.endDate;

  // Validate endDate >= startDate if both are set
  if (event.endDate < event.startDate) {
    throw new AppError(400, 'VALIDATION_ERROR', 'End date must be on or after start date.');
  }

  await event.save();

  return {
    _id: event._id,
    name: event.name,
    location: event.location,
    eventType: event.eventType,
    startDate: event.startDate,
    endDate: event.endDate,
    defaultColumns: event.defaultColumns,
    userId: event.userId,
    status: computeStatus(event.startDate, event.endDate),
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

/**
 * DELETE /events/:eventId — Soft delete event + sheets + guests.
 */
export async function deleteEvent(eventId: string, userId: string) {
  const event = await Event.findOne({ _id: eventId, userId, isDeleted: false });
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found.');

  const now = new Date();
  event.isDeleted = true;
  event.deletedAt = now;
  await event.save();

  // Soft delete all sheets and guests for this event
  await Sheet.updateMany({ eventId: event._id }, { isHidden: true });
  await Guest.updateMany({ eventId: event._id }, { isHidden: true });

  return { message: 'Event deleted.' };
}
