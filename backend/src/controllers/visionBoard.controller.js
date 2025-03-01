import VisionBoard from "../models/VisionBoard.js";

// ✅ Create a new vision board
export const createVisionBoard = async (req, res) => {
  try {
    const { userId, title, category, privacy, items } = req.body;

    const newBoard = new VisionBoard({ userId, title, category, privacy, items });
    await newBoard.save();

    res.status(201).json({ message: "Vision board created successfully", board: newBoard });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Get all vision boards for a user
export const getUserVisionBoards = async (req, res) => {
  try {
    const boards = await VisionBoard.find({ userId: req.params.userId });
    res.status(200).json(boards);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Get a single vision board by ID
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

const getAISuggestedImage = async (category) => {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            { role: "system", content: "You are an AI that suggests motivational images for vision boards." },
            { role: "user", content: `Suggest a suitable image URL for the category: ${category}.` },
          ],
        },
        { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
      );
  
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error("AI Image Suggestion Error:", error);
      return null;
    }
  };

  const getAISuggestedQuote = async (category) => {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            { role: "system", content: "You are an AI that provides motivational quotes." },
            { role: "user", content: `Give me an inspiring quote for the category: ${category}.` },
          ],
        },
        { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
      );
  
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error("AI Quote Suggestion Error:", error);
      return "Stay positive and work hard!";
    }
  };
  