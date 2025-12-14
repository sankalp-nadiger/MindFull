import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  addInterests,
  addIssues,
  userProgress,
  calculateAverageMood,
  getWeeklyMoodData,
  getActiveSessions,
  getJournals,
  updateFeedback,
  getUserSessions,
  getLastCounselorProgress,
  updateCounselorProgress,
  getCaseHistory,
  rejoinUserSession,
  getUserActiveSession,
  dismissUserSession,
  getUserAppointments,
  getTodaysUserAppointments,
  markAppointmentJoined
} from "../controllers/user.controller.js";
import { addNotesToSession, endSession } from "../controllers/counsellor.controller.js";
import {upload} from "../middleware/multer.middleware.js"
import { user_verifyJWT } from "../middleware/auth.middleware.js";
import { User } from "../models/user.model.js";
import { Mood } from "../models/mood.model.js";
import { Journal } from "../models/journal.model.js";
const router = express.Router();

router.post("/register", upload.single("idCardFile"), registerUser);

router.post("/login", loginUser);

router.post("/logout", user_verifyJWT, logoutUser);

router.post("/refresh-token", refreshAccessToken);
router.post("/end", user_verifyJWT, endSession);
router.post("/change-password", user_verifyJWT, changeCurrentPassword);

router.get("/current", user_verifyJWT, getCurrentUser); 
router.get('/counseling-sessions', user_verifyJWT, getUserSessions);
router.post("/update", user_verifyJWT, updateAccountDetails); 
router.get("/journal-entries", user_verifyJWT, getJournals);

router.patch("/add-interests", user_verifyJWT, addInterests); 

router.post("/add-issues", user_verifyJWT, addIssues); 
router.post("/addNotes", addNotesToSession); 

router.get("/progress", user_verifyJWT, userProgress); 
router.post("/feedback",user_verifyJWT,updateFeedback)

router.get("/month-avg-mood", user_verifyJWT, calculateAverageMood); 
router.get('/last-counselor-progress', user_verifyJWT, getLastCounselorProgress);
router.post('/update-counselor-progress', user_verifyJWT, updateCounselorProgress);
router.get("/week-mood-chart", user_verifyJWT, getWeeklyMoodData); 
router.get("/sessions",user_verifyJWT,getActiveSessions)
router.get('/case_history', getCaseHistory);
router.get('/active-session', user_verifyJWT, getUserActiveSession);
router.post('/rejoin', user_verifyJWT, rejoinUserSession);
router.post('/dismiss-session', user_verifyJWT, dismissUserSession);
router.get('/appointments', user_verifyJWT, getUserAppointments);
router.get('/appointments/today', user_verifyJWT, getTodaysUserAppointments);
router.patch('/appointments/:appointmentId/joined', user_verifyJWT, markAppointmentJoined);
router.get('/generate-report', async (req, res) => {
  const userId = req.user._id;

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
