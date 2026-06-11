import axios from 'axios';
import { Guest } from '../guests/guest.model.js';
import { Event } from '../events/event.model.js';
import { Sheet } from '../sheets/sheet.model.js';
import { AppError } from '../../utils/ownershipCheck.js';
import { env } from '../../config/env.js';
import { logger } from '../../services/logger.service.js';

const FAST2SMS_URL = 'https://www.fast2sms.com/dev/bulkV2';

/**
 * Get filtered recipients based on recipientType.
 */
async function getRecipients(
  eventId: string,
  recipientType: string,
  selectedGuestIds?: string[]
) {
  let query: any = { eventId, isHidden: false };

  switch (recipientType) {
    case 'all-sheets':
      // All guests across all sheets
      break;
    case 'not-checked-in':
      query.checkIn = false;
      break;
    case 'ids-not-received':
      query.idType = 'Pending';
      break;
    case 'not-coming':
      query.status = 'Not Coming';
      break;
    case 'vip-guests':
      query.status = 'VIP';
      break;
    default:
      // Check for sheet-specific: "sheet:{sheetId}"
      if (recipientType.startsWith('sheet:')) {
        const sheetId = recipientType.split(':')[1];
        query.sheetId = sheetId;
      } else if (recipientType === 'selected-rows' && selectedGuestIds) {
        query._id = { $in: selectedGuestIds };
      }
      break;
  }

  return Guest.find(query).lean();
}

/**
 * GET /sms/preview — Preview SMS recipient counts.
 */
export async function previewSMS(eventId: string, userId: string, recipientType: string) {
  const event = await Event.findOne({ _id: eventId, userId, isDeleted: false });
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found.');

  const recipients = await getRecipients(eventId, recipientType);
  const validNumbers = recipients.filter((r) => r.contact && r.contact.trim() !== '');
  const skipped = recipients.length - validNumbers.length;

  return {
    totalRecipients: recipients.length,
    validNumbers: validNumbers.length,
    skipped,
    estimatedSmsCount: validNumbers.length,
  };
}

/**
 * POST /sms — Send SMS via Fast2SMS Quick SMS API.
 */
export async function sendSMS(
  eventId: string,
  userId: string,
  data: { recipientType: string; message: string; selectedGuestIds?: string[] }
) {
  const event = await Event.findOne({ _id: eventId, userId, isDeleted: false });
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found.');

  const recipients = await getRecipients(eventId, data.recipientType, data.selectedGuestIds);
  const validRecipients = recipients.filter((r) => r.contact && r.contact.trim() !== '');
  const skipped = recipients.length - validRecipients.length;

  if (validRecipients.length === 0) {
    return { sent: 0, failed: 0, skipped, failedNames: [] };
  }

  let sent = 0;
  let failed = 0;
  const failedNames: string[] = [];

  // Send in batches (Fast2SMS accepts comma-separated numbers)
  const BATCH_SIZE = 50;

  for (let i = 0; i < validRecipients.length; i += BATCH_SIZE) {
    const batch = validRecipients.slice(i, i + BATCH_SIZE);
    const numbers = batch.map((r) => r.contact.replace(/\D/g, '').slice(-10)).join(',');

    // Replace {name} placeholder — for batch, we use the first name or generic
    // For per-recipient personalization, we'd need to send individually
    // Fast2SMS Quick SMS doesn't support per-number personalization in bulk,
    // so we send individually for personalized messages
    if (data.message.includes('{name}')) {
      // Send individually for personalized messages
      for (const recipient of batch) {
        const personalizedMsg = data.message.replace(/\{name\}/g, recipient.name || 'Guest');
        const phoneNumber = recipient.contact.replace(/\D/g, '').slice(-10);

        if (env.FAST2SMS_DRY_RUN) {
          logger.info('DRY_RUN SMS', { to: phoneNumber.slice(0, 4) + '****', message: personalizedMsg.slice(0, 50) });
          sent++;
          continue;
        }

        try {
          await axios.post(
            FAST2SMS_URL,
            { route: 'q', message: personalizedMsg, numbers: phoneNumber },
            { headers: { authorization: env.FAST2SMS_API_KEY, 'Content-Type': 'application/json' } }
          );
          sent++;
        } catch (error: any) {
          failed++;
          failedNames.push(recipient.name || 'Unknown');
          logger.error('SMS send failed', {
            contact: phoneNumber.slice(0, 4) + '****',
            status: error.response?.status,
            responseData: error.response?.data,
            responseHeaders: error.response?.headers,
            requestUrl: FAST2SMS_URL,
            requestPayload: { route: 'q', messageLength: personalizedMsg.length, numbers: phoneNumber.slice(0, 4) + '****' },
            errorMessage: error.message,
          });
        }
      }
    } else {
      // Send batch for non-personalized messages
      if (env.FAST2SMS_DRY_RUN) {
        logger.info('DRY_RUN batch SMS', { count: batch.length, message: data.message.slice(0, 50) });
        sent += batch.length;
        continue;
      }

      try {
        await axios.post(
          FAST2SMS_URL,
          { route: 'q', message: data.message, numbers },
          { headers: { authorization: env.FAST2SMS_API_KEY, 'Content-Type': 'application/json' } }
        );
        sent += batch.length;
      } catch (error: any) {
        failed += batch.length;
        batch.forEach((r) => failedNames.push(r.name || 'Unknown'));
        logger.error('Batch SMS send failed', {
          batchSize: batch.length,
          status: error.response?.status,
          responseData: error.response?.data,
          responseHeaders: error.response?.headers,
          requestUrl: FAST2SMS_URL,
          requestPayload: { route: 'q', messageLength: data.message.length, numbersCount: batch.length },
          errorMessage: error.message,
        });
      }
    }
  }

  return { sent, failed, skipped, failedNames };
}
