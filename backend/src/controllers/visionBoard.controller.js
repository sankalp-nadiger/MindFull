import VisionBoard from "../models/visionBoard.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
export const createVisionBoard = async (req, res) => {
  try {
    // Handle image upload first
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }
    
    // Construct the URL to the uploaded file
    const imageUrl = req.file?.path; // For single file upload
const boardImg = await uploadOnCloudinary(imageUrl, { folder: 'Mindfull' });
console.log(boardImg.url)
    // Get vision board data from request body
    const { userId, title, category, type } = req.body
    
    // Validate required fields
    if (!userId || !title) {
      return res.status(400).json({ message: "Missing required fields" });
    }
      
    // Create and save the vision board
    const newBoard = new VisionBoard({
      userId,
      title,
      category,
      type,
      content: boardImg.url
    });
    
    await newBoard.save();
    
    res.status(201).json({
      message: "Vision board created successfully with uploaded image",
      board: newBoard,
      uploadedImageUrl: boardImg
    });
  } catch (error) {
    console.error("Error creating vision board with image:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

export const getUserVisionBoards = async (req, res) => {
  try {
    const boards = await VisionBoard.find({ userId: req.params.userId });
    res.status(200).json(boards);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

//Get a single vision board by ID
export const getVisionBoardById = async (req, res) => {
  try {
    const board = await VisionBoard.findById(req.params.boardId);
    if (!board) return res.status(404).json({ message: "Vision board not found" });

    res.status(200).json(board);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Update vision board
export const updateVisionBoard = async (req, res) => {
  try {
    const { title, category, privacy, items } = req.body;

    const updatedBoard = await VisionBoard.findByIdAndUpdate(
      req.params.boardId,
      { title, category, privacy, items },
      { new: true }
    );

    if (!updatedBoard) return res.status(404).json({ message: "Vision board not found" });

    res.status(200).json({ message: "Vision board updated successfully", board: updatedBoard });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Delete vision board
export const deleteVisionBoard = async (req, res) => {
  try {
    const deletedBoard = await VisionBoard.findByIdAndDelete(req.params.boardId);
    if (!deletedBoard) return res.status(404).json({ message: "Vision board not found" });

    res.status(200).json({ message: "Vision board deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
export const getAISuggestedImage = async (req, res) => {
  try {
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({ success: false, message: "Category is required" });
    }

    // Generate Pollinations image URL
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      `motivational image, ${category}, aesthetic, mental wellness theme, hd, digital art`
    )}`;

    return res.status(200).json({ success: true, imageUrl });
  } catch (error) {
    console.error("AI Image Generation Error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate image" });
  }
};

/**
 * Fetch AI-generated motivational quote using Google Gemini API.
 */
export const getAISuggestedQuote = async (category) => {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: `You are an AI that provides motivational quotes for using in a vision board creation feature for a mental wellness platform. 
                Give an inspiring quote for the category: ${category}. Keep it short` }
            ]
          }
        ]
      }
    );

    return response.data.candidates[0]?.content?.parts[0]?.text.trim() || "Stay positive and work hard!";
  } catch (error) {
    console.error("AI Quote Suggestion Error:", error);
    return "Stay positive and work hard!";
  }
};
  