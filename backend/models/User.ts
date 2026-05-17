import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'teacher' | 'student';
  profileImage?: string;
  studentId?: string; // Specific to student
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // optional for OAuth or custom flows
    role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
    profileImage: { type: String },
    studentId: { type: String },
    department: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
