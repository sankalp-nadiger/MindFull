import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for API calls
import { Bell, Calendar, Users, Settings, LogOut, Video, User, CheckCircle, AlertCircle, Clock } from 'lucide-react';

function Councellor() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sessions, setSessions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isJoiningSession, setIsJoiningSession] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch profile data from the backend
    axios.get('http://localhost:8000/api/profile')
      .then(response => setProfile(response.data))
      .catch(error => console.error('Error fetching profile data', error));

    // Fetch sessions data from the backend
    axios.get('http://localhost:8000/api/sessions')
      .then(response => setSessions(response.data))
      .catch(error => console.error('Error fetching sessions', error));

    // Fetch notifications data from the backend
    axios.get('http://localhost:8000/api/notifications')
      .then(response => {
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.read).length);
      })
      .catch(error => console.error('Error fetching notifications', error));
  }, []);

  const handleJoinSession = async (session) => {
    setIsJoiningSession(true);
    setSelectedSession(session);
    // Call backend to get Twilio token and handle video session (mocked)
    setTimeout(() => setIsJoiningSession(false), 2000);
  };

  const handleEndSession = async (sessionId) => {
    // In real app: Call backend to end the session
    await axios.post(`http://localhost:8000/api/sessions/${sessionId}/end`);
    setSessions(sessions.map(s => 
      s._id === sessionId ? { ...s, status: 'Completed' } : s
    ));
  };

  const handleUpdateProfile = async (updates) => {
    try {
      await axios.put('http://localhost:8000/api/profile', updates);
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating profile', error);
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Update notification read status on backend
    axios.post(`http://localhost:8000/api/notifications/${notificationId}/read`);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);

    // Update all notifications to read on the backend
    axios.post('http://localhost:8000/api/notifications/markAllAsRead');
  };

  const getNotificationIcon = (type, priority) => {
    switch (type) {
      case 'session_request':
        return <Clock className={`h-6 w-6 ${priority === 'high' ? 'text-red-500' : 'text-blue-500'}`} />;
      case 'schedule_change':
        return <AlertCircle className={`h-6 w-6 ${priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'}`} />;
      case 'feedback':
        return <CheckCircle className={`h-6 w-6 ${priority === 'low' ? 'text-green-500' : 'text-blue-500'}`} />;
      default:
        return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-black">
      <nav className="bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img
                src="plant.png"
                alt="Logo"
                style={{ height: "30px", width: "30px" }}
              />
              <span className="ml-2 text-xl font-semibold text-white">
                Councellor Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('notifications')}
                className="relative p-2 rounded-full hover:bg-gray-100"
              >
                <Bell className="h-6 w-6 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Profile"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <div className="bg-gray-100 rounded-lg shadow p-6">
              <div className="space-y-6">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center space-x-3 w-full p-2 rounded ${
                    activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'
                  }`}
                >
                  <Users className="h-5 w-5" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex items-center space-x-3 w-full p-2 rounded ${
                    activeTab === 'notifications' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`flex items-center space-x-3 w-full p-2 rounded ${
                    activeTab === 'sessions' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'
                  }`}
                >
                  <Video className="h-5 w-5" />
                  <span>Sessions</span>
                </button>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`flex items-center space-x-3 w-full p-2 rounded ${
                    activeTab === 'schedule' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                  <span>Schedule</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center space-x-3 w-full p-2 rounded ${
                    activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {/* Handle logout */}}
                  className="flex items-center space-x-3 w-full p-2 rounded text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  <a href='/'>Logout</a>
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-9">
            <div className="bg-gray-800 rounded-lg shadow p-6">
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Welcome back, {profile?.fullName}</h2>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-indigo-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-indigo-600">Upcoming Sessions</h3>
                      <ul className="space-y-4">
                        {sessions.filter(s => s.status === 'Scheduled').map(session => (
                          <li key={session._id} className="flex justify-between">
                            <span className="text-sm text-gray-700">{session.title}</span>
                            <button
                              onClick={() => handleJoinSession(session)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Join
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-indigo-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-indigo-600">Notifications</h3>
                      <ul className="space-y-4">
                        {notifications.map(notification => (
                          <li key={notification.id} className="flex justify-between">
                            <span className="text-sm text-gray-700">
                              {getNotificationIcon(notification.type, notification.priority)}
                              <span className="ml-2">{notification.message}</span>
                            </span>
                            <button
                              onClick={() => markNotificationAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Mark as Read
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-indigo-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-indigo-600">Your Profile</h3>
                      <div className="space-y-4">
                        {profile && (
                          <div>
                            <p className="text-sm text-gray-700">Name: {profile.fullName}</p>
                            <p className="text-sm text-gray-700">Email: {profile.email}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Add other tabs like notifications, sessions, etc */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Councellor;