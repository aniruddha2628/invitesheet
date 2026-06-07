import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICompany extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  city: string;
  whatsappNumber: string;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    whatsappNumber: {
      type: String,
      required: true,
      trim: true,
    },
    logoUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Company = mongoose.model<ICompany>('Company', companySchema);
