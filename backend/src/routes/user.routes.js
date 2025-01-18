import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  generateAccessAndRefereshTokens,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  addInterests,
  addIssues,
  userProgress,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js"; // Ensure the user is authenticated
import { user_verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// User Registration
router.post("/register", registerUser);

// User Login
router.post("/login", loginUser);

// User Logout
router.post("/logout", user_verifyJWT, logoutUser);

// Refresh Access Token
router.post("/refresh-token", refreshAccessToken);

// Change Current Password
router.post("/change-password", user_verifyJWT, changeCurrentPassword);

// Get Current User
router.get("/current", user_verifyJWT, getCurrentUser); 

// Update Account Details
router.post("/update", user_verifyJWT, updateAccountDetails); 

// Add User Interests
router.patch("/add-interests", user_verifyJWT, addInterests); 

// Add Diagnosed Issues
router.post("/add-issues", user_verifyJWT, addIssues); 

// Get User Progress
router.get("/progress", user_verifyJWT, userProgress); 

export default router;
