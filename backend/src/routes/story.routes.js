import express from "express";
const router = express.Router();
import { createStory, getStories } from "../controllers/story.controller.js";
import { user_verifyJWT } from "../middleware/auth.middleware.js";

// Route to create a story
router.post("/storiesCreate", user_verifyJWT, createStory);

// Route to get all stories for the homepage
router.get("/stories", getStories);

export default router;
