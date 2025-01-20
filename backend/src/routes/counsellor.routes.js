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

const router = express.Router();

// Request a new session (Student Side)
router.post("/request", user_verifyJWT, requestSession);

// Get a Twilio token for a session (Student/Counselor)
router.post("/token/student", user_verifyJWT, getTwilioToken);
router.post("/token/counsellor", counsellor_verifyJWT, getTwilioToken);

// End a session (Counselor Side)
router.post("/end", counsellor_verifyJWT, endSession);

router.post("/register-counsellor", registerCounsellor);

router.post("/login-counsellor", counsellor_verifyJWT, loginCounsellor);

router.post("/logout-counsellor", counsellor_verifyJWT, logoutCounsellor);

export default router;
