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

export const createDeadlineTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    
    // Basic validation
    if (!title || !dueDate) {
      return res.status(400).json({ message: 'Title and due date are required' });
    }
    
    // Create new deadline task
    const deadlineTask = new Task({
      userId: req.user._id,
      title,
      description,
      dueDate: new Date(dueDate)
    });
    
    const savedTask = await deadlineTask.save();
    
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating deadline task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all deadline tasks for logged in user
 * @route GET /api/deadline-tasks
 * @access Private
 */
export const getDeadlineTasks = async (req, res) => {
  try {
    const deadlineTasks = await Task.find({ 
      userId: req.user._id 
    }).sort({ dueDate: 1 }); // Sort by due date ascending
    
    res.json(deadlineTasks);
  } catch (error) {
    console.error('Error fetching deadline tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const updateDeadlineTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    
    const { title, description, dueDate, completed } = req.body;
    
    // Find the task
    let task = await Task.findById(id);
    
    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check task ownership
    if (task.userId.toString() !== req.user._id) {
      return res.status(403).json({ message: 'User not authorized' });
    }
    
    // Update fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (completed !== undefined) updateData.completed = completed;
    
    // If task is being marked as completed, set completedAt date
    if (completed && !task.completed) {
      updateData.completedAt = new Date();
    } else if (!completed) {
      updateData.completedAt = null;
    }
    
    // Update task
    task = await Task.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true } // Return updated document
    );
    
    res.json(task);
  } catch (error) {
    console.error('Error updating deadline task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteDeadlineTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    
    const task = await Task.findById(id);
    
    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check task ownership
    if (task.userId.toString() !== req.user._id) {
      return res.status(403).json({ message: 'User not authorized' });
    }
    
    // Delete task
    await task.remove();
    
    res.json({ message: 'Task removed' });
  } catch (error) {
    console.error('Error deleting deadline task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const completeDeadlineTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    
    // Find the task
    let task = await Task.findById(id);
    
    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check task ownership
    if (task.userId.toString() !== req.user._id) {
      return res.status(403).json({ message: 'User not authorized' });
    }
    
    // Toggle completed status
    const completed = !task.completed;
    
    // Update task
    task = await Task.findByIdAndUpdate(
      id,
      { 
        $set: { 
          completed,
          completedAt: completed ? new Date() : null
        } 
      },
      { new: true } // Return updated document
    );
    
    res.json(task);
  } catch (error) {
    console.error('Error completing deadline task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const getOverdueTasks = async (req, res) => {
  try {
    const now = new Date();
    
    const overdueTasks = await Task.find({
      user: req.user._id,
      dueDate: { $lt: now },
      completed: false
    }).sort({ dueDate: 1 });
    
    res.json(overdueTasks);
  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    res.status(500).json({ message: 'Server error' });
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
