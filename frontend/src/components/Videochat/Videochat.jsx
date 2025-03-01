import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';

const socket = io(`${import.meta.env.VITE_BASE_URL}`, {
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
  const [sessions, setSessions] = useState([]);
const [isLoadingSessions, setIsLoadingSessions] = useState(false);

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

  useEffect(() => {
    // Load sessions when the component mounts
    fetchSessions();
    
    // Set up socket listener for when new sessions are created/updated by counselors
    socket.on('sessionsUpdated', () => {
      fetchSessions();
    });
    
    return () => {
      socket.off('sessionsUpdated');
    };
  }, []);

  // Component for the request form
  const RequestForm = ({ issueDetails, setIssueDetails, requestSession, loading }) => {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          What would you like to discuss today?
        </h2>
  
        <textarea
          value={issueDetails}  // ✅ Controlled Component Fix
          onChange={(e) => setIssueDetails(e.target.value)} // ✅ Ensuring State Updates
          placeholder="Describe your concerns or what you'd like help with..."
          rows="5"
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
  
        <button
          onClick={requestSession}
          className={`w-full p-3 mt-4 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-lg shadow-md hover:from-emerald-600 hover:to-emerald-800 transition-all ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Requesting Session...
            </div>
          ) : (
            "Request Counseling Session"
          )}
        </button>
      </div>
    );
  };
 
  // Component for the feedback form
  const FeedbackForm = ({ rating, setRating, feedback, setFeedback, feedbackStatus, handleFeedbackSubmit, handleSkipFeedback }) => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <p className="text-lg font-medium">How was your experience?</p>
          <div className="flex space-x-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-3xl transition-all transform hover:scale-110 ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Your feedback helps us improve
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Please share your thoughts about the session..."
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        {feedbackStatus && (
          <p className={`text-center font-medium ${feedbackStatus.includes('Thank you') ? 'text-green-600' : 'text-red-500'}`}>
            {feedbackStatus}
          </p>
        )}
        
        <div className="flex space-x-4">
          <button
            onClick={handleFeedbackSubmit}
            className="flex-1 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-colors"
          >
            Submit Feedback
          </button>
          <button
            onClick={handleSkipFeedback}
            className="flex-1 p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 shadow-md transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    );
  };
  
  // Component for active session
  const ActiveSession = ({ session, notes, setNotes, handleAddNotes, noteStatus, endSession, ending }) => {
    return (
      <div className="space-y-6">
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <div className="flex items-center mb-3">
            <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
            <p className="font-medium">Status: {session.status}</p>
          </div>
          <p className="mb-1"><span className="font-medium">Counselor:</span> {session.counselor?.fullName || 'Waiting for counselor...'}</p>
          {session.counselor?.specialization && (
            <p><span className="font-medium">Specialization:</span> {session.counselor?.specialization}</p>
          )}
        </div>
  
        {session.status === 'Active' && (
          <div className="w-full h-[450px] relative rounded-lg overflow-hidden shadow-lg border border-gray-300">
            <iframe
              src={`https://meet.jit.si/${session.roomName}`}
              width="100%"
              height="100%"
              allow="camera; microphone; fullscreen; display-capture"
              className="rounded-none shadow-none"
            />
          </div>
        )}
  
        <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-medium text-gray-800">Session Notes</h4>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record your thoughts or insights from this session..."
            rows="3"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="flex justify-between items-center">
            <button
              onClick={handleAddNotes}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Save Notes
            </button>
            {noteStatus && (
              <span className="text-sm text-green-600 font-medium">{noteStatus}</span>
            )}
          </div>
        </div>
  
        <button
          onClick={endSession}
          className={`w-full p-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors ${
            ending ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={ending}
        >
          {ending ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Ending Session...
            </div>
          ) : (
            "End Session"
          )}
        </button>
      </div>
    );
  };
  
  // Component for session history
  // Updated SessionHistory component with loading state
const SessionHistory = ({ sessions, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
        <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600">Loading your session history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {sessions && sessions.length > 0 ? (
        sessions.map((session, index) => (
          <motion.div 
            key={session._id || index}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-indigo-800">{session.counselor?.fullName || session.counselorName}</h3>
              <span className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                {new Date(session.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Specialization:</span> {session.counselor?.specialization || session.counselorSpecialization || 'General'}
            </p>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-700 line-clamp-2">
                <span className="font-medium">Issue Details:</span> {session.issueDetails}
              </p>
            </div>
            {session.notes && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-700 line-clamp-2">
                  <span className="font-medium">Notes:</span> {session.notes}
                </p>
              </div>
            )}
            {session.feedback && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center">
                  <span className="font-medium text-sm text-gray-700 mr-2">Your Rating:</span>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-sm">
                        {i < session.rating ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="mt-2 text-gray-500">No previous sessions found</p>
          <p className="text-sm text-gray-400">Your session history will appear here</p>
        </div>
      )}
    </div>
  );
};
  
  // Handler functions for managing sessions
  const fetchSessions = () => {
    setIsLoadingSessions(true);
    
    axios.get(`${import.meta.env.VITE_BASE_API_URL}/users/counseling-sessions`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
      },
    })
      .then(response => {
        setSessions(response.data);
      })    
      .catch(error => {
        console.error('Error fetching sessions:', error);
        // We don't set the main error state here to avoid disrupting the primary flow
        // Instead, we could show an inline error in the sessions component
      })
      .finally(() => {
        setIsLoadingSessions(false);
      });
  };
  
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
      setFeedbackStatus("Please provide some feedback.");
      return;
    }
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/sessions/${endedSession._id}/feedback`,
        {
          feedback,
          rating
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );
  
      if (response.status === 200) {
        setFeedbackStatus("Thank you for your feedback!");
  
        // Optional: clear the feedback form and navigate after a delay
        setTimeout(() => {
          setShowFeedback(false);
          setFeedback('');
          setRating(0);
        }, 2000);
  
        handleFeedbackComplete();
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
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
        // Refresh sessions to get the updated session with feedback
        fetchSessions();
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
      {/* Header with Back Button */}
      <div className="w-full p-4 flex justify-between items-center">
        <button 
          onClick={() => navigate('/MainPage')}
          className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors shadow-lg flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        <h1 className="text-4xl font-extrabold text-white md:block text-center mx-auto animate-fade-in drop-shadow-lg">
  MindFull Guidance
</h1>

      </div>
  
      <div className="flex-grow flex flex-col md:flex-row items-start justify-center gap-6 p-4 md:p-8">
        {/* Main Content Area */}
        <motion.div
          className={`bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full md:w-1/2 lg:w-2/5`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-indigo-800 border-b border-indigo-100 pb-4">
            {showFeedback ? 'Session Feedback' : session ? 'Current Session' : 'Request Counseling'}
          </h2>
  
          {error && (
            <motion.div 
              className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-red-700"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {error}
            </motion.div>
          )}
  
          {!session && !showFeedback ? (
            <RequestForm 
              issueDetails={issueDetails}
              setIssueDetails={setIssueDetails}
              requestSession={requestSession}
              loading={loading}
            />
          ) : showFeedback ? (
            <FeedbackForm 
              rating={rating}
              setRating={setRating}
              feedback={feedback}
              setFeedback={setFeedback}
              feedbackStatus={feedbackStatus}
              handleFeedbackSubmit={handleFeedbackSubmit}
              handleSkipFeedback={handleSkipFeedback}
            />
          ) : (
            <ActiveSession 
              session={session}
              notes={notes}
              setNotes={setNotes}
              handleAddNotes={handleAddNotes}
              noteStatus={noteStatus}
              endSession={endSession}
              ending={ending}
            />
          )}
        </motion.div>
  
        {/* Session History Section */}
        <motion.div
  className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full md:w-1/2 lg:w-2/5"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1], delay: 0.2 }}
>
  <h2 className="text-3xl font-bold text-center mb-6 text-indigo-800 border-b border-indigo-100 pb-4">
    Your Session History
  </h2>
  
  <SessionHistory sessions={sessions} isLoading={isLoadingSessions} />
</motion.div>
      </div>
    </div>
  );
};

export default VideoChat;