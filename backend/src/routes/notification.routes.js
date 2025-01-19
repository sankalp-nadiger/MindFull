import express from "express";
import {
  createNotification,
  getNotifications,
  deleteNotification,
} from "../controllers/notification.controller.js";

const router = express.Router();

// Create a notification
router.post("/", createNotification);

// Get notifications for a specific user
router.get("/:userId", getNotifications);

// Delete a specific notification
router.delete("/:notificationId", deleteNotification);

export default router;
