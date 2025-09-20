import React, { useState, useEffect } from 'react';
import { Clock, X, Calendar } from 'lucide-react';
import { ArrowUp, ArrowDown, ArrowLeft, Check, Plus, Award, Lightbulb, ChevronRight, Trash, Save } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TodoListPage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskStartTime, setNewTaskStartTime] = useState(''); // Start time
  const [newTaskEndTime, setNewTaskEndTime] = useState(''); // End time
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [aiInsights, setAiInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeadlineForm, setShowDeadlineForm] = useState(false);
  const [deadlineTasks, setDeadlineTasks] = useState([]);
  const [deadlineTaskName, setDeadlineTaskName] = useState('');
  const [deadlineTaskDescription, setDeadlineTaskDescription] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [productivityMessage, setProductivityMessage] = useState('');

  // Fetch initial data
  useEffect(() => {
    fetchTasks();
    fetchStreaks();
    fetchAiInsights();
    fetchDeadlineTasks();
    generateProductivityMessage();
  }, []);

  // Generate motivational productivity message based on tasks and streaks
  const generateProductivityMessage = () => {
    const messages = [
      "Focus on completing 3 important tasks today to boost your productivity!",
      "Break down complex tasks into smaller steps for better progress.",
      "You're making great progress! Keep the momentum going.",
      "Time blocking your tasks can help you achieve more throughout the day.",
      "Remember to take short breaks between tasks to maintain focus."
    ];
    
    // Select message based on streak or randomly if no streak
    if (currentStreak > 5) {
      setProductivityMessage("You're on fire with a " + currentStreak + "-day streak! Incredible consistency!");
    } else if (currentStreak > 2) {
      setProductivityMessage("Your " + currentStreak + "-day streak shows great dedication. Keep it up!");
    } else {
      const randomIndex = Math.floor(Math.random() * messages.length);
      setProductivityMessage(messages[randomIndex]);
    }
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/tasks/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
        },
      });
  
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []); // Ensures it's always an array
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]); // Fallback to an empty array in case of an error
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchStreaks = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/tasks/streak`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
      setCurrentStreak(data.streakCount || 0); // ✅ Matches backend response
      setMaxStreak(data.maxStreak || 0);
    } catch (error) {
      console.error("Error fetching streaks:", error);
    }
  };
  const fetchAiInsights = async () => {
    try {
      // Get all tasks - both saved and unsaved ones in the UI
      const allTasks = [...tasks];
      
      // Check if there are any tasks to analyze
      if (allTasks.length === 0) {
        setAiInsights([]);
        return;
      }
      
      // Ensure each task has necessary properties for analysis
      const formattedTasks = allTasks.map(task => {
        // Create a properly formatted task object
        return {
          _id: task._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
          title: task.title || task.name || "Untitled Task",
          description: task.description || "",
          completed: !!task.completed,
          startTime: task.startTime || null,
          endTime: task.endTime || null,
          // Add any other necessary fields
        };
      });
      
      console.log("Sending tasks for analysis:", formattedTasks);
      
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/tasks/ai-insights`, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ tasks: formattedTasks })
      });
      
      const data = await response.json();
      setAiInsights(data.insights || []);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      // Show a user-friendly error message
      setAiInsights([{
        id: "error",
        title: "Couldn't generate insights",
        description: "There was a problem analyzing your tasks. Please try again later.",
        recommendedTasks: []
      }]);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskName.trim()) return;
    
    try {
      // Replace with actual API call
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/tasks/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTaskName, // Changed from name to title for consistency
          description: newTaskDescription,
          startTime: newTaskStartTime,
          endTime: newTaskEndTime,
          completed: false,
        }),
      });
      
      const data = await response.json();
      
      // Normalize the task data to ensure consistent property names
      const normalizedTask = {
        ...data,
        title: data.title || data.name, // Handle both name and title
        startTime: data.startTime,
        endTime: data.endTime
      };
      
      setTasks([...tasks, normalizedTask]);
      setNewTaskName('');
      setNewTaskDescription('');
      setNewTaskStartTime('');
      setNewTaskEndTime('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await fetch(`${import.meta.env.VITE_BASE_API_URL}/tasks/${taskId}/complete`, {
        method: 'PATCH',
      });
      
      setTasks(tasks.map(task => 
        task._id === taskId ? { ...task, completed: !task.completed } : task
      ));
      
      // Refresh streaks after marking task as complete
      fetchStreaks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleMoveTask = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Don't move if at boundaries
    if (newIndex < 0 || newIndex >= tasks.length) return;
    
    const newTasks = [...tasks];
    const temp = newTasks[index];
    newTasks[index] = newTasks[newIndex];
    newTasks[newIndex] = temp;
    
    setTasks(newTasks);
    
    try {
      // Replace with actual API call
      await fetch(`${import.meta.env.VITE_BASE_API_URL}/tasks/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskIds: newTasks.map(task => task._id) }),
      });
    } catch (error) {
      console.error('Error reordering tasks:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      // Replace with actual API call
      await fetch(`${import.meta.env.VITE_BASE_API_URL}/tasks/${taskId}/delete`, {
        method: 'DELETE',
      });
      
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };
  
  const fetchDeadlineTasks = async () => {
    try {
      const accessToken = sessionStorage.getItem('accessToken');
      const res = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/tasks/dead`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setDeadlineTasks(res.data);
    } catch (err) {
      console.error('Error fetching deadline tasks:', err);
    }
  };
  
  const handleAddDeadlineTask = async () => {
    if (!deadlineTaskName || !deadlineDate) {
      // Show an error notification
      return;
    }
  
    try {
      const accessToken = sessionStorage.getItem('accessToken');
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/tasks/dead`,
        {
          title: deadlineTaskName,
          description: deadlineTaskDescription,
          dueDate: deadlineDate
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
  
      // Add the new task to the state
      setDeadlineTasks([...deadlineTasks, res.data]);
  
      // Clear form
      setDeadlineTaskName('');
      setDeadlineTaskDescription('');
      setDeadlineDate('');
      setShowDeadlineForm(false);
    } catch (err) {
      console.error('Error adding deadline task:', err);
      // Show error notification
    }
  };
  
  const handleDeleteDeadlineTask = async (taskId) => {
    try {
      const accessToken = sessionStorage.getItem('accessToken');
      await axios.delete(`${import.meta.env.VITE_BASE_API_URL}/tasks/dead/${taskId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
  
      // Update state by removing the deleted task
      setDeadlineTasks(deadlineTasks.filter(task => task._id !== taskId));
    } catch (err) {
      console.error('Error deleting deadline task:', err);
      // Show error notification
    }
  };
  
  const handleCompleteDeadlineTask = async (taskId) => {
    try {
      const accessToken = sessionStorage.getItem('accessToken');
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/tasks/dead/${taskId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
  
      // Update the task in state
      setDeadlineTasks(deadlineTasks.map(task => 
        task._id === taskId ? res.data : task
      ));
    } catch (err) {
      console.error('Error completing deadline task:', err);
      // Show error notification
    }
  };
  
  const adoptAiRecommendation = async (recommendationId) => {
    try {
      // Replace with actual API call
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/tasks/${recommendationId}/adopt`, {
        method: 'POST',
      });
      
      const data = await response.json();
      setTasks(data.tasks);
      
      // Refresh AI insights
      fetchAiInsights();
    } catch (error) {
      console.error('Error adopting AI recommendation:', error);
    }
  };

  // Format time for display
  const formatTime = (time) => {
    if (!time) return "N/A";
    
    const date = new Date(time); // Ensure it's a Date object
    if (isNaN(date.getTime())) return "Invalid Date"; // Handle incorrect formats
  
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };
  

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Fixed watermark logo - always centered and visible */}
      <div 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-center bg-no-repeat bg-contain opacity-[0.12] pointer-events-none z-0"
        style={{
          backgroundImage: `url('1a.png')`,
        }}
      />

      {/* Header with improved colors */}
      <div className="bg-gradient-to-r from-slate-800 via-purple-900 to-slate-800 py-6 px-4 shadow-xl relative z-10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Back button - Left */}
            <Link 
              to="/MainPage"
              className="flex items-center justify-center gap-1 sm:gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:block text-sm font-medium sm:text-base">Back to Dashboard</span>
            </Link>
            
            <div className="flex items-center mb-4 md:mb-0 md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-300 via-blue-300 to-teal-300 bg-clip-text text-transparent">TaskMaster</h1>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-200 text-lg mb-2">{productivityMessage}</p>
              <div className="flex items-center justify-center md:justify-end space-x-6">
                <div className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-amber-400" />
                  <span className="text-sm">Current Streak: {currentStreak} days</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-purple-400" />
                  <span className="text-sm">Max Streak: {maxStreak} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left panel - Task list */}
          <div className="w-full md:w-2/3 bg-slate-800/90 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-6">My Tasks</h2>
            
            {/* Deadline Tasks Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-amber-400">Upcoming Deadlines</h3>
                <button 
                  className="text-sm text-amber-400 hover:text-amber-300 hover:underline flex items-center transition-colors"
                  onClick={() => setShowDeadlineForm(!showDeadlineForm)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Deadline
                </button>
              </div>
              
              {/* Deadline Task Form - Updated with better colors */}
              {showDeadlineForm && (
                <div className="mb-6 bg-slate-700/80 backdrop-blur-sm p-4 rounded-lg border border-slate-600/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Deadline task name"
                      className="px-4 py-2 bg-slate-600/80 text-white rounded-lg border border-slate-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                      value={deadlineTaskName}
                      onChange={(e) => setDeadlineTaskName(e.target.value)}
                    />
                    <div className="relative">
                      <input
                        type="datetime-local"
                        className="px-4 py-2 bg-slate-600/80 text-white rounded-lg border border-slate-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 w-full"
                        value={deadlineDate}
                        onChange={(e) => setDeadlineDate(e.target.value)}
                        placeholder="Deadline date and time"
                      />
                    </div>
                    <textarea
                      placeholder="Deadline task description"
                      className="md:col-span-2 px-4 py-2 bg-slate-600/80 text-white rounded-lg border border-slate-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                      value={deadlineTaskDescription}
                      onChange={(e) => setDeadlineTaskDescription(e.target.value)}
                      rows="2"
                    />
                    <div className="md:col-span-2 flex justify-end">
                      <button
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg flex items-center transition-all duration-200 shadow-lg"
                        onClick={handleAddDeadlineTask}
                      >
                        Add Deadline Task
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Horizontal Deadline Tasks Display with improved colors */}
              <div className="overflow-x-auto pb-2">
                <div className="flex space-x-4">
                  {deadlineTasks.length > 0 ? (
                    deadlineTasks.map((task) => {
                      const dueDate = new Date(task.dueDate);
                      const now = new Date();
                      const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
                      
                      let bgColor = "bg-slate-700/80";
                      let borderColor = "border-slate-500";
                      
                      if (daysLeft <= 1) {
                        bgColor = "bg-red-900/80";
                        borderColor = "border-red-400";
                      } else if (daysLeft <= 3) {
                        bgColor = "bg-amber-900/80";
                        borderColor = "border-amber-400";
                      }
                      
                      return (
                        <div 
                          key={task._id} 
                          className={`flex-shrink-0 w-64 ${bgColor} backdrop-blur-sm border-l-4 ${borderColor} rounded-lg p-4 shadow-lg`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-white">{task.title}</h4>
                            <button 
                              className="text-gray-400 hover:text-red-400 transition-colors"
                              onClick={() => handleDeleteDeadlineTask(task._id)}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center text-sm text-amber-400 mb-2">
                            <span>
                              {dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-300 mb-3 line-clamp-2">{task.description}</p>
                          
                          <div className="flex justify-between items-center">
                            <span className={`text-xs px-2 py-1 rounded ${
                              daysLeft <= 1 ? 'bg-red-800/80 text-red-200' : 
                              daysLeft <= 3 ? 'bg-amber-800/80 text-amber-200' : 
                              'bg-slate-600/80 text-slate-300'
                            }`}>
                              {daysLeft <= 0 ? 'Due today' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                            </span>
                            
                            <button
                              className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center transition-colors"
                              onClick={() => handleCompleteDeadlineTask(task._id)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Done
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full text-center py-6 text-gray-400">
                      <p>No deadline tasks. Add some to stay on schedule!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {tasks.map((task, index) => (
                  <div key={task._id || index} className="flex relative pb-8 sm:items-center">
                    <div className="h-full w-6 absolute inset-0 flex items-center justify-center">
                      <div className="h-full w-1 bg-slate-600 pointer-events-none"></div>
                    </div>
                    <div className="flex-shrink-0 w-6 h-6 rounded-full mt-10 sm:mt-0 inline-flex items-center justify-center bg-gradient-to-r from-emerald-500 to-cyan-500 text-white relative z-10 title-font font-medium text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-grow md:pl-8 pl-6 flex sm:items-center items-start flex-col sm:flex-row">
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-600 rounded-full inline-flex items-center justify-center">
                        {task.completed ? (
                          <Check className="w-8 h-8" />
                        ) : (
                          <svg
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="w-8 h-8"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                          </svg>
                        )}
                      </div>
                      
                      <div className="flex-grow sm:pl-6 mt-6 sm:mt-0">
                        <h2 className={`font-medium title-font mb-1 text-xl ${task.completed ? 'text-gray-500 line-through' : 'text-emerald-400'}`}>
                          {task.title || task.name}
                        </h2>
                        <p className={`leading-relaxed ${task.completed ? 'text-gray-600' : 'text-gray-300'}`}>
                          {task.description}
                        </p>
                        
                        {/* Display both start and end times if available */}
                        {(task.startTime || task.endTime) && (
                          <div className="flex items-center mt-2 mb-3">
                            <Clock className="w-4 h-4 text-amber-400 mr-2" />
                            <span className="text-sm text-amber-400">
                              {task.startTime && formatTime(new Date(task.startTime).toISOString())}
                              {task.startTime && task.endTime && " - "}
                              {task.endTime && formatTime(new Date(task.endTime).toISOString())}
                            </span>
                          </div>
                        )}
                        
                        <div className="mt-4 flex space-x-3">
                          <button
                            className={`px-4 py-2 ${task.completed ? 'bg-slate-600 hover:bg-slate-500' : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600'} text-white rounded-lg flex items-center transition-all duration-200`}
                            onClick={() => handleCompleteTask(task._id)}
                          >
                            {task.completed ? 'Undo' : 'Done'}
                          </button>
                          
                          <div className="flex">
                            <button
                              className="p-2 bg-slate-600 text-slate-300 rounded-l-lg hover:bg-slate-500 transition-colors"
                              onClick={() => handleMoveTask(index, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 bg-slate-600 text-slate-300 rounded-r-lg hover:bg-slate-500 transition-colors"
                              onClick={() => handleMoveTask(index, 'down')}
                              disabled={index === tasks.length - 1}
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <button
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            onClick={() => handleDeleteTask(task._id)}
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {tasks.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <p>No tasks yet. Add some tasks to get started!</p>
                  </div>
                )}
                
                {/* Add new task form with improved colors */}
                <div className="mt-8 bg-slate-700/80 backdrop-blur-sm p-6 rounded-lg border border-slate-600/50">
                  <h3 className="text-lg font-medium text-emerald-400 mb-4">Add New Task</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Task name"
                      className="w-full px-4 py-2 bg-slate-600/80 text-white rounded-lg border border-slate-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                    />
                    <textarea
                      placeholder="Task description"
                      className="w-full px-4 py-2 bg-slate-600/80 text-white rounded-lg border border-slate-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      rows="2"
                    />

                    {/* Time selection with improved styling */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="block text-gray-300 text-sm mb-1">Start Time</label>
                        <div className="relative">
                          <input
                            type="time"
                            className="w-full px-4 py-2 bg-slate-600/80 text-white rounded-lg border border-slate-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400"
                            value={newTaskStartTime}
                            onChange={(e) => setNewTaskStartTime(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="relative">
                        <label className="block text-gray-300 text-sm mb-1">End Time</label>
                        <div className="relative">
                          <input
                            type="time"
                            className="w-full px-4 py-2 bg-slate-600/80 text-white rounded-lg border border-slate-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400"
                            value={newTaskEndTime}
                            onChange={(e) => setNewTaskEndTime(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <button
                      className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg"
                      onClick={handleAddTask}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Task
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right panel - AI insights and streaks with improved colors */}
          <div className="w-full md:w-1/3 space-y-8">
            {/* Streaks section */}
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
              <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">Activity Streaks</h2>
              <div className="bg-slate-700/80 backdrop-blur-sm rounded-lg p-4 border border-slate-600/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white">Current Streak</span>
                  <span className="text-emerald-400 font-bold">{currentStreak} days</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, (currentStreak / (maxStreak || 1)) * 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center mt-6 mb-2">
                  <span className="text-white">Max Streak</span>
                  <span className="text-purple-400 font-bold">{maxStreak} days</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2.5 rounded-full" 
                    style={{ width: '100%' }}
                  ></div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-gray-300 text-sm">
                    {currentStreak === 0 
                      ? "Complete all tasks today to start your streak!" 
                      : `Keep going! You're on a ${currentStreak} day streak!`}
                  </p>
                </div>
              </div>
            </div>
            
            {/* AI Insights section with improved colors */}
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">AI Insights</h2>
                <button 
                  className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center transition-colors"
                  onClick={fetchAiInsights}
                >
                  <span>Refresh</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {aiInsights.map((insight) => (
                  <div key={insight.id} className="bg-slate-700/80 backdrop-blur-sm rounded-lg p-4 border border-slate-600/50">
                    <div className="flex items-start mb-2">
                      <Lightbulb className="w-5 h-5 text-amber-400 mr-2 flex-shrink-0 mt-1" />
                      <h3 className="text-white font-medium">{insight.title}</h3>
                    </div>
                    <p className="text-gray-300 text-sm mb-4">{insight.description}</p>
                    
                    {insight.recommendedTasks && (
                      <div className="mt-3">
                        <h4 className="text-emerald-400 text-sm font-medium mb-2">Recommended Task List:</h4>
                        <ul className="text-gray-300 text-sm mb-4 space-y-2">
                          {insight.recommendedTasks.map((task, i) => (
                            <li key={i} className="flex items-center">
                              <ChevronRight className="w-4 h-4 text-emerald-400 mr-2" />
                              {task}
                            </li>
                          ))}
                        </ul>
                        
                        <button
                          className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg"
                          onClick={() => adoptAiRecommendation(insight.id)}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Adopt This Plan
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                {aiInsights.length === 0 && (
                  <div className="text-center py-6 text-gray-400">
                    <p>Add more tasks to get personalized AI insights!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoListPage;