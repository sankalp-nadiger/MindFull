import express from "express";
import {
  createVisionBoard,
  getUserVisionBoards,
  updateVisionBoard,
  deleteVisionBoard,
  getVisionBoardById,
  getAISuggestedImage,
  getAISuggestedQuote
} from "../controllers/visionBoard.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { get } from "mongoose";

const router = express.Router();

router.post("/add", upload.single("image"), createVisionBoard); // Create Vision Board
router.get("/:userId", getUserVisionBoards); // Get all boards for a user
router.get("/board/:boardId", getVisionBoardById); // Get a single board
router.put("/update/:boardId", updateVisionBoard); // Update Vision Board
router.delete("/delete/:boardId", deleteVisionBoard); // Delete Vision Board
router.post("/ai-image", getAISuggestedImage);

router.post("/ai-quote", async (req, res) => {
  const { category } = req.body;
  const quote = await getAISuggestedQuote(category);
  res.json({ quote });
});

router.post("/update-vision-board", async (req, res) => {
  const { userId, items } = req.body;
  await updateVisionBoard(userId, { items });
  res.json({ message: "Vision board updated successfully" });
});

export default router;
