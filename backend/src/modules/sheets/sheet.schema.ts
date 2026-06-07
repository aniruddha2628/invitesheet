import { z } from 'zod';

export const createSheetSchema = z.object({
  name: z.string().min(1, 'Sheet name is required').max(100),
});

export const updateSheetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isHidden: z.boolean().optional(),
  columnConfig: z.object({
    visibleColumns: z.array(z.string()).optional(),
    columnOrder: z.array(z.string()).optional(),
    customColumns: z.array(z.object({
      key: z.string(),
      label: z.string(),
      type: z.enum(['text', 'dropdown']),
      dropdownOptions: z.array(z.string()).optional(),
      multiSelect: z.boolean().optional(),
    })).optional(),
  }).optional(),
});

export const sheetParamsSchema = z.object({
  eventId: z.string().min(1),
  sheetId: z.string().min(1),
});

export const listSheetsQuerySchema = z.object({
  includeHidden: z.string().transform((v) => v === 'true').default('false'),
});
