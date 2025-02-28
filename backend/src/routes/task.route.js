import express from "express";
import { createTask, getTasks, deleteTask, completeTask, triggerReminders } from "../controllers/task.controller.js";
import { user_verifyJWT } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/add", user_verifyJWT, createTask);
router.get("/", user_verifyJWT, getTasks);
router.patch("/:taskId/complete", completeTask);
router.delete('/:taskId/delete', deleteTask);
router.get("/trigger-reminders", triggerReminders);

export default router;
