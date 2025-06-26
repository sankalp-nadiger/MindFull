import express from "express";
import { parent_verifyJWT } from "../middleware/auth.middleware.js";
import {
  registerParent,
  loginParent,
  logoutParent,
  getSessions,
  getJournals,
  getIssues,
  getStudentReport,
  checkMoodAndNotifyParent,
  sendOTP,
  getCriticalAlerts,
  getUpcomingSessions,
  requestCounselorMeeting,
} from "../controllers/parent.controller.js";
import { getWeeklyMoodData } from "../controllers/user.controller.js";

const router = express.Router();
router.post("/send-otp", sendOTP);
router.post("/register-parent", registerParent);
router.get("/parent/report", parent_verifyJWT, getStudentReport);
router.post("/login", loginParent);

router.post("/logout", parent_verifyJWT, logoutParent);
router.get("/parent/sessions", parent_verifyJWT, getSessions);
router.get("/parent/journals", parent_verifyJWT, getJournals);
router.get("/parent/issues", parent_verifyJWT, getIssues);
router.get("/parent/mood-check", parent_verifyJWT, checkMoodAndNotifyParent);
router.get("/week-mood-chart", parent_verifyJWT, getWeeklyMoodData);
router.get("/parent/critical-alerts", parent_verifyJWT, getCriticalAlerts);
router.get("/parent/upcoming-sessions", parent_verifyJWT, getUpcomingSessions);
router.post("/parent/request-counselor", parent_verifyJWT, requestCounselorMeeting);

export default router;
