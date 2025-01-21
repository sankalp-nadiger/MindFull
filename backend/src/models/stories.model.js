import mongoose from "mongoose";
const { Schema } = mongoose;

const storySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["image", "video"], // Only allow types similar to Instagram stories
    required: true,
  },
  content: {
    type: String, // URL of the image or video
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 24 * 60 * 60, // Automatically delete the story after 24 hours
  },
});

export const Story= mongoose.model("Story", storySchema);
