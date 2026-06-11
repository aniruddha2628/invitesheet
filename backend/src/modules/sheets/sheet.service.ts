import { Sheet } from './sheet.model.js';
import { Guest } from '../guests/guest.model.js';
import { Event } from '../events/event.model.js';
import { AppError } from '../../utils/ownershipCheck.js';

/**
 * GET /events/:eventId/sheets — List sheets with guests.
 */
export async function listSheets(eventId: string, userId: string, includeHidden: boolean): Promise<any[]> {
  // Verify event ownership
  const event = await Event.findOne({ _id: eventId, userId, isDeleted: false });
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found.');

  const query: any = { eventId };
  if (!includeHidden) {
    query.isHidden = false;
  }

  const sheets = await Sheet.find(query).sort({ order: 1 }).lean();

  // Embed guests for each sheet
  const sheetsWithGuests = await Promise.all(
    sheets.map(async (sheet) => {
      const guests = await Guest.find({ sheetId: sheet._id, isHidden: false }).sort({ srNo: 1 }).lean();
      return { ...sheet, guests };
    })
  );

  return sheetsWithGuests;
}

/**
 * POST /events/:eventId/sheets — Create a new sheet.
 */
export async function createSheet(eventId: string, userId: string, data: { name: string }) {
  // Verify event ownership
  const event = await Event.findOne({ _id: eventId, userId, isDeleted: false });
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found.');

  // Check unique name within event
  const existing = await Sheet.findOne({ eventId, name: data.name });
  if (existing) {
    throw new AppError(409, 'CONFLICT', 'A sheet with this name already exists in this event.');
  }

  // Get max order
  const maxOrderSheet = await Sheet.findOne({ eventId }).sort({ order: -1 });
  const order = maxOrderSheet ? maxOrderSheet.order + 1 : 0;

  const lockedColumns = ['name', 'contact', 'checkIn'];
  const visibleColumns = [...lockedColumns, ...event.defaultColumns];

  const sheet = await Sheet.create({
    eventId,
    userId,
    name: data.name,
    order,
    columnConfig: {
      visibleColumns,
      columnOrder: visibleColumns,
      customColumns: [],
    },
  });

  return { ...sheet.toObject(), guests: [] };
}

/**
 * PATCH /events/:eventId/sheets/:sheetId — Update sheet.
 */
export async function updateSheet(
  eventId: string,
  sheetId: string,
  userId: string,
  data: { name?: string; isHidden?: boolean; columnConfig?: any }
) {
  // Verify event ownership
  const event = await Event.findOne({ _id: eventId, userId, isDeleted: false });
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found.');

  const sheet = await Sheet.findOne({ _id: sheetId, eventId });
  if (!sheet) throw new AppError(404, 'NOT_FOUND', 'Sheet not found.');

  // If name change, check uniqueness
  if (data.name !== undefined && data.name !== sheet.name) {
    const duplicate = await Sheet.findOne({ eventId, name: data.name, _id: { $ne: sheetId } });
    if (duplicate) {
      throw new AppError(409, 'CONFLICT', 'A sheet with this name already exists in this event.');
    }
    sheet.name = data.name;
  }

  if (data.isHidden !== undefined) sheet.isHidden = data.isHidden;
  if (data.columnConfig !== undefined) {
    if (data.columnConfig.visibleColumns) sheet.columnConfig.visibleColumns = data.columnConfig.visibleColumns;
    if (data.columnConfig.columnOrder) sheet.columnConfig.columnOrder = data.columnConfig.columnOrder;
    if (data.columnConfig.customColumns) sheet.columnConfig.customColumns = data.columnConfig.customColumns;
  }

  await sheet.save();

  // Return without guests for performance
  const result = sheet.toObject();
  return result;
}

/**
 * DELETE /events/:eventId/sheets/:sheetId — Delete sheet and its guests.
 */
export async function deleteSheet(eventId: string, sheetId: string, userId: string) {
  // Verify event ownership
  const event = await Event.findOne({ _id: eventId, userId, isDeleted: false });
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found.');

  // Cannot delete last sheet
  const sheetCount = await Sheet.countDocuments({ eventId });
  if (sheetCount <= 1) {
    throw new AppError(400, 'INVALID_REQUEST', 'Cannot delete the last sheet of an event.');
  }

  const sheet = await Sheet.findOne({ _id: sheetId, eventId });
  if (!sheet) throw new AppError(404, 'NOT_FOUND', 'Sheet not found.');

  // Hard delete sheet + all its guests
  await Guest.deleteMany({ sheetId });
  await Sheet.deleteOne({ _id: sheetId });

  return { message: 'Sheet deleted.' };
}
