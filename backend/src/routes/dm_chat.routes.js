import express from "express";
import {
  startPersonalChat,
  sendMessageToUser,
} from "../controllers/chat.controller.js";

const router = express.Router();

// Start a personal chat between two users
router.post("/start", startPersonalChat);

// Send a message in a personal chat
router.post("/send", sendMessageToUser);

export default router;
