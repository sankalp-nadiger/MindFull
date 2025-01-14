import express from "express";
import { getRecommendations, storeRecommendations, fetchStoredRecommendations } from "../controllers/activity.controller.js";

const router = express.Router();

// Route to fetch dynamic recommendations
router.get("/recommendations", getRecommendations);

// Route to store activity recommendations
router.post("/recommendations", storeRecommendations);

// Route to fetch stored recommendations
router.get("/stored-recommendations", fetchStoredRecommendations);

export default router;
