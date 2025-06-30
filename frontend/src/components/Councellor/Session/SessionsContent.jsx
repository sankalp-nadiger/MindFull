import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from "socket.io-client";
import { motion } from 'framer-motion';
import CounsellorReview from './CounselorReview'; 

const socket = io(`${import.meta.env.VITE_BASE_URL}`, {
  transports: ["websocket"],
  withCredentials: true
});

// Draggable Video Meet Window Component
const VideoMeetWindow = ({ activeRoom, onClose }) => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const windowRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.closest('.window-controls') || e.target.closest('.resize-handle')) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragStart.x)),
        y: Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragStart.y))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResize = (e, direction) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;
    const startPosX = position.x;
    const startPosY = position.y;

    const onMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startPosX;
      let newY = startPosY;

      if (direction.includes('right')) {
        newWidth = Math.max(400, startWidth + deltaX);
      }
      if (direction.includes('left')) {
        newWidth = Math.max(400, startWidth - deltaX);
        newX = startPosX + (startWidth - newWidth);
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(300, startHeight + deltaY);
      }
      if (direction.includes('top')) {
        newHeight = Math.max(300, startHeight - deltaY);
        newY = startPosY + (startHeight - newHeight);
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, position.x, position.y, size.width, size.height]);

  return (
    <motion.div
      ref={windowRef}
      className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      } ${isResizing ? 'select-none' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: isMinimized ? 'auto' : `${size.height}px`,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      {/* Window Header */}
      <div 
        className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Live Video Session</h3>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-blue-100 text-xs">LIVE</span>
              </div>
            </div>
          </div>
          
          {/* Window Controls */}
          <div className="window-controls flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-6 h-6 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center transition-colors duration-200"
              title={isMinimized ? "Restore" : "Minimize"}
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMinimized ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                )}
              </svg>
            </button>
            <button
              onClick={onClose}
              className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors duration-200"
              title="Close"
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Window Content */}
      {!isMinimized && (
        <div className="relative bg-slate-900" style={{ height: `${size.height - 60}px` }}>
          <iframe
            src={`https://meet.jit.si/${activeRoom}`}
            className="w-full h-full"
            allow="camera; microphone; fullscreen; display-capture"
            title="Video Session"
          ></iframe>
        </div>
      )}

      {/* Resize Handles */}
      {!isMinimized && (
        <>
          {/* Corner handles */}
          <div 
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize resize-handle"
            onMouseDown={(e) => handleResize(e, 'top-left')}
          />
          <div 
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize resize-handle"
            onMouseDown={(e) => handleResize(e, 'top-right')}
          />
          <div 
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize resize-handle"
            onMouseDown={(e) => handleResize(e, 'bottom-left')}
          />
          <div 
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize resize-handle bg-gradient-to-tl from-blue-500/20 to-transparent"
            onMouseDown={(e) => handleResize(e, 'bottom-right')}
          />
          
          {/* Edge handles */}
          <div 
            className="absolute top-0 left-3 right-3 h-1 cursor-n-resize resize-handle"
            onMouseDown={(e) => handleResize(e, 'top')}
          />
          <div 
            className="absolute bottom-0 left-3 right-3 h-1 cursor-s-resize resize-handle"
            onMouseDown={(e) => handleResize(e, 'bottom')}
          />
          <div 
            className="absolute left-0 top-3 bottom-3 w-1 cursor-w-resize resize-handle"
            onMouseDown={(e) => handleResize(e, 'left')}
          />
          <div 
            className="absolute right-0 top-3 bottom-3 w-1 cursor-e-resize resize-handle"
            onMouseDown={(e) => handleResize(e, 'right')}
          />
        </>
      )}
    </motion.div>
  );
};

const SessionsContent = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ending, setEnding] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
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
        user: { username: data.userId },
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
          duration: response.data.duration || 'N/A',
          fullName: response.data.user.fullName || ''
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <motion.div 
          className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-slate-200/60"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
          <div className="relative p-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Active Sessions
                </h1>
                <p className="text-slate-600 mt-1 font-medium">Manage your ongoing and pending counselling sessions</p>
              </div>
            </div>
            
            {/* Stats Bar */}
            <div className="mt-6 flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-600">
                  {sessions.filter(s => s.status === 'Active').length} Active
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-600">
                  {sessions.filter(s => s.status === 'Pending').length} Pending
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                <span className="text-sm font-medium text-slate-600">
                  {sessions.length} Total
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div 
            className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-3">
              <div className="p-1 bg-red-100 rounded-full">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Sessions Content */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {loading ? (
            <div className="flex flex-col justify-center items-center py-24">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
              <p className="mt-4 text-slate-600 font-medium">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-24 px-6">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">All Clear!</h3>
              <p className="text-slate-600 text-lg max-w-md mx-auto">You don't have any active or pending sessions at the moment. Take a well-deserved break!</p>
            </div>
          ) : (
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {sessions.map((session, index) => (
                  <motion.div
                    key={session._id}
                    className="group relative bg-white border border-slate-200 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    {/* Status Indicator */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                      session.status === 'Active' 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                        : 'bg-gradient-to-r from-amber-400 to-orange-500'
                    }`}></div>
                    
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            session.status === 'Active' 
                              ? 'bg-green-100' 
                              : 'bg-amber-100'
                          }`}>
                            <svg className={`w-5 h-5 ${
                              session.status === 'Active' 
                                ? 'text-green-600' 
                                : 'text-amber-600'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <h5 className="text-lg font-bold text-slate-800">{session.user.username}</h5>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              session.status === 'Active' 
                                ? 'bg-green-100 text-green-700 ring-1 ring-green-600/20' 
                                : 'bg-amber-100 text-amber-700 ring-1 ring-amber-600/20'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                session.status === 'Active' ? 'bg-green-500' : 'bg-amber-500'
                              }`}></span>
                              {session.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Issue Details */}
                      <div className="mb-6">
                        <h6 className="text-sm font-semibold text-slate-700 mb-2">Session Details</h6>
                        <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg border">
                          {session.issueDetails}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        {session.status === 'Pending' && (
                          <button
                            onClick={() => acceptSession(session._id)}
                            className="group relative w-full overflow-hidden bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white py-3.5 px-6 rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-emerald-400/20"
                            disabled={loading}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            <div className="relative z-10">
                              {loading ? (
                                <div className="flex items-center justify-center space-x-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                  <span className="text-sm font-medium">Accepting Session...</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center space-x-2">
                                  <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-200">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <span className="text-sm font-semibold tracking-wide">Accept Session</span>
                                </div>
                              )}
                            </div>
                          </button>
                        )}

                        {session.status === 'Active' && (
                          <button
                            onClick={() => endSession(session._id)}
                            className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 px-4 rounded-lg hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            disabled={ending}
                          >
                            {ending ? (
                              <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                <span>Ending...</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>End Session</span>
                              </div>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Live Video Session - Draggable Window */}
        {activeRoom && (
          <VideoMeetWindow 
            activeRoom={activeRoom}
            onClose={() => setActiveRoom(null)}
          />
        )}
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

export default SessionsContent;