import express from "express";
const router = express.Router();
import { createPost, getPosts } from "../controllers/posts.controller.js";
import { user_verifyJWT } from "../middleware/auth.middleware.js";
import { updateReactions } from "../controllers/posts.controller.js";
import { upload } from "../middleware/multer.middleware.js"

// Route to create a story
router.post("/postsCreate", upload.none(), user_verifyJWT, createPost);

// Route to get all stories for the homepage
router.get("/posts", getPosts);
router.patch("/reaction",updateReactions)
export default router;
