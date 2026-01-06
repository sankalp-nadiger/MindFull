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

    // Normalize and sort scores by most recent first
    const normalizedHistory = (user.gameScores || []).map((game) => {
      const totalQ = game.totalQuestions || 10;
      // If already on a 10-point scale, keep it. Otherwise normalize to 0-10
      let normalizedScore = totalQ === 10 ? game.score : Math.round((game.score / totalQ) * 10);
      normalizedScore = Math.max(0, Math.min(10, normalizedScore));
      return {
        gameName: game.gameName,
        score: normalizedScore,
        totalQuestions: 10,
        playedAt: game.playedAt
      };
    }).sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));

    const totalGamesPlayed = normalizedHistory.length;
    const totalScore = normalizedHistory.reduce((sum, g) => sum + g.score, 0);
    const averageScore = totalGamesPlayed > 0 ? (totalScore / totalGamesPlayed).toFixed(1) : 0;
    const bestScore = totalGamesPlayed > 0 ? Math.max(...normalizedHistory.map(g => g.score)) : 0;

    const stats = {
      totalGamesPlayed,
      totalScore,
      averageScore,
      bestScore
    };

    return res.status(200).json(
      new ApiResponse(200, {
        user: {
          username: user.username,
          totalScore
        },
        gameHistory: normalizedHistory,
        statistics: stats
      }, "Scores fetched successfully")
    );
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, "Error fetching scores"));
  }
});

export { addScore, getUserScores };