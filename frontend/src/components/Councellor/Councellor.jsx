import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import axios from 'axios'; // Import axios for API calls
import { Bell, Calendar, Users, Settings, LogOut, Video, User, CheckCircle, AlertCircle, Clock } from 'lucide-react';

function Councellor() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sessions, setSessions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate(); // Initialize the navigate function

  useEffect(() => {
    axios.get('http://localhost:8000/api/profile')
      .then(response => setProfile(response.data))
      .catch(error => console.error('Error fetching profile data', error));

    axios.get('http://localhost:8000/api/sessions')
      .then(response => setSessions(response.data))
      .catch(error => console.error('Error fetching sessions', error));

    axios.get('http://localhost:8000/api/notifications')
      .then(response => {
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.read).length);
      })
      .catch(error => console.error('Error fetching notifications', error));
  }, []);

  const handleJoinSession = (session) => {
    // Navigate to the /video route when the session is joined
    navigate('/video');
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
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
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
                  onClick={() => handleJoinSession()} // Handle join session to navigate to /video
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
                              onClick={() => handleJoinSession(session)} // Clicking this will navigate to /video
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Join
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Other sections like notifications and profile */}
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
