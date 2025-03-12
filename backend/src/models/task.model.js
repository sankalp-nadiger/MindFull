import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  startTime: { type: Date },
  endTime: { type: Date },

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
  maxStreak: { type: Number, default: 0 }, // Maximum streak achieved

  // AI-Based Task Creation Source
  createdByAI: { type: Boolean, default: false }, // True if AI suggested this task

  createdAt: { type: Date, default: Date.now, expires: 86400 } // Automatically deletes after 24 hours (86400 seconds)
});

// Middleware to update streaks
taskSchema.pre("save", function (next) {
  if (this.completed && this.lastCompleted) {
    const lastCompletedDay = new Date(this.lastCompleted).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);

    const diffDays = (today - lastCompletedDay) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      this.streakCount += 1; // Continue streak
    } else if (diffDays > 1) {
      this.streakCount = 1; // Reset streak
    }
    
    // Update max streak if new streak is the highest
    this.maxStreak = Math.max(this.maxStreak, this.streakCount);
  }

  next();
});

const Task = mongoose.model("Task", taskSchema);
export default Task;
