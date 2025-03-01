import express from "express";
import {
  createVisionBoard,
  getUserVisionBoards,
  updateVisionBoard,
  deleteVisionBoard,
  getVisionBoardById,
} from "../controllers/visionBoardController.js";

const router = express.Router();

router.post("/add", createVisionBoard); // Create Vision Board
router.get("/:userId", getUserVisionBoards); // Get all boards for a user
router.get("/board/:boardId", getVisionBoardById); // Get a single board
router.put("/update/:boardId", updateVisionBoard); // Update Vision Board
router.delete("/delete/:boardId", deleteVisionBoard); // Delete Vision Board

export default router;
