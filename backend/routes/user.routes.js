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

const router = express.Router();

// User Registration
router.post("/register", registerUser); // Route: POST /api/users/register

// User Login
router.post("/login", loginUser); // Route: POST /api/users/login

// User Logout
router.post("/logout", protect, logoutUser); // Route: POST /api/users/logout

// Refresh Access Token
router.post("/refresh-token", refreshAccessToken); // Route: POST /api/users/refresh-token

// Change Current Password
router.put("/change-password", protect, changeCurrentPassword); // Route: PUT /api/users/change-password

// Get Current User
router.get("/current", protect, getCurrentUser); // Route: GET /api/users/current

// Update Account Details
router.put("/update", protect, updateAccountDetails); // Route: PUT /api/users/update

// Add User Interests
router.post("/add-interests", protect, addInterests); // Route: POST /api/users/add-interests

// Add Diagnosed Issues
router.post("/add-issues", protect, addIssues); // Route: POST /api/users/add-issues

// Get User Progress
router.get("/progress", protect, userProgress); // Route: GET /api/users/progress

export default router;
