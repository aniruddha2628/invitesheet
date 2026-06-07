import { Request, Response, NextFunction } from 'express';
import ExcelJS from 'exceljs';
import { Event } from '../events/event.model.js';
import { Sheet } from '../sheets/sheet.model.js';
import { Guest } from '../guests/guest.model.js';
import { AppError } from '../../utils/ownershipCheck.js';

/** GET /api/v1/events/:eventId/export — Generate and download .xlsx */
export async function exportEventHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');

    const event = await Event.findOne({ _id: req.params.eventId, userId: req.user.userId, isDeleted: false });
    if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found.');

    const sheets = await Sheet.find({ eventId: event._id }).sort({ order: 1 }).lean();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'InviteSheet';
    workbook.created = new Date();

    for (const sheet of sheets) {
      const worksheet = workbook.addWorksheet(sheet.name);

      // Build column headers
      const lockedCols = [
        { header: 'Sr No', key: 'srNo', width: 8 },
        { header: 'Guest Name', key: 'name', width: 25 },
        { header: 'Contact', key: 'contact', width: 18 },
        { header: 'Check In', key: 'checkIn', width: 10 },
      ];

      const defaultCols = event.defaultColumns.map((col) => ({
        header: col.charAt(0).toUpperCase() + col.slice(1),
        key: col,
        width: 15,
      }));

      const customCols = (sheet.columnConfig?.customColumns || []).map((cc) => ({
        header: cc.label,
        key: cc.key,
        width: 15,
      }));

      worksheet.columns = [...lockedCols, ...defaultCols, ...customCols];

      // Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF10B981' },
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      // Populate rows
      const guests = await Guest.find({ sheetId: sheet._id, isHidden: false }).sort({ srNo: 1 }).lean();

      for (const guest of guests) {
        const row: any = {
          srNo: guest.srNo,
          name: guest.name,
          contact: guest.contact,
          checkIn: guest.checkIn ? 'Yes' : 'No',
          status: guest.status,
          idType: guest.idType,
          pax: guest.pax,
          roomNo: guest.roomNo,
          travel: guest.travel,
          arrival: guest.arrival,
          departure: guest.departure,
          comments: guest.comments,
        };

        // Add custom fields
        if (guest.customFields) {
          const cf = guest.customFields instanceof Map
            ? Object.fromEntries(guest.customFields)
            : guest.customFields;
          for (const [key, value] of Object.entries(cf as Record<string, string>)) {
            row[key] = value;
          }
        }

        worksheet.addRow(row);
      }

      // Auto-filter
      if (guests.length > 0) {
        worksheet.autoFilter = {
          from: { row: 1, column: 1 },
          to: { row: guests.length + 1, column: worksheet.columns.length },
        };
      }
    }

    // Set response headers
    const filename = `${event.name.replace(/[^a-zA-Z0-9\s-]/g, '')}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response stream
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
}
