import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  sessionId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: 'present' | 'absent' | 'late';
  scannedAt: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  deviceInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['present', 'absent', 'late'], default: 'present' },
    scannedAt: { type: Date, default: Date.now },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    deviceInfo: { type: String },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for the same session and student
AttendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
