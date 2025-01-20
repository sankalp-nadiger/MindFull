import express from "express";
import { getRecommendations} from "../controllers/activity.controller.js";

const router = express.Router();

// Route to fetch dynamic recommendations
router.get("/recommendations", getRecommendations);

export default router;
