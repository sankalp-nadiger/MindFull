import asyncHandler from "../utils/asynchandler.utils.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/API_Response.js";

const addScore = asyncHandler(async (req, res) => {
  const { gameName, score, totalQuestions } = req.body;

  if (!req.user) {
    return res.status(401).json(new ApiResponse(401, null, "User not authenticated"));
  }

  if (!gameName || score === undefined || !totalQuestions) {
    return res.status(400).json(new ApiResponse(400, null, "Missing required fields"));
  }

  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Add new score entry
    const newScore = {
      gameName,
      score,
      totalQuestions,
      playedAt: new Date()
    };

    user.gameScores.push(newScore);
    user.totalScore += score;

    await user.save();

    return res.status(200).json(
      new ApiResponse(200, {
        currentScore: score,
        totalScore: user.totalScore,
        gameHistory: user.gameScores
      }, "Score added successfully")
    );
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, "Error saving score"));
  }
});

const getUserScores = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json(new ApiResponse(401, null, "User not authenticated"));
  }

  try {
    const user = await User.findById(req.user._id)
      .select("gameScores totalScore username");

    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Sort scores by most recent first
    user.gameScores.sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));

    // Calculate statistics
    const stats = {
      totalGamesPlayed: user.gameScores.length,
      totalScore: user.totalScore,
      averageScore: user.gameScores.length > 0 
        ? (user.gameScores.reduce((sum, game) => sum + (game.score / game.totalQuestions * 100), 0) / user.gameScores.length).toFixed(1)
        : 0,
      bestScore: user.gameScores.length > 0 
        ? Math.max(...user.gameScores.map(game => game.score / game.totalQuestions * 100))
        : 0
    };

    return res.status(200).json(
      new ApiResponse(200, {
        user: {
          username: user.username,
          totalScore: user.totalScore
        },
        gameHistory: user.gameScores,
        statistics: stats
      }, "Scores fetched successfully")
    );
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, "Error fetching scores"));
  }
});

export { addScore, getUserScores };