import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';

const socket = io('http://localhost:8000', {
  transports: ['websocket'],
  withCredentials: true,
});

const VideoChat = () => {
  const [issueDetails, setIssueDetails] = useState('');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ending, setEnding] = useState(false);
  const [notes, setNotes] = useState('');
  const [noteStatus, setNoteStatus] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [rating, setRating] = useState(5);

  // Previous functions remain the same...
  const requestSession = async () => {
    if (!issueDetails.trim()) {
      setError('Please provide issue details.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:8000/api/counsellor/request',
        { issueDetails },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );
      setSession(response.data.session);
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
        const response = await axios.get('http://localhost:8000/api/users/sessions', {
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

  useEffect(() => {
    if (!session) return;

    const handleSessionEnd = () => {
      setSession(null);
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
        'http://localhost:8000/api/counsellor/addNotes',
        { sessionId: session._id, notes },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );
      setNoteStatus('Notes added successfully!');
      setNotes('');
    } catch (error) {
      setNoteStatus('Failed to add notes. Please try again.');
    }
  };

  // Modified endSession function to show feedback form
  const endSession = async () => {
    if (!session) {
      setError('No active session to end.');
      return;
    }

    try {
      setEnding(true);
      await axios.post(
        'http://localhost:8000/api/users/end',
        { sessionId: session._id },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );

      socket.emit('endSession', { sessionId: session._id });
      setShowFeedback(true); // Show feedback form instead of clearing session
      setEnding(false);
    } catch (error) {
      setError('Failed to end session. Please try again.');
      setEnding(false);
    }
  };

  // New function to handle feedback submission
  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      setFeedbackStatus('Please provide some feedback');
      return;
    }

    try {
      await axios.post(
        'http://localhost:8000/api/users/feedback',
        {
          sessionId: session._id,
          feedback,
          //rating
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );
      setFeedbackStatus('Thank you for your feedback!');
      setTimeout(() => {
        setSession(null);
        setShowFeedback(false);
        setFeedback('');
        setRating(5);
      }, 2000);
    } catch (error) {
      setFeedbackStatus('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-r from-purple-500 to-blue-500">
      <motion.div
        className={`bg-white rounded-lg shadow-lg p-6 ${
          session?.status === 'Active' ? 'w-[95%]' : 'max-w-lg w-full'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: [20, -5, 0] }}
        transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
      >
        <h1 className="text-3xl font-semibold text-center mb-4 text-purple-800">
          {showFeedback ? 'Session Feedback' : 'Request a Counseling Session'}
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
                    className={`text-2xl ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
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
              <p className={`text-center ${
                feedbackStatus.includes('Thank you') ? 'text-green-600' : 'text-red-500'
              }`}>
                {feedbackStatus}
              </p>
            )}
            <button
              onClick={handleFeedbackSubmit}
              className="w-full p-3 bg-purple-600 text-white rounded-md"
            >
              Submit Feedback
            </button>
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