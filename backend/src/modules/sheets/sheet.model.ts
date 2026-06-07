import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICustomColumn {
  key: string;
  label: string;
  type: 'text' | 'dropdown';
  dropdownOptions?: string[];
  multiSelect?: boolean;
}

export interface IColumnConfig {
  visibleColumns: string[];
  columnOrder: string[];
  customColumns: ICustomColumn[];
}

export interface ISheet extends Document {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  order: number;
  isHidden: boolean;
  columnConfig: IColumnConfig;
  createdAt: Date;
  updatedAt: Date;
}

const customColumnSchema = new Schema<ICustomColumn>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ['text', 'dropdown'], required: true },
    dropdownOptions: { type: [String] },
    multiSelect: { type: Boolean },
  },
  { _id: false }
);

const columnConfigSchema = new Schema<IColumnConfig>(
  {
    visibleColumns: { type: [String], default: [] },
    columnOrder: { type: [String], default: [] },
    customColumns: { type: [customColumnSchema], default: [] },
  },
  { _id: false }
);

const sheetSchema = new Schema<ISheet>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    columnConfig: {
      type: columnConfigSchema,
      default: () => ({
        visibleColumns: [],
        columnOrder: [],
        customColumns: [],
      }),
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique sheet name per event
sheetSchema.index({ eventId: 1, name: 1 }, { unique: true });

export const Sheet = mongoose.model<ISheet>('Sheet', sheetSchema);
