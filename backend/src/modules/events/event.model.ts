import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEvent extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  location: string;
  eventType: 'Wedding' | 'Corporate' | 'Social' | 'Other';
  startDate: Date;
  endDate: Date;
  defaultColumns: string[];
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },
    eventType: {
      type: String,
      enum: ['Wedding', 'Corporate', 'Social', 'Other'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    defaultColumns: {
      type: [String],
      default: ['pax', 'arrival', 'departure', 'idType', 'travel', 'status'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model<IEvent>('Event', eventSchema);
