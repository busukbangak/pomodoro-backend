import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  settings: {
    pomodoroDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    autoStartBreak: boolean;
    autoStartPomodoro: boolean;
  };
  stats: {
    completed: Array<{
      taskId?: string;
      projectId?: string;
      timestamp: Date;
    }>;
  };
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  settings: {
    pomodoroDuration: { type: Number, default: 25 },
    shortBreakDuration: { type: Number, default: 5 },
    longBreakDuration: { type: Number, default: 15 },
    autoStartBreak: { type: Boolean, default: false },
    autoStartPomodoro: { type: Boolean, default: false },
  },
  stats: {
    completed: [
      {
        taskId: { type: String },
        projectId: { type: String },
        timestamp: { type: Date, required: true },
      },
    ],
  },
});

export default mongoose.model<IUser>("User", UserSchema);