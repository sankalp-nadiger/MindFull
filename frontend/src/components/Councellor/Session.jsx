import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from "socket.io-client";
import { motion } from 'framer-motion';
import { Bell, Calendar, Users, Settings, LogOut, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CounsellorReview from './CounselorReview'; 

const socket = io(`${import.meta.env.VITE_BASE_URL}`, {
  transports: ["websocket"],
  withCredentials: true
});

const Session = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ending, setEnding] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [activeTab, setActiveTab] = useState('sessions');
  const navigate = useNavigate();
  const [showReview, setShowReview] = useState(false);
const [reviewSessionData, setReviewSessionData] = useState(null);
const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchActiveSessions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_API_URL}/counsellor/sessions`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
            },
          }
        );
        setSessions(response.data.sessions);
        setError('');
      } catch (error) {
        setError("Failed to load active sessions.");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveSessions();

    // Listen for new session requests
    socket.on('sessionRequested', (data) => {
      setSessions(prevSessions => [...prevSessions, {
        _id: data.sessionId,
        issueDetails: data.issueDetails,
        status: 'Pending',
        user: { username: data.userId }, // You might want to fetch full user details
        timestamp: data.timestamp
      }]);
    });

    return () => {
      socket.off('sessionRequested');
    };
  }, []);

  const acceptSession = async (sessionId) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/counsellor/accept`,
        { sessionId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );

      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session._id === sessionId ? { ...session, status: 'Active' } : session
        )
      );

      setActiveRoom(response.data.session.roomName);
    } catch (error) {
      setError("Failed to accept session.");
    } finally {
      setLoading(false);
    }
  };

 const endSession = async (sessionId) => {
  try {
    setEnding(true);
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_API_URL}/counsellor/end`,
      { sessionId },
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
        },
      }
    );

    // Check if user's sittingProgress is 0
    if (response.data.user?.sittingProgress === 0) {
      setReviewSessionData({
        sessionId: sessionId,
        duration: response.data.duration || 'N/A'
      });
      setCurrentUserId(response.data.user.userId);
      setShowReview(true);
    }

    socket.emit('sessionEnded', { sessionId });
    setSessions((prevSessions) =>
      prevSessions.filter((session) => session._id !== sessionId)
    );
    setActiveRoom(null);
    setError('');
  } catch (error) {
    setError("Failed to end session.");
  } finally {
    setEnding(false);
  }
};

  useEffect(() => {
    const handleSessionEnd = ({ sessionId }) => {
      setSessions((prevSessions) =>
        prevSessions.filter((session) => session._id !== sessionId)
      );
      setActiveRoom(null);
    };

    sessions.forEach(session => {
      socket.on(`sessionEnded-${session._id}`, handleSessionEnd);
    });

    return () => {
      sessions.forEach(session => {
        socket.off(`sessionEnded-${session._id}`, handleSessionEnd);
      });
    };
  }, [sessions]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-black">
      {/* Navbar */}
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
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-gray-100 rounded-lg shadow p-6">
              <div className="space-y-6">
                <button
                  onClick={() => navigate('/councellor')}
                  className="flex items-center space-x-3 w-full p-2 rounded text-gray-600"
                >
                  <Users className="h-5 w-5" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => navigate('/notifications')}
                  className={`flex items-center space-x-3 w-full p-2 rounded ${
                    activeTab === 'notifications' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </button>
                <button
                  onClick={() => navigate('/sessions')}
                  className={`flex items-center space-x-3 w-full p-2 rounded ${
                    activeTab === 'sessions' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'
                  }`}
                >
                  <Video className="h-5 w-5" />
                  <span>Sessions</span>
                </button>
                <button
                  onClick={() => navigate('/schedule')}
                  className={`flex items-center space-x-3 w-full p-2 rounded ${
                    activeTab === 'schedule' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                  <span>Schedule</span>
                </button>
                <button
                  onClick={() => navigate('/Councellorprofile')}
                  className={`flex items-center space-x-3 w-full p-2 rounded ${
                    activeTab === 'profile' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <span>Profile</span>
                </button>
                <button className="flex items-center space-x-3 w-full p-2 rounded text-red-600 hover:bg-red-50">
                  <LogOut className="h-5 w-5" />
                  <a href="/">Logout</a>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <div className="bg-white shadow-lg rounded-lg p-6">
              {error && <p className="text-red-500 text-center mb-4">{error}</p>}

              {loading ? (
                <div className="flex justify-center items-center">
                  <div className="loader">Loading...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sessions.map((session) => (
                    <motion.div
                      key={session._id}
                      className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h5 className="text-xl font-semibold">{session.user.username}</h5>
                      <p className="text-sm text-gray-600">{session.issueDetails}</p>

                      <div className="mt-4">
                        {session.status === 'Pending' && (
                          <button
                            onClick={() => acceptSession(session._id)}
                            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
                            disabled={loading}
                          >
                            {loading ? 'Accepting...' : 'Accept Session'}
                          </button>
                        )}

                        {session.status === 'Active' && (
                          <button
                            onClick={() => endSession(session._id)}
                            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition mt-2"
                            disabled={ending}
                          >
                            {ending ? 'Ending...' : 'End Session'}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeRoom && (
                <div className="mt-8">
                  <h2 className="text-2xl font-semibold">Live Video Session</h2>
                  <div className="relative pt-[56.25%]">
                    <iframe
                      src={`https://meet.jit.si/${activeRoom}`}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="camera; microphone; fullscreen; display-capture"
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
<CounsellorReview
  isOpen={showReview}
  onClose={() => setShowReview(false)}
  sessionData={reviewSessionData}
  userId={currentUserId}
/>
    </div>
  );
};

export default Session;