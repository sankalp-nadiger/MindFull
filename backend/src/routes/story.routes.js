const express = require("express");
const router = express.Router();
const { createStory, getStories } = require("../controllers/story.controller.js");
const { verifyJWT } = require("../middleware/auth.middleware.js");

// Route to create a story
router.post("/stories", verifyJWT, createStory);

// Route to get all stories for the homepage
router.get("/stories", verifyJWT, getStories);

module.exports = router;
