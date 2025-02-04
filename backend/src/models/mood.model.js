import mongoose from "mongoose";
const moodSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mood: {
        type: String,
        enum: ["Happy", "Tired", "Sad", "Neutral", "Anxious", "Excited", "Angry"], // Define allowed moods
        required: true,
      },
    timestamp: { type: Date, default: Date.now }, // When the mood was recorded
  });

export const Mood= new mongoose.model("Mood",moodSchema)