import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  generateAccessAndRefreshTokens,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  addInterests,
  addIssues,
  userProgress,
  calculateAverageMood,
  getWeeklyMoodData,
} from "../controllers/user.controller.js";
import { user_verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// User Registration
router.post("/register", registerUser);

// User Login
router.post("/login", loginUser);

// User Logout
router.post("/logout", user_verifyJWT, logoutUser);

// Refresh Access Token
router.post("/refresh-token", refreshAccessToken);

// Change Current Password
router.post("/change-password", user_verifyJWT, changeCurrentPassword);

// Get Current User
router.get("/current", user_verifyJWT, getCurrentUser); 

// Update Account Details
router.post("/update", user_verifyJWT, updateAccountDetails); 

// Add User Interests
router.patch("/add-interests", user_verifyJWT, addInterests); 

// Add Diagnosed Issues
router.post("/add-issues", user_verifyJWT, addIssues); 

// Get User Progress
router.get("/progress", user_verifyJWT, userProgress); 

router.get("/month-avg-mood", user_verifyJWT, calculateAverageMood); 

router.get("/week-mood-chart", user_verifyJWT, getWeeklyMoodData); 

router.get('/generate-report', async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch user data
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch mood logs for the past month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const moods = await Mood.find({
      user: userId,
      timestamp: { $gte: oneMonthAgo },
    });

    // Fetch journal entries for the past month
    const journals = await Journal.find({
      user: userId,
      createdAt: { $gte: oneMonthAgo },
    });

    // Calculate average mood
    const avgMood =
      moods.reduce((sum, mood) => sum + mood.value, 0) / (moods.length || 1);

    // Construct report data
    const report = {
      name: user.name,
      email: user.email,
      avgMood: avgMood.toFixed(2),
      totalJournals: journals.length,
      activitiesCompleted: user.activitiesCompleted || 0, // Assuming you track this
      generatedAt: new Date(),
    };

    res.status(200).json({ message: "Report generated successfully", report });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Error generating report" });
  }
});

export default router;
