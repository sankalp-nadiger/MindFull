import Task from "../models/task.model.js";
import {User} from "../models/user.model.js";
import { sendNotification } from "../utils/firebase.js";

// Create Task
export const createTask = async (req, res) => {
  const userId = req.user._id; 
  const { name, description, completed } = req.body; // Match frontend fields

  try {
    const task = new Task({ 
      userId, 
      title: name, // Rename 'name' to 'title' to fit your schema 
      description, 
      completed // Include 'completed' field 
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: "Error creating task", details: error.message });
  }
};


// Get User's Tasks
export const getTasks = async (req, res) => {
  try {
    console.log("User ID:", req.user?._id); // Debugging

    if (!req.user?._id) {
      return res.status(400).json({ error: "User ID is missing" });
    }

    const userId = req.user._id;
    const tasks = await Task.find({ userId });

    console.log("Fetched Tasks:", tasks); // Debugging

    if (tasks.length === 0) {
      return res.status(404).json({ message: "No tasks found for this user" });
    }

    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Error fetching tasks", details: error.message });
  }
};


// Mark Task as Completed
export const completeTask = async (req, res) => {
    try {
      const { taskId } = req.params;
      const task = await Task.findById(taskId);

      if (!task) {
          return res.status(404).json({ message: 'Task not found' });
      }

      // Toggle the completion status
      task.completed = !task.completed;
      await task.save();

      res.status(200).json({ message: 'Task updated successfully', task });
  } catch (error) {
      res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};


export const deleteTask = async (req, res) => {
  try {
      const { taskId } = req.params;
      const deletedTask = await Task.findByIdAndDelete(taskId);

      if (!deletedTask) {
          return res.status(404).json({ message: 'Task not found' });
      }

      res.status(200).json({ message: 'Task deleted successfully', task: deletedTask });
  } catch (error) {
      res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};

// 🔥 Trigger Task Reminders (Called by cron-job.org or GitHub Actions)
export const triggerReminders = async (req, res) => {
  try {
    const now = new Date();
    const upcomingTasks = await Task.find({
      dueDate: { $lte: new Date(now.getTime() + 30 * 60 * 1000) }, // Tasks due in next 30 mins
      completed: false,
      reminderSent: false,
    });

    for (const task of upcomingTasks) {
      const user = await User.findById(task.userId);
      if (user?.fcmToken) {
        await sendNotification(
          user.fcmToken,
          "Task Reminder",
          `Your task "${task.title}" is due soon!`
        );
        task.reminderSent = true;
        await task.save();
      }
    }

    res.status(200).json({ message: "Reminders triggered" });
  } catch (error) {
    res.status(500).json({ error: "Error triggering reminders" });
  }
};
