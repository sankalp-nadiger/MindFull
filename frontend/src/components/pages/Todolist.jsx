import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import { ArrowUp, ArrowDown, Check, Plus, Award, Lightbulb, ChevronRight, Trash, Save } from 'lucide-react';

const TodoListPage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [aiInsights, setAiInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchTasks();
    fetchStreaks();
    fetchAiInsights();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // Replace with actual API call
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/tasks/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
        },});
      const data = await response.json();
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStreaks = async () => {
    try {
      // Replace with actual API call
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/tasks/streaks`);
      const data = await response.json();
      setCurrentStreak(data.currentStreak || 0);
      setMaxStreak(data.maxStreak || 0);
    } catch (error) {
      console.error('Error fetching streaks:', error);
    }
  };

  const fetchAiInsights = async () => {
    try {
      // Replace with actual API call
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/tasks/ai-insights`);
      const data = await response.json();
      setAiInsights(data.insights || []);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskName.trim()) return;
    
    try {
      console.log(sessionStorage.getItem('accessToken'))
      // Replace with actual API call
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/tasks/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTaskName,
          description: newTaskDescription,
          completed: false,
        }),
      });
      
      const data = await response.json();
      setTasks([...tasks, data]);
      setNewTaskName('');
      setNewTaskDescription('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      // Replace with actual API call
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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskIds: newTasks.map(task => task.id) }),
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      {/* Streak info banner */}
      <div className="bg-gray-800 py-2 px-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h2 className="text-xl font-bold text-purple-400">TaskMaster</h2>
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-400" />
              <span className="text-sm">Current Streak: {currentStreak} days</span>
            </div>
            <div className="flex items-center">
              <Award className="w-5 h-5 mr-2 text-purple-400" />
              <span className="text-sm">Max Streak: {maxStreak} days</span>
            </div>
          </div>
        </div>
      </div>
  
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left panel - Task list */}
          <div className="w-full md:w-2/3 bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-green-400 mb-6">My Tasks</h2>
            
            {/* Add new task */}
            <div className="mb-8 bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-400 mb-4">Add New Task</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Task name"
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                />
                <textarea
                  placeholder="Task description"
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  rows="2"
                />
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center justify-center"
                  onClick={handleAddTask}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {tasks.map((task, index) => (
                  <div key={task.id} className="flex relative pb-8 sm:items-center">
                    <div className="h-full w-6 absolute inset-0 flex items-center justify-center">
                      <div className="h-full w-1 bg-gray-600 pointer-events-none"></div>
                    </div>
                    <div className="flex-shrink-0 w-6 h-6 rounded-full mt-10 sm:mt-0 inline-flex items-center justify-center bg-green-500 text-white relative z-10 title-font font-medium text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-grow md:pl-8 pl-6 flex sm:items-center items-start flex-col sm:flex-row">
                      <div className="flex-shrink-0 w-16 h-16 bg-green-100 text-green-500 rounded-full inline-flex items-center justify-center">
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
                        <h2 className={`font-medium title-font mb-1 text-xl ${task.completed ? 'text-gray-500 line-through' : 'text-green-400'}`}>
                          {task.title}
                        </h2>
                        <p className={`leading-relaxed ${task.completed ? 'text-gray-600' : 'text-gray-300'}`}>
                          {task.description}
                        </p>
                        
                        <div className="mt-4 flex space-x-3">
                          <button
                            className={`px-4 py-2 ${task.completed ? 'bg-gray-600' : 'bg-green-500'} text-white rounded-lg flex items-center`}
                            onClick={() => handleCompleteTask(task._id)}
                          >
                            {task.completed ? 'Undo' : 'Done'}
                          </button>
                          
                          <div className="flex">
                            <button
                              className="p-2 bg-gray-600 text-gray-300 rounded-l-lg"
                              onClick={() => handleMoveTask(index, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 bg-gray-600 text-gray-300 rounded-r-lg"
                              onClick={() => handleMoveTask(index, 'down')}
                              disabled={index === tasks.length - 1}
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <button
                            className="p-2 bg-red-500 text-white rounded-lg"
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
              </div>
            )}
          </div>
          
          {/* Right panel - AI insights and streaks */}
          <div className="w-full md:w-1/3 space-y-8">
            {/* Streaks section */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-green-400 mb-4">Activity Streaks</h2>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white">Current Streak</span>
                  <span className="text-green-400 font-bold">{currentStreak} days</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2.5">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (currentStreak / (maxStreak || 1)) * 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center mt-6 mb-2">
                  <span className="text-white">Max Streak</span>
                  <span className="text-purple-400 font-bold">{maxStreak} days</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2.5">
                  <div 
                    className="bg-purple-500 h-2.5 rounded-full" 
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
            
            {/* AI Insights section */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-green-400">AI Insights</h2>
                <button 
                  className="text-sm text-green-400 flex items-center"
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
                  <div key={insight.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start mb-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-1" />
                      <h3 className="text-white font-medium">{insight.title}</h3>
                    </div>
                    <p className="text-gray-300 text-sm mb-4">{insight.description}</p>
                    
                    {insight.recommendedTasks && (
                      <div className="mt-3">
                        <h4 className="text-green-400 text-sm font-medium mb-2">Recommended Task List:</h4>
                        <ul className="text-gray-300 text-sm mb-4 space-y-2">
                          {insight.recommendedTasks.map((task, i) => (
                            <li key={i} className="flex items-center">
                              <ChevronRight className="w-4 h-4 text-green-400 mr-2" />
                              {task}
                            </li>
                          ))}
                        </ul>
                        
                        <button
                          className="w-full px-4 py-2 bg-green-500 text-white rounded-lg flex items-center justify-center"
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