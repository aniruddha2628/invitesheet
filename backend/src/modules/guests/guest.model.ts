import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGuest extends Document {
  _id: Types.ObjectId;
  sheetId: Types.ObjectId;
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  srNo: number;
  name: string;
  contact: string;
  checkIn: boolean;
  status: 'Confirmed' | 'Not Coming' | 'VIP' | 'Dont Call' | 'Wrong Number' | 'Pending' | '';
  idType: 'Aadhaar' | 'Passport' | 'Voter ID' | 'Driving Licence' | 'Other' | 'Pending' | '';
  pax: number | null;
  roomNo: string;
  travel: 'By Train' | 'By Flight' | 'By Car' | 'By Bus' | 'Not Decided' | '';
  arrival: string;
  departure: string;
  comments: string;
  isHidden: boolean;
  customFields: Map<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const guestSchema = new Schema<IGuest>(
  {
    sheetId: {
      type: Schema.Types.ObjectId,
      ref: 'Sheet',
      required: true,
      index: true,
    },
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
    srNo: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      default: '',
      trim: true,
    },
    contact: {
      type: String,
      default: '',
      trim: true,
    },
    checkIn: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Not Coming', 'VIP', 'Dont Call', 'Wrong Number', 'Pending', ''],
      default: '',
    },
    idType: {
      type: String,
      enum: ['Aadhaar', 'Passport', 'Voter ID', 'Driving Licence', 'Other', 'Pending', ''],
      default: '',
    },
    pax: {
      type: Number,
      default: null,
    },
    roomNo: {
      type: String,
      default: '',
      trim: true,
    },
    travel: {
      type: String,
      enum: ['By Train', 'By Flight', 'By Car', 'By Bus', 'Not Decided', ''],
      default: '',
    },
    arrival: {
      type: String,
      default: '',
    },
    departure: {
      type: String,
      default: '',
    },
    comments: {
      type: String,
      default: '',
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    customFields: {
      type: Map,
      of: String,
      default: () => new Map(),
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
guestSchema.index({ sheetId: 1, eventId: 1 });
guestSchema.index({ eventId: 1, userId: 1 });

export const Guest = mongoose.model<IGuest>('Guest', guestSchema);
