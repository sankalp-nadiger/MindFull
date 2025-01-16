import express from "express";
import {
  requestSession,
  getTwilioToken,
  endSession,
} from "../controllers/session.controller.js";

const router = express.Router();

// Request a new session (Student Side)
router.post("/request", requestSession);

// Get a Twilio token for a session (Student/Counselor)
router.post("/token", getTwilioToken);

// End a session (Counselor Side)
router.post("/end", endSession);

export default router;
