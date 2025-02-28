import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  
  // Due date & completion tracking
  dueDate: { type: Date },
  completed: { type: Boolean, default: false },
  completionDate: { type: Date }, // Stores when task was completed

  // Smart Prioritization & Mood Integration
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  stressLevel: { type: String, enum: ["low", "moderate", "high"], default: "moderate" },
  moodLog: { type: String, enum: ["happy", "neutral", "stressed", "anxious", "overwhelmed"] },

  // Adaptive Scheduling & Smart Reminders
  reminderSent: { type: Boolean, default: false },
  snoozeCount: { type: Number, default: 0 }, // Tracks how many times user postponed

  // Task Breakdown Feature (AI Splits tasks into subtasks)
  subtasks: [
    {
      title: { type: String, required: true },
      completed: { type: Boolean, default: false }
    }
  ],

  // Habit Tracking & Repetition Support
  repeatFrequency: { type: String, enum: ["none", "daily", "weekly", "monthly"], default: "none" },
  lastCompleted: { type: Date }, // Tracks last completion for recurring tasks

  // AI-Generated Wellness Breaks
  suggestedBreaks: [{ type: String }], // E.g., "Take a 5-minute meditation break"

  // Gamification & Streak Tracking
  streakCount: { type: Number, default: 0 }, // Number of consecutive days task was completed

  // AI-Based Task Creation Source
  createdByAI: { type: Boolean, default: false }, // True if AI suggested this task

  createdAt: { type: Date, default: Date.now }
});

// Middleware to update streaks
taskSchema.pre("save", function (next) {
  if (this.completed && this.lastCompleted) {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.floor((Date.now() - this.lastCompleted) / oneDay);
    if (diffDays === 1) this.streakCount += 1; // Maintain streak
    else if (diffDays > 1) this.streakCount = 0; // Reset streak
  }
  next();
});

const Task = mongoose.model("Task", taskSchema);

export default Task;
