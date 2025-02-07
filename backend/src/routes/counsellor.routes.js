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
  getActiveSessions
} from "../controllers/counsellor.controller.js";
import { sendOTP } from "../controllers/parent.controller.js";
import { upload } from "../middleware/multer.middleware.js"

const router = express.Router();

router.post("/request", user_verifyJWT, requestSession);
router.post("/accept", counsellor_verifyJWT, acceptSession);
router.post("/end", counsellor_verifyJWT, endSession);
router.get("/sessions", counsellor_verifyJWT, getActiveSessions);

router.post("/register-counsellor", upload.array('certifications', 5), registerCounsellor);
router.post("/send-otp", sendOTP);
router.post("/login-counsellor", loginCounsellor);

router.post("/logout-counsellor", counsellor_verifyJWT, logoutCounsellor);

export default router;
