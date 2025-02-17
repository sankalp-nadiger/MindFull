import express from "express";
import { counsellor_verifyJWT, user_verifyJWT} from "../middleware/auth.middleware.js"
import {
  requestSession,
  //getTwilioToken,
  endSession,
  registerCounsellor,
  loginCounsellor,
  acceptSession,
  logoutCounsellor,
  getActiveSessions,
  getCounselorStats,
  addNotesToSession
} from "../controllers/counsellor.controller.js";
import { sendOTP } from "../controllers/parent.controller.js";
import { upload } from "../middleware/multer.middleware.js"

const router = express.Router();
router.post('/addNotes', addNotesToSession);
router.post("/request", user_verifyJWT, requestSession);
router.post("/accept", counsellor_verifyJWT, acceptSession);
router.post("/end", counsellor_verifyJWT, endSession);
router.get("/sessions", counsellor_verifyJWT, getActiveSessions);
//router.get('/counselors/:counselorId/stats', getCounselorStats);
router.post("/register-counsellor", upload.array('certifications', 5), registerCounsellor);
router.post("/send-otp", sendOTP);
router.post("/login-counsellor", loginCounsellor);
router.get('/stats', counsellor_verifyJWT, getCounselorStats);
router.get('/feedback', counsellor_verifyJWT, getCounselorStats);
router.post("/logout-counsellor", counsellor_verifyJWT, logoutCounsellor);

export default router;
