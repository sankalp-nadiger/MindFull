import express from "express";
import { addScore, getUserScores } from "../controllers/scoreController.js";

import { user_verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/add", user_verifyJWT, addScore);
router.get("/user", user_verifyJWT, getUserScores);

export default router;
