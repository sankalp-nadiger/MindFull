import mongoose from "mongoose";

const visionBoardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
 
      type: { type: String, enum: ["image", "quote", "note"] },
      content: { type: String, required: true }, // Image URL or text
   
  category: {
    type: String,
    enum: ["Health", "Career", "Education", "Relationships", "Finance", "Personal Growth"],
  },
  createdAt: { type: Date, default: Date.now },
});

const VisionBoard = mongoose.model("VisionBoard", visionBoardSchema);
export default VisionBoard;