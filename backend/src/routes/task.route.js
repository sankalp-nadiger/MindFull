import express from "express";
import { createTask, getTasks, deleteTask, completeTask, triggerReminders, analyzeAndOptimizeSchedule } from "../controllers/task.controller.js";
import { user_verifyJWT } from "../middleware/auth.middleware.js";
import Task from "../models/task.model.js";
import { createDeadlineTask, getDeadlineTasks, reorderTasks, updateDeadlineTask, deleteDeadlineTask, completeDeadlineTask, getOverdueTasks } from "../controllers/task.controller.js";
const router = express.Router();

router.post("/", user_verifyJWT, createTask);
router.get("/", user_verifyJWT, getTasks);
router.patch("/:taskId/complete", completeTask);
router.delete('/:taskId/delete', deleteTask);
router.get("/trigger-reminders", triggerReminders);
// Create a new deadline task
router.post('/dead', user_verifyJWT, createDeadlineTask);
router.patch('/tasks/reorder', reorderTasks);
// Get all deadline tasks for the authenticated user
router.get('/dead', user_verifyJWT, getDeadlineTasks);

// Update a specific deadline task
router.put('/dead/:id', user_verifyJWT, updateDeadlineTask);

// Delete a specific deadline task
router.delete('/dead/:id', user_verifyJWT, deleteDeadlineTask);

// Mark a specific deadline task as completed
router.post('/dead/:id/complete', user_verifyJWT, completeDeadlineTask);

// Get overdue tasks for the authenticated user
router.get('/dead/overdue', user_verifyJWT, getOverdueTasks);

router.get("/streak", user_verifyJWT, async (req, res) => {
  try {
    const userId = req.user._id; // Fix incorrect destructuring

    // Find tasks completed by user, sorted by lastCompleted (latest first)
    const tasks = await Task.find({ userId, completed: true }).sort({ lastCompleted: -1 });

    // If no tasks are found, return streaks as 0
    if (!tasks.length) {
      return res.json({ streakCount: 0, maxStreak: 0, message: "No streaks found" });
    }

    // Get the current streak count from the most recent task
    const streakCount = tasks[0].streakCount;

    // Find the max streak count from all tasks
    const maxStreak = await Task.findOne({ userId, completed: true }).sort({ streakCount: -1 });

    res.json({ 
      streakCount, 
      maxStreak: maxStreak ? maxStreak.streakCount : 0 
    });

  } catch (error) {
    console.error("Error fetching streaks:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/ai-insights", async (req, res) => {
    try {
      const { tasks } = req.body;
      
      if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).json({ 
          error: "Invalid or empty tasks array",
          insights: [] 
        });
      }
      
      // Filter out any malformed tasks before sending to the AI
      const validTasks = tasks.filter(task => 
        task && typeof task === 'object' && 
        (task.title || task.name)
      );
      
      if (validTasks.length === 0) {
        return res.json({ insights: [] });
      }
      
      const insights = await analyzeAndOptimizeSchedule(validTasks);
      res.json({ insights: insights.insights || [] });
    } catch (error) {
      console.error("Route error:", error);
      res.status(500).json({ 
        error: error.message,
        insights: [] 
      });
    }
  });

export default router;
