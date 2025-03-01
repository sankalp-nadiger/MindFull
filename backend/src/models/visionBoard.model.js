import mongoose from "mongoose";

const visionBoardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  items: [
    {
      type: { type: String, enum: ["image", "quote", "note"], required: true },
      content: { type: String, required: true }, // Image URL or text
      position: { x: Number, y: Number }, // Allows draggable positioning
    },
  ],
  category: {
    type: String,
    enum: ["Health", "Career", "Education", "Relationships", "Finance", "Personal Growth"],
  },
  privacy: { type: String, enum: ["private", "public"], default: "private" },
  createdAt: { type: Date, default: Date.now },
});

const VisionBoard = mongoose.model("VisionBoard", visionBoardSchema);
export default VisionBoard;