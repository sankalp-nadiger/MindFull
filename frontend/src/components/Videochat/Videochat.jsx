import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Video, 
  Heart, 
  Shield, 
  Clock, 
  User, 
  MessageCircle, 
  Star,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Phone,
  Camera,
  Mic,
  MicOff,
  VideoOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Link } from "react-router-dom";

const getSocket = () => {
  if (!window.socketInstance) {
    window.socketInstance = io(`${import.meta.env.VITE_BASE_URL}`, {
      transports: ['websocket'],
      withCredentials: true,
    });
  }
  return window.socketInstance;
};

 // Trust indicators component
  const TrustIndicators = () => (
    <div className="flex items-center justify-center space-x-6 mb-8 text-sm text-slate-400">
      <div className="flex items-center space-x-2">
        <Shield className="w-4 h-4 text-emerald-400" />
        <span>HIPAA Compliant</span>
      </div>
      <div className="flex items-center space-x-2">
        <Heart className="w-4 h-4 text-rose-400" />
        <span>Licensed Therapists</span>
      </div>
      <div className="flex items-center space-x-2">
        <CheckCircle className="w-4 h-4 text-blue-400" />
        <span>End-to-End Encrypted</span>
      </div>
    </div>
  );

  // Request form component
  const RequestForm = ({ issueDetails, loading, requestSession, handleIssueDetailsChange }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
          <Video className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-2">
          Start Your Healing Journey
        </h3>
        <p className="text-slate-400">
          Connect with a licensed mental health professional in a safe, private space
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            What brings you here today? *
          </label>
          <textarea
            value={issueDetails}
            onChange={handleIssueDetailsChange}
            placeholder="Share what's on your mind. This helps us match you with the right counselor..."
            rows="4"
            maxLength={500}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none text-slate-200 placeholder-slate-500"
            autoComplete="off"
            spellCheck="true"
          />
          <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
            <span>Your information is completely confidential</span>
            <span>{issueDetails.length}/500</span>
          </div>
        </div>

        <button
          onClick={requestSession}
          disabled={loading || !issueDetails.trim()}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform ${
            loading || !issueDetails.trim()
              ? 'bg-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-[1.02] shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Finding Your Counselor...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Video className="w-5 h-5" />
              <span>Request Session</span>
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );

  

  // Active session component
const ActiveSession = ({ 
  session, 
  endSession, 
  ending, 
  notes, 
  handleNotesChange, 
  handleAddNotes, 
  noteStatus 
}) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* Session Status */}
      <div className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border border-emerald-500/30 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${session?.status === 'Active' ? 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50' : 'bg-amber-400'}`}></div>
            <span className="font-semibold text-white">
              {session?.status === 'Active' ? 'Session Active' : 'Connecting...'}
            </span>
          </div>
          {session?.status === 'Active' && (
            <div className="flex items-center space-x-1 text-emerald-400 text-sm font-medium">
              <Clock className="w-4 h-4" />
              <span>Active</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-slate-300">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>{session?.counselor?.fullName || 'Waiting for counselor...'}</span>
          </div>
          {session?.counselor?.specialization && (
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>{session.counselor.specialization}</span>
            </div>
          )}
        </div>
      </div>

      {/* Video Interface */}
      {session?.status === 'Active' ? (
        <div className="relative bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
          <div className="aspect-video w-full">
            <iframe
              src={`https://meet.jit.si/${session.roomName}`}
              width="100%"
              height="100%"
              allow="camera; microphone; fullscreen; display-capture"
              className="rounded-xl"
            />
          </div>
          
          {/* Video Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 bg-black/70 backdrop-blur-md rounded-full px-4 py-2 border border-slate-700">
            <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors border border-slate-600">
              <Mic className="w-4 h-4 text-white" />
            </button>
            <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors border border-slate-600">
              <Camera className="w-4 h-4 text-white" />
            </button>
            <button 
              onClick={endSession}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors shadow-lg shadow-red-500/20"
              disabled={ending}
            >
              {ending ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Phone className="w-4 h-4 text-white rotate-[135deg]" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-8 text-center border border-slate-600">
          <div className="animate-pulse mb-4">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full mx-auto flex items-center justify-center border border-emerald-500/30">
              <Video className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Connecting you with your counselor</h3>
          <p className="text-slate-400 text-sm">This usually takes less than 2 minutes</p>
        </div>
      )}

      {/* Session Notes */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="w-5 h-5 text-slate-400" />
          <h4 className="text-lg font-semibold text-white">Session Notes</h4>
        </div>
        
        <textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder="Jot down key insights, thoughts, or things you want to remember..."
          rows="3"
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none text-slate-200 placeholder-slate-500"
        />
        
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handleAddNotes}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-md shadow-emerald-600/20"
          >
            Save Notes
          </button>
          {noteStatus && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-sm font-medium ${
                noteStatus.includes('successfully') ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {noteStatus}
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Feedback form component
  const FeedbackForm = ({ 
  feedback, 
  rating, 
  setRating, 
  handleFeedbackChange, 
  handleFeedbackSubmit, 
  handleSkipFeedback, 
  feedbackStatus 
})  => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/20">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-2">How was your session?</h3>
        <p className="text-slate-400">Your feedback helps us improve our care</p>
      </div>

      {/* Rating */}
      <div className="text-center space-y-4">
        <p className="text-lg font-medium text-white">Rate your experience</p>
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-3xl transition-all transform hover:scale-110 ${
                star <= rating ? 'text-amber-400' : 'text-slate-600'
              }`}
            >
              <Star className={`w-8 h-8 ${star <= rating ? 'fill-current' : ''}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Feedback text */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Share your thoughts (optional)
        </label>
        <textarea
          value={feedback}
          onChange={handleFeedbackChange}
          placeholder="What went well? How could we improve?"
          rows="4"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none text-slate-200 placeholder-slate-500"
        />
      </div>

      {feedbackStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl text-center font-medium ${
            feedbackStatus.includes('Thank you') 
              ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30' 
              : 'bg-red-900/50 text-red-400 border border-red-500/30'
          }`}
        >
          {feedbackStatus}
        </motion.div>
      )}

      <div className="flex space-x-4">
        <button
          onClick={handleFeedbackSubmit}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-semibold shadow-lg shadow-emerald-500/20"
        >
          Submit Feedback
        </button>
        <button
          onClick={handleSkipFeedback}
          className="flex-1 py-3 px-6 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-colors font-semibold border border-slate-600"
        >
          Skip
        </button>
      </div>
    </motion.div>
  );

  // Session history component
  const SessionHistory = ({ sessions, isLoadingSessions }) => (
    <div className="space-y-4">
      {isLoadingSessions ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
          <p className="text-slate-400">Loading your sessions...</p>
        </div>
      ) : sessions.length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {sessions.map((session, index) => (
            <motion.div
              key={session._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:bg-slate-750 hover:border-slate-600 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-white">{session.counselor?.fullName || session.counselorName}</h4>
                  <p className="text-sm text-slate-400">{session.counselor?.specialization || session.counselorSpecialization || 'General'}</p>
                </div>
                <div className="text-right">
                  {session.rating && (
                    <div className="flex items-center space-x-1 text-amber-400 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < session.rating ? 'fill-current' : 'text-slate-600'}`} />
                      ))}
                    </div>
                  )}
                  <span className="text-xs text-slate-500">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-slate-300 mb-2 line-clamp-2">
                <span className="font-medium">Discussed:</span> {session.issueDetails}
              </p>
              
              {session.notes && (
                <p className="text-sm text-slate-400 bg-slate-700 rounded-lg p-2 line-clamp-2">
                  <span className="font-medium">Notes:</span> {session.notes}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800 rounded-xl border-2 border-dashed border-slate-700">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">No previous sessions</p>
          <p className="text-sm text-slate-500">Your session history will appear here</p>
        </div>
      )}
    </div>
  );

const VideoChat = () => {
  const navigate = useNavigate();
  const socket = useMemo(() => getSocket(), []);
  
  // State management
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

  // Memoized API functions to prevent re-creation
  const requestSession = useCallback(async () => {
    console.log('RequestSession called with:', issueDetails); // Debug log
    
    if (!issueDetails.trim()) {
      setError('Please provide issue details.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }
      
      console.log('Making API request...'); // Debug log
      
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/counsellor/request`,
        { issueDetails },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      console.log('API Response:', response.data); // Debug log
      
      const newSession = response.data.session;
      setSession(newSession);
      
      // Emit socket event for new session request
      socket.emit('sessionRequested', {
        sessionId: newSession._id,
        issueDetails: issueDetails,
        userId: newSession.userId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Request session error:', error); // Debug log
      setError(error.response?.data?.message || 'Failed to request session. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [issueDetails, socket]);

  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/users/counseling-sessions`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      });
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  const handleAddNotes = useCallback(async () => {
    if (!notes.trim()) {
      setNoteStatus('Please enter some notes');
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/users/addNotes`,
        { sessionId: session._id, notes }
      );
      setNoteStatus('Notes saved successfully!');
      setTimeout(() => setNoteStatus(''), 3000);
    } catch (error) {
      setNoteStatus('Failed to save notes. Please try again.');
      setTimeout(() => setNoteStatus(''), 3000);
    }
  }, [notes, session]);

  const endSession = useCallback(async () => {
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
    } catch (error) {
      setError('Failed to end session. Please try again.');
    } finally {
      setEnding(false);
    }
  }, [session, socket]);

  const handleFeedbackSubmit = useCallback(async () => {
    if (!endedSession || !endedSession._id) {
      setFeedbackStatus("Session information missing.");
      return;
    }

    if (!feedback.trim()) {
      setFeedbackStatus("Please provide feedback");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/sessions/${endedSession._id}/feedback`,
        { feedback, rating },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 200) {
        setFeedbackStatus("Thank you for your feedback!");
        setTimeout(() => {
          handleFeedbackComplete();
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setFeedbackStatus("Failed to submit feedback. Please try again.");
    }
  }, [endedSession, feedback, rating]);

  // Memoized input change handlers
  const handleIssueDetailsChange = useCallback((e) => {
    const newValue = e.target.value;
    if (newValue.length <= 500) {
      setIssueDetails(newValue);
    }
  }, []);

  const handleNotesChange = useCallback((e) => {
    setNotes(e.target.value);
  }, []);

  const handleFeedbackChange = useCallback((e) => {
    setFeedback(e.target.value);
  }, []);

  const handleSkipFeedback = useCallback(() => {
    handleFeedbackComplete();
  }, []);

  const handleFeedbackComplete = useCallback(() => {
    setShowFeedback(false);
    setFeedback('');
    setRating(5);
    setEndedSession(null);
    setFeedbackStatus('');
    fetchSessions(); // Refresh sessions
  }, [fetchSessions]);

  // Effects
  useEffect(() => {
    fetchSessions();
    
    const handleSessionsUpdated = () => {
      fetchSessions();
    };
    
    socket.on('sessionsUpdated', handleSessionsUpdated);
    
    return () => {
      socket.off('sessionsUpdated', handleSessionsUpdated);
    };
  }, [fetchSessions, socket]);

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

  useEffect(() => {
    if (!session) return;

    const handleSessionEnd = (data) => {
      setEndedSession(session);
      setSession(null);
      setShowFeedback(true);
    };

    socket.on(`sessionEnded-${session._id}`, handleSessionEnd);

    return () => {
      socket.off(`sessionEnded-${session._id}`, handleSessionEnd);
    };
  }, [session, socket]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
                          to="/MainPage"
                          className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                          <ArrowLeft className="w-5 h-5" />
                          <span className="hidden sm:block text-sm font-medium sm:text-base">Back to Dashboard</span>
                        </Link>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                MindfulCare
              </h1>
              <p className="text-sm text-slate-400">Professional Video Counseling</p>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-slate-400">Secure Session</span>
            </div>
          </div>
        </div>
      </header>

      {/* Trust Indicators */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <TrustIndicators />
      </div>

      {/* Main Content */}
  <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Session Area */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 p-6 lg:p-8">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-6 bg-red-900/50 border border-red-500/50 rounded-xl p-4 flex items-start space-x-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-300 font-medium">Something went wrong</p>
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  </motion.div>
                )}

               {showFeedback ? (
                  <FeedbackForm
                    feedback={feedback}
                    rating={rating}
                    setRating={setRating}
                    handleFeedbackChange={handleFeedbackChange}
                    handleFeedbackSubmit={handleFeedbackSubmit}
                    handleSkipFeedback={handleSkipFeedback}
                    feedbackStatus={feedbackStatus}
                  />
                ) : session ? (
                  <ActiveSession
                    session={session}
                    endSession={endSession}
                    ending={ending}
                    notes={notes}
                    handleNotesChange={handleNotesChange}
                    handleAddNotes={handleAddNotes}
                    noteStatus={noteStatus}
                  />
                ) :  (
                  <RequestForm
                    issueDetails={issueDetails}
                    loading={loading}
                    requestSession={requestSession}
                    handleIssueDetailsChange={handleIssueDetailsChange}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar - Session History */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Clock className="w-5 h-5 text-slate-400" />
                <h2 className="text-xl font-semibold text-white">Recent Sessions</h2>
              </div>
              <SessionHistory 
                sessions={sessions} 
                isLoadingSessions={isLoadingSessions} 
              />
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 rounded-2xl border border-emerald-500/30 p-6 backdrop-blur-md">
              <h3 className="font-semibold text-white mb-4">Need Immediate Help?</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 hover:border-emerald-500/50 transition-all text-left">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="font-medium text-white">Crisis Hotline</p>
                    <p className="text-sm text-slate-400">24/7 Support</p>
                  </div>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 hover:border-emerald-500/50 transition-all text-left">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="font-medium text-white">Chat Support</p>
                    <p className="text-sm text-slate-400">Get help now</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoChat;
