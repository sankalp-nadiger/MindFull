import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';

const socket = io('http://localhost:8000', {
  transports: ['websocket'],
  withCredentials: true,
});

const VideoChat = () => {
  const navigate = useNavigate();
  
  const [issueDetails, setIssueDetails] = useState('');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [endedSession, setEndedSession] = useState(null);
  const [error, setError] = useState('');
  const [ending, setEnding] = useState(false);
  const [notes, setNotes] = useState('');
  const [noteStatus, setNoteStatus] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [rating, setRating] = useState(5);

  const requestSession = async () => {
    if (!issueDetails.trim()) {
      setError('Please provide issue details.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/counsellor/request`,
        { issueDetails },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );
      
      const newSession = response.data.session;
      setSession(newSession);
      
      // Emit socket event for new session request
      socket.emit('sessionRequested', {
        sessionId: newSession._id,
        issueDetails: issueDetails,
        userId: newSession.userId, // Assuming this is available in the session object
        timestamp: new Date().toISOString()
      });
      
      setError('');
    } catch (error) {
      setError('Failed to request session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session || session.status === 'Active') return;

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/users/sessions`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        });

        const updatedSession = response.data.sessions.find(s => s._id === session._id);
        if (updatedSession && updatedSession.status === 'Active') {
          setSession(updatedSession);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Failed to fetch active sessions.');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [session]);

  // Updated useEffect to handle session end from either side
  useEffect(() => {
    if (!session) return;

    const handleSessionEnd = (data) => {
      // Store the session before clearing it
      setEndedSession(session);
      setSession(null);
      // Show feedback form regardless of who ended the session
      setShowFeedback(true);
    };

    socket.on(`sessionEnded-${session._id}`, handleSessionEnd);

    return () => {
      socket.off(`sessionEnded-${session._id}`, handleSessionEnd);
    };
  }, [session]);

  const handleAddNotes = async () => {
    if (!notes.trim()) {
      setNoteStatus('Notes cannot be empty');
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/users/addNotes`,
        { sessionId: session._id, notes },
      );
      setNoteStatus('Notes added successfully!');
      setNotes('');
    } catch (error) {
      setNoteStatus('Failed to add notes. Please try again.');
    }
  };

  const endSession = async () => {
    if (!session) {
      setError('No active session to end.');
      return;
    }
  
    try {
      setEnding(true);
      await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/users/end`,
        { sessionId: session._id },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );
  
      socket.emit('endSession', { sessionId: session._id });
      setEndedSession(session);
      setSession(null);
      setShowFeedback(true);
      setEnding(false);
    } catch (error) {
      setError('Failed to end session. Please try again.');
      setEnding(false);
    }
  };  

  const handleFeedbackSubmit = async () => {
    if (!endedSession || !endedSession._id) {
      setFeedbackStatus("Session information missing.");
      return;
    }
  
    if (!feedback.trim()) {
      setFeedbackStatus("Please provide some feedback");
      return;
    }
  
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/users/feedback`,
        {
          feedback,
          rating,
          sessionId: endedSession._id
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );
  
      setFeedbackStatus("Thank you for your feedback!");
      handleFeedbackComplete();
    } catch (error) {
      setFeedbackStatus("Failed to submit feedback. Please try again.");
    }
  };

  // New function to handle feedback skip
  const handleSkipFeedback = () => {
    handleFeedbackComplete();
  };

  // New function to handle cleanup after feedback submission or skip
  const handleFeedbackComplete = () => {
    setTimeout(() => {
      setShowFeedback(false);
      setFeedback('');
      setRating(5);
      setEndedSession(null);
      setFeedbackStatus('');
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-black via-blue-950 to-black">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/MainPage')}
        className="absolute top-4 left-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Back To Main Page
      </button>

      <motion.div
        className={`bg-white rounded-lg shadow-lg p-6 ${session?.status === 'Active' ? 'w-[95%]' : 'max-w-lg w-full'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: [20, -5, 0] }}
        transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
      >
        <h1 className="text-3xl font-semibold text-center mb-4 text-purple-800">
          {showFeedback ? 'Give a Feedback to the Counsellor' : 'Request a Counseling Session'}
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {!session && !showFeedback ? (
          <div className="space-y-4">
            <textarea
              value={issueDetails}
              onChange={(e) => setIssueDetails(e.target.value)}
              placeholder="Describe your issue"
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
            />
            <button
              onClick={requestSession}
              className={`w-full p-3 bg-green-600 text-white rounded-md ${loading ? 'opacity-50' : ''}`}
              disabled={loading}
            >
              {loading ? 'Requesting...' : 'Request Session'}
            </button>
          </div>
        ) : showFeedback ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <p className="text-lg font-medium">Rate your experience (1-5):</p>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Please share your feedback about the session"
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
            />
            {feedbackStatus && (
              <p className={`text-center ${feedbackStatus.includes('Thank you') ? 'text-green-600' : 'text-red-500'}`}>
                {feedbackStatus}
              </p>
            )}
            <div className="flex space-x-4">
              <button
                onClick={handleFeedbackSubmit}
                className="flex-1 p-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Submit Feedback
              </button>
              <button
                onClick={handleSkipFeedback}
                className="flex-1 p-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Session Requested!</h3>
            <p>Status: {session.status}</p>
            <p>Counselor: {session.counselor?.fullName || 'Waiting for counselor...'}</p>

            {session.status === 'Active' && (
              <div className="w-full h-[500px] relative">
                <iframe
                  src={`https://meet.jit.si/${session.roomName}`}
                  width="100%"
                  height="100%"
                  allow="camera; microphone; fullscreen; display-capture"
                  className="rounded-none shadow-none"
                />
              </div>
            )}

            <div className="space-y-4 mt-4">
              <h4 className="text-lg font-semibold">Add Notes</h4>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter your notes here"
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
              />
              <button
                onClick={handleAddNotes}
                className="w-full p-3 bg-blue-600 text-white rounded-md"
              >
                Add Notes
              </button>
              {noteStatus && <p className="text-center mt-2">{noteStatus}</p>}
            </div>

            <button
              onClick={endSession}
              className={`w-full p-3 bg-red-600 text-white rounded-md ${ending ? 'opacity-50' : ''}`}
              disabled={ending}
            >
              {ending ? 'Ending...' : 'End Session'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VideoChat;