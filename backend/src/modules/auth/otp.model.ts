import mongoose, { Schema, Document } from 'mongoose';

export interface IOTPRecord extends Document {
  email: string;
  otpHash: string;
  type: 'email_verify' | 'password_reset';
  attempts: number;
  issuedAt: Date;
  expiresAt: Date;
}

const otpRecordSchema = new Schema<IOTPRecord>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['email_verify', 'password_reset'],
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index — MongoDB auto-deletes at expiresAt
  },
});

export const OTPRecord = mongoose.model<IOTPRecord>('OTPRecord', otpRecordSchema);
