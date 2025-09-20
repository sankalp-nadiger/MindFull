import { useState, useEffect } from "react";
import { Clock, CheckCircle2, Plus, Calendar, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Suggestion() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, []);

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
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setIsLoading(false);
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
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  // Filter tasks for today and sort by time
  const getTodaysTasks = () => {
    const today = new Date();
    const todayString = today.toDateString();
    
    return tasks
      .filter(task => {
        const taskDate = new Date(task.scheduledDate || task.createdAt);
        return taskDate.toDateString() === todayString;
      })
      .sort((a, b) => {
        const timeA = new Date(a.scheduledTime || a.createdAt);
        const timeB = new Date(b.scheduledTime || b.createdAt);
        return timeA - timeB;
      });
  };

  // Get tasks that are upcoming (after current time)
  const getUpcomingTasks = () => {
    const todaysTasks = getTodaysTasks();
    return todaysTasks.filter(task => {
      if (!task.scheduledTime) return true; // Include tasks without specific time
      const taskTime = new Date(`${new Date().toDateString()} ${task.scheduledTime}`);
      return taskTime > currentTime;
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Anytime";
    const time = new Date(`2000-01-01 ${timeString}`);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeUntilTask = (taskTime) => {
    if (!taskTime) return "";
    const taskDateTime = new Date(`${new Date().toDateString()} ${taskTime}`);
    const diffMs = taskDateTime - currentTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) return `in ${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    return `in ${diffHours}h ${remainingMins}m`;
  };

  const TaskPlaceholder = () => (
    <div className="relative font-poppins bg-gradient-to-r from-cyan-900/20 to-purple-900/20 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400/60 transition-all duration-300 h-auto min-h-[12rem] flex items-center justify-center text-center w-full group overflow-hidden">
  
  {/* Shine Effect */}
  <div className="absolute inset-0 z-0 pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:opacity-0 group-hover:before:opacity-100 before:blur-sm before:translate-x-[-100%] group-hover:before:translate-x-[200%] before:rotate-12 before:transition before:duration-1000 before:ease-in-out" />

  <div className="flex flex-col sm:flex-row items-center sm:space-x-6 text-left z-10">
    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4 sm:mb-0">
      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
    </div>

    <div className="text-center sm:text-left">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No Tasks Scheduled</h3>
      <p className="text-gray-300 text-sm mb-4 max-w-xs sm:max-w-md mx-auto sm:mx-0">
        Your day is clear! Add a task to start optimizing your time.
      </p>

      <button 
        onClick={() => navigate('/todo')}
        className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/25 mx-auto sm:mx-0">
        <Plus className="w-4 h-4" />
        <span>Add Task Now</span>
      </button>
    </div>
  </div>
</div>

  );

  const todaysTasks = getTodaysTasks();
  const upcomingTasks = getUpcomingTasks();

  if (isLoading) {
    return (
      <div className="bg-black/90 backdrop-blur-xl p-8 rounded-2xl border border-gray-800/50 w-full">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  } 
  return (
    <div className="shadow-[4px_4px_0_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.4)] transition duration-300 p-6  w-full">
      <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto backdrop-blur-sm  bg-blue-950/40 opacity-90 p-8 rounded-lg shadow-lg shadow-blue-950/60 hover:shadow-blue-600/50 duration-100  transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Your To-Do today
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })} • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 px-4 py-2 rounded-xl">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm font-medium">{todaysTasks.length} Tasks Today</span>
          </div>
        </div>

        {todaysTasks.length === 0 ? (
          <TaskPlaceholder />
        ) : (
          <div className="space-y-6">
            {/* Current Time Indicator */}
            <div className="flex items-center space-x-4 py-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <div className="h-px bg-gradient-to-r from-red-500 to-transparent flex-1"></div>
              <span className="text-red-400 text-sm font-medium">NOW</span>
            </div>

            {/* Upcoming Tasks Timeline */}
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task, index) => (
                <div key={task._id} className="relative">
                  {/* Timeline connector */}
                  {index < upcomingTasks.length - 1 && (
                    <div className="absolute left-6 top-16 w-px h-8 bg-gradient-to-b from-cyan-500/50 to-purple-500/50"></div>
                  )}
                  
                  <div className="flex items-start space-x-4 group">
                    {/* Time indicator */}
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
                        task.completed 
                          ? 'bg-green-500/20 border-green-500 text-green-400' 
                          : 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-500/50 text-cyan-400 group-hover:border-cyan-400'
                      }`}>
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {formatTime(task.scheduledTime)}
                      </span>
                    </div>

                    {/* Task card */}
                    <div className={`flex-1 p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 border ${
                      task.completed
                        ? 'bg-green-900/10 border-green-500/30 opacity-75'
                        : 'bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-gray-700/50 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold mb-2 ${
                            task.completed ? 'text-gray-400 line-through' : 'text-white'
                          }`}>
                            {task.title}
                          </h3>
                          {task.content && (
                            <p className={`text-sm mb-3 ${
                              task.completed ? 'text-gray-500' : 'text-gray-300'
                            }`}>
                              {task.content}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-xs">
                            {task.type && (
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg">
                                {task.type}
                              </span>
                            )}
                            {task.scheduledTime && !task.completed && (
                              <span className="text-cyan-400 font-medium">
                                {getTimeUntilTask(task.scheduledTime)}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleCompleteTask(task._id)}
                          className={`w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                            task.completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-600 hover:border-cyan-400 hover:bg-cyan-400/10'
                          }`}
                        >
                          {task.completed && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button 
            onClick={() => navigate('/todo')}
            className="bg-gradient-to-r mt-9 from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-cyan-500/25">
            <Plus className="w-4 h-4" />
            <span>Add Task Now</span>
          </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
                <p className="text-gray-400">No more tasks scheduled for today. Great work!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}