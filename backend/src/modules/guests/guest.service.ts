import { Guest } from './guest.model.js';
import { Event } from '../events/event.model.js';
import { Sheet } from '../sheets/sheet.model.js';
import { AppError } from '../../utils/ownershipCheck.js';
import { emitGuestUpdated, emitGuestDeleted, emitCounterUpdated } from '../../sockets/index.js';

/**
 * Check if a guest row is empty (no meaningful data).
 */
function isEmptyGuest(guest: any): boolean {
  return (
    (!guest.name || guest.name.trim() === '') &&
    (!guest.contact || guest.contact.trim() === '') &&
    !guest.checkIn &&
    (!guest.status || guest.status === '') &&
    (!guest.idType || guest.idType === '') &&
    guest.pax === null &&
    (!guest.roomNo || guest.roomNo === '') &&
    (!guest.travel || guest.travel === '') &&
    (!guest.arrival || guest.arrival === '') &&
    (!guest.departure || guest.departure === '') &&
    (!guest.comments || guest.comments === '')
  );
}

/**
 * Refresh event counters and emit via Socket.IO.
 */
async function refreshCounters(eventId: string) {
  const [total, checkedIn, notComing, idsPending] = await Promise.all([
    Guest.countDocuments({ eventId, isHidden: false }),
    Guest.countDocuments({ eventId, checkIn: true, isHidden: false }),
    Guest.countDocuments({ eventId, status: 'Not Coming', isHidden: false }),
    Guest.countDocuments({ eventId, idType: 'Pending', isHidden: false }),
  ]);
  emitCounterUpdated(eventId, { total, checkedIn, notComing, idsPending });
}

/**
 * POST /guests/bulk — Bulk replace or upsert guests.
 */
export async function bulkGuests(
  eventId: string,
  sheetId: string,
  userId: string,
  data: { operation: 'replace' | 'upsert'; guests: any[] }
) {
  // Verify event ownership
  const event = await Event.findOne({ _id: eventId, userId, isDeleted: false });
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found.');

  const sheet = await Sheet.findOne({ _id: sheetId, eventId });
  if (!sheet) throw new AppError(404, 'NOT_FOUND', 'Sheet not found.');

  // Filter out empty guests
  const nonEmpty = data.guests.filter((g) => !isEmptyGuest(g));

  let created = 0;
  let updated = 0;

  if (data.operation === 'replace') {
    // Delete all existing guests for this sheet
    await Guest.deleteMany({ sheetId });

    // Insert new guests with sequential srNo
    if (nonEmpty.length > 0) {
      const docs = nonEmpty.map((g, index) => ({
        sheetId,
        eventId,
        userId,
        srNo: index + 1,
        name: g.name || '',
        contact: g.contact || '',
        checkIn: g.checkIn || false,
        status: g.status || '',
        idType: g.idType || '',
        pax: g.pax ?? null,
        roomNo: g.roomNo || '',
        travel: g.travel || '',
        arrival: g.arrival || '',
        departure: g.departure || '',
        comments: g.comments || '',
        customFields: g.customFields || {},
      }));

      await Guest.insertMany(docs);
      created = docs.length;
    }
  } else {
    // Upsert operation
    for (let i = 0; i < nonEmpty.length; i++) {
      const g = nonEmpty[i];
      if (g._id) {
        // Update existing
        await Guest.updateOne(
          { _id: g._id, sheetId },
          {
            $set: {
              name: g.name || '',
              contact: g.contact || '',
              checkIn: g.checkIn || false,
              status: g.status || '',
              idType: g.idType || '',
              pax: g.pax ?? null,
              roomNo: g.roomNo || '',
              travel: g.travel || '',
              arrival: g.arrival || '',
              departure: g.departure || '',
              comments: g.comments || '',
              customFields: g.customFields || {},
              srNo: i + 1,
            },
          }
        );
        updated++;
      } else {
        // Insert new
        await Guest.create({
          sheetId,
          eventId,
          userId,
          srNo: i + 1,
          name: g.name || '',
          contact: g.contact || '',
          checkIn: g.checkIn || false,
          status: g.status || '',
          idType: g.idType || '',
          pax: g.pax ?? null,
          roomNo: g.roomNo || '',
          travel: g.travel || '',
          arrival: g.arrival || '',
          departure: g.departure || '',
          comments: g.comments || '',
          customFields: g.customFields || {},
        });
        created++;
      }
    }
  }

  const total = await Guest.countDocuments({ sheetId, isHidden: false });

  // Refresh counters via Socket.IO
  await refreshCounters(eventId);

  return { created, updated, total };
}

/**
 * PATCH /guests/:guestId — Partial update a single guest.
 */
export async function updateGuest(
  eventId: string,
  sheetId: string,
  guestId: string,
  userId: string,
  data: any
) {
  const event = await Event.findOne({ _id: eventId, userId, isDeleted: false });
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found.');

  const guest = await Guest.findOne({ _id: guestId, sheetId, eventId });
  if (!guest) throw new AppError(404, 'NOT_FOUND', 'Guest not found.');

  const updateFields: any = {};
  const allowedFields = ['name', 'contact', 'checkIn', 'status', 'idType', 'pax', 'roomNo', 'travel', 'arrival', 'departure', 'comments', 'customFields'];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateFields[field] = data[field];
    }
  }

  Object.assign(guest, updateFields);
  await guest.save();

  emitGuestUpdated(eventId, sheetId, guest.toObject());
  if ('checkIn' in updateFields) {
    await refreshCounters(eventId);
  }

  return guest.toObject();
}

/**
 * DELETE /guests/:guestId — Delete single guest.
 */
export async function deleteGuest(
  eventId: string,
  sheetId: string,
  guestId: string,
  userId: string
) {
  const event = await Event.findOne({ _id: eventId, userId, isDeleted: false });
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found.');

  const guest = await Guest.findOne({ _id: guestId, sheetId, eventId });
  if (!guest) throw new AppError(404, 'NOT_FOUND', 'Guest not found.');

  await Guest.deleteOne({ _id: guestId });

  emitGuestDeleted(eventId, sheetId, guestId);
  await refreshCounters(eventId);

  return { message: 'Guest deleted.' };
}

/**
 * DELETE /guests/bulk — Bulk delete guests.
 */
export async function bulkDeleteGuests(
  eventId: string,
  sheetId: string,
  userId: string,
  guestIds: string[]
) {
  const event = await Event.findOne({ _id: eventId, userId, isDeleted: false });
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found.');

  const result = await Guest.deleteMany({
    _id: { $in: guestIds },
    sheetId,
    eventId,
  });

  for (const guestId of guestIds) {
    emitGuestDeleted(eventId, sheetId, guestId);
  }
  await refreshCounters(eventId);

  return { deleted: result.deletedCount };
}

/**
 * PATCH /guests/bulk-checkin — Bulk update check-in status.
 */
export async function bulkCheckin(
  eventId: string,
  sheetId: string,
  userId: string,
  data: { guestIds: string[]; checkIn: boolean }
) {
  const event = await Event.findOne({ _id: eventId, userId, isDeleted: false });
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found.');

  const result = await Guest.updateMany(
    { _id: { $in: data.guestIds }, sheetId, eventId },
    { $set: { checkIn: data.checkIn } }
  );

  await refreshCounters(eventId);

  return { updated: result.modifiedCount };
}
