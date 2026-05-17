import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  name: string;
  code: string;
  description?: string;
  teacher: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  day?: string;
  time?: string;
  room?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    day: { type: String },
    time: { type: String },
    room: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema);
