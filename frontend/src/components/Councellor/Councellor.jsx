import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Users, Settings, LogOut, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Councellor() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/counsellor/stats', {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`, // Assuming token is stored in localStorage
          },
        });
        setStats(response.data);
      } catch (err) {
        setError('Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-black">
      <nav className="bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img src="plant.png" alt="Logo" style={{ height: "30px", width: "30px" }} />
              <span className="ml-2 text-xl font-semibold text-white">Counsellor Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
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
                </button>
                <button
                  onClick={() => navigate('/sessions')}
                  className="flex items-center space-x-3 w-full p-2 rounded text-gray-600"
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
                <button className="flex items-center space-x-3 w-full p-2 rounded text-red-600 hover:bg-red-50">
                  <LogOut className="h-5 w-5" />
                  <a href="/">Logout</a>
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-9">
            <div className="bg-white shadow-lg rounded-lg p-6">
              {activeTab === 'dashboard' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Hello {stats ? stats.counselorName : 'Loading...'}
                    <br></br>
                    Here are your Stats!
                  </h2>
                  {loading ? (
                    <p>Loading stats...</p>
                  ) : error ? (
                    <p>{error}</p>
                  ) : (
                    <div>
                      {/* <p><strong>Name:</strong> {stats.fullName}</p> */}
                      <p><strong>Sessions Taken:</strong> {stats.sessionsTaken}</p>
                      {/* <p><strong>Total Session Duration:</strong> {stats.totalSessionDuration}</p> */}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Notifications</h2>
                  <p>No new notifications</p>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Schedule</h2>
                  <p>Here you can manage your schedule.</p>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Settings</h2>
                  <p>Update your preferences here.</p>
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
