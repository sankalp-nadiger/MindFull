import React, { useState, useEffect } from 'react';
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
    
    
    setProfile({
      fullName: "Dr. abcdefg",
      email: "abcedfg@example.com",
      mobileNumber: "+1234567890",
      specifications: ["Anxiety", "Depression", "Stress Management"],
      yearExp: 8,
      availability: ["Mon-Fri, 9AM-5PM"],
      feedback: ["Great session, very helpful!", "Excellent counselor"],
      isAvailable: true
    });

 
    setSessions([
      {
        _id: "1",
        student: { _id: "s1", name: "Mindfull student" },
        issueDetails: "Anxiety management",
        status: "Pending",
        roomName: "session-1"
      },
      {
        _id: "2",
        student: { _id: "s2", name: "Mindfull student" },
        issueDetails: "Stress related to work",
        status: "Active",
        roomName: "session-2"
      }
    ]);

    setNotifications([
        {
          id: 1,
          type: 'session_request',
          title: 'New Session Request',
          message: 'Mindfull student has requested a counseling session',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          read: false,
          priority: 'high'
        },
        {
          id: 2,
          type: 'schedule_change',
          title: 'Schedule Update',
          message: 'Your session with mindfull student has been rescheduled to tomorrow',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          read: false,
          priority: 'medium'
        },
        {
          id: 3,
          type: 'feedback',
          title: 'New Feedback Received',
          message: 'You received new feedback from your last session',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          read: true,
          priority: 'low'
        }
      ]);
  
      // Update unread count
      setUnreadCount(notifications.filter(n => !n.read).length);
  


  }, []);

  const handleJoinSession = async (session) => {
    setIsJoiningSession(true);
    setSelectedSession(session);
    // In real app: Call getTwilioToken endpoint and handle video session
    setTimeout(() => setIsJoiningSession(false), 2000);
  };

  const handleEndSession = async (sessionId) => {
    // In real app: Call endSession endpoint
    setSessions(sessions.map(s => 
      s._id === sessionId ? {...s, status: 'Completed'} : s
    ));
  };

  const handleUpdateProfile = async (updates) => {
    // In real app: Call updateProfile endpoint
    setProfile(prev => prev ? {...prev, ...updates} : null);
  };


  const markNotificationAsRead = (notificationId) => {
    setNotifications(notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);
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
                      <h3 className="text-lg font-medium text-indigo-900">Active Sessions</h3>
                      <p className="text-3xl font-bold text-indigo-600">
                        {sessions.filter(s => s.status === 'Active').length}
                      </p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-green-900">Completed Sessions</h3>
                      <p className="text-3xl font-bold text-green-600">
                        {sessions.filter(s => s.status === 'Completed').length}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-yellow-900">Pending Sessions</h3>
                      <p className="text-3xl font-bold text-yellow-600">
                        {sessions.filter(s => s.status === 'Pending').length}
                      </p>
                    </div>
                  </div>

                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Recent Sessions</h3>
                    <div className="space-y-4">
                      {sessions.map(session => (
                        <div key={session._id} className="border border-gray-400 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-white">{session.student.name}</h4>
                              <p className="text-sm text-red-600">{session.issueDetails}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                session.status === 'Active' ? 'bg-green-100 text-green-800' :
                                session.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {session.status}
                              </span>
                              {session.status === 'Pending' && (
                                <button
                                  onClick={() => handleJoinSession(session)}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                  disabled={isJoiningSession}
                                >
                                  {isJoiningSession ? 'Joining...' : 'Join Session'}
                                </button>
                              )}
                              {session.status === 'Active' && (
                                <button
                                  onClick={() => handleEndSession(session._id)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                  End Session
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

{activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-white">Notifications</h2>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-sm text-indigo-400 hover:text-indigo-500"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`border rounded-lg p-4 transition-colors duration-200 ${
                          notification.read ? 'bg-white' : 'bg-indigo-50'
                        }`}
                        onClick={() => !notification.read && markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {getNotificationIcon(notification.type, notification.priority)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-indigo-900'}`}>
                                {notification.title}
                              </p>
                              <span className="text-sm text-gray-500">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}



              {activeTab === 'settings' && profile && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Profile Settings</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white">Full Name</label>
                      <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) => handleUpdateProfile({ fullName: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleUpdateProfile({ email: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white">Mobile Number</label>
                      <input
                        type="tel"
                        value={profile.mobileNumber}
                        onChange={(e) => handleUpdateProfile({ mobileNumber: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white">Years of Experience</label>
                      <input
                        type="number"
                        value={profile.yearExp}
                        onChange={(e) => handleUpdateProfile({ yearExp: parseInt(e.target.value) })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Councellor;