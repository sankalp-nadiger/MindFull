import express from "express";
import { counsellor_verifyJWT, user_verifyJWT} from "../middleware/auth.middleware.js"
import {
  requestSession,
  getTwilioToken,
  endSession,
  registerCounsellor,
  loginCounsellor,
  logoutCounsellor
} from "../controllers/counsellor.controller.js";
import { sendOTP } from "../controllers/parent.controller.js";
import { upload } from "../middleware/multer.middleware.js"

const router = express.Router();

// Request a new session (Student Side)
router.post("/request", user_verifyJWT, requestSession);

// Get a Twilio token for a session (Student/Counselor)
router.post("/token/student", user_verifyJWT, getTwilioToken);
router.post("/token/counsellor", counsellor_verifyJWT, getTwilioToken);

// End a session (Counselor Side)
router.post("/end", counsellor_verifyJWT, endSession);

router.post("/register-counsellor", upload.array('certifications', 5), registerCounsellor);
router.post("/send-otp", sendOTP);
router.post("/login-counsellor", loginCounsellor);

router.post("/logout-counsellor", counsellor_verifyJWT, logoutCounsellor);

export default router;
