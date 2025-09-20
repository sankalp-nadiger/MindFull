import { Router } from "express";
import {
    getGlobalLeaderboard,
    getDistrictLeaderboard,
    getDistrictStats,
    getUserPosition,
    getTopPerformers
} from "../controllers/leaderboard.controller.js";
import { user_verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes (can be accessed without authentication)
router.route("/global").get(getGlobalLeaderboard);
router.route("/districts/stats").get(getDistrictStats);
router.route("/top-performers").get(getTopPerformers);
router.route("/district").get(getDistrictLeaderboard);

// Protected routes (require authentication)
router.route("/my-position").get(user_verifyJWT, getUserPosition);

export default router;