import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  userId: string;
  title: string;
  projectId?: string;
  estimatedPomodoros?: number;
  completedPomodoros: number;
  isCompleted: boolean;
  createdAt: Date;
}

const TaskSchema: Schema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  projectId: { type: String },
  estimatedPomodoros: { type: Number },
  completedPomodoros: { type: Number, required: true, default: 0 },
  isCompleted: { type: Boolean, required: true, default: false },
  createdAt: { type: Date, required: true, default: Date.now },
});

export default mongoose.model<ITask>("Task", TaskSchema); 