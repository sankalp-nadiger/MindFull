import Task from "../models/task.model.js";
import {User} from "../models/user.model.js";
import { sendNotification } from "../utils/firebase.js";
import mongoose from "mongoose";

// Create Task
export const createTask = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log("Request Body:", req.body); // Debugging step

    const { title, description, completed = false, startTime, endTime } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Convert time strings to Date objects (assuming today’s date)
    const today = new Date();
    
    const parseTime = (timeStr) => {
      if (!timeStr) return null;
      const [hours, minutes] = timeStr.split(":").map(Number);
      return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
    };

    const formattedStartTime = parseTime(startTime);
    const formattedEndTime = parseTime(endTime);
    console.log(formattedStartTime, formattedEndTime);

    const task = new Task({
      userId,
      title,
      description,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      completed
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
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

    //console.log("Fetched Tasks:", tasks); // Debugging

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

export const getDeadlineTasks = async (req, res) => {
  try {
    const deadlineTasks = await Task.find({ 
      userId: req.user._id, 
      dueDate: { $ne: null }  // Only select tasks with a dueDate
    }).sort({ dueDate: 1 }); // Sort by due date ascending
    
    res.json(deadlineTasks);
  } catch (error) {
    console.error('Error fetching deadline tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const reorderTasks = async (req, res) => {
  try {
    const { taskIds } = req.body;
    
    if (!taskIds || !Array.isArray(taskIds)) {
      return res.status(400).json({ message: 'Invalid task order data' });
    }

    // Fetch tasks in their current order (based on creation time)
    const tasks = await Task.find({ _id: { $in: taskIds } }).sort({ createdAt: 1 });
    
    // Create a mapping of new positions
    const taskOrderMap = new Map(taskIds.map((id, index) => [id, index]));

    // Sort tasks based on provided order
    tasks.sort((a, b) => taskOrderMap.get(a._id.toString()) - taskOrderMap.get(b._id.toString()));

    // Update tasks in bulk with new order
    const bulkOperations = tasks.map((task, index) => ({
      updateOne: {
        filter: { _id: task._id },
        update: { $set: { createdAt: new Date(Date.now() + index) } },
      },
    }));

    await Task.bulkWrite(bulkOperations);

    res.status(200).json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    console.error('Error reordering tasks:', error);
    res.status(500).json({ message: 'Internal server error' });
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
    
    // Validate ObjectId using Mongoose's built-in method
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    
    const task = await Task.findById(id);
    
    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check task ownership
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized' });
    }
    
    // Delete task
    await Task.findByIdAndDelete(id);
    
    res.json({ message: 'Task removed' });
  } catch (error) {
    console.error('Error deleting deadline task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const completeDeadlineTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId using Mongoose's built-in method
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    
    // Find the task
    let task = await Task.findById(id);
    
    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check task ownership
    if (task.userId.toString() !== req.user._id.toString()) {
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

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
import axios from "axios";

export const analyzeAndOptimizeSchedule = async (tasks) => {
  try {
    // Check if tasks array is empty
    if (!tasks || tasks.length === 0) {
      console.log("No tasks provided for analysis");
      return { insights: [] };
    }
    
    console.log("Analyzing tasks:", tasks);
    
    const response = await axios.post(
      `${GEMINI_API_URL}/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `
                Analyze the following task schedule and provide structured insights for better productivity.
                Tasks: ${JSON.stringify(tasks, null, 2)}
                
                Return the response in JSON format with the following structure:
                {
                  "insights": [
                    {
                      "id": "",
                      "title": "",
                      "description": "",
                      "recommendedTasks": [
                        "",
                        "",
                        ""
                      ]
                    }
                  ]
                }
                `
              }
            ]
          }
        ]
      }
    );
    
    let aiResponse = response.data.candidates[0]?.content?.parts[0]?.text;
    
    if (!aiResponse) {
      throw new Error("Empty response from AI service");
    }
    
    console.log("Raw AI response:", aiResponse);
    
    // Clean up the response - remove markdown code blocks if present
    aiResponse = aiResponse.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    
    try {
      // Parse the cleaned JSON
      return JSON.parse(aiResponse);
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      // Fallback for malformed JSON
      return { 
        insights: [{
          id: "error-1",
          title: "AI Analysis Error",
          description: "Could not generate insights at this time. Please try again later.",
          recommendedTasks: []
        }] 
      };
    }
  } catch (error) {
    console.error("Error analyzing schedule:", error.response?.data || error.message);
    return { insights: [] };
  }
};
