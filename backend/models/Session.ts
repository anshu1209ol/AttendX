import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  classId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  date: Date;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  qrCode?: string; // current active QR code hash or token
  qrExpiresAt?: Date;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in meters
  };
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema: Schema = new Schema(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    isActive: { type: Boolean, default: true },
    qrCode: { type: String },
    qrExpiresAt: { type: Date },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      radius: { type: Number, default: 50 }, // Default 50 meters
    },
  },
  { timestamps: true }
);

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
