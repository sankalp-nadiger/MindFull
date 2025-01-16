import express from "express";
import {
  registerParent,
  loginUser,
  logoutUser,
} from "../controllers/auth.controller.js";

const router = express.Router();

// Parent Registration
router.post("/register-parent", registerParent);

// User Login
router.post("/login", loginUser);

// User Logout
router.post("/logout", logoutUser);

export default router;
