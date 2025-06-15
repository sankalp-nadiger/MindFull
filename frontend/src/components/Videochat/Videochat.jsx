import React, { useState, useEffect } from 'react';
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

const VideoChat = () => {
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
  const [sessions, setSessions] = useState([
    {
      _id: '1',
      counselor: { fullName: 'Dr. Sarah Johnson', specialization: 'Anxiety & Depression' },
      createdAt: '2024-06-10',
      issueDetails: 'Dealing with work-related stress and anxiety',
      notes: 'Learned breathing techniques and coping strategies',
      rating: 5,
      feedback: 'Very helpful session'
    },
    {
      _id: '2',
      counselor: { fullName: 'Dr. Michael Chen', specialization: 'Relationship Counseling' },
      createdAt: '2024-06-05',
      issueDetails: 'Communication issues with partner',
      notes: 'Discussed active listening techniques',
      rating: 4
    }
  ]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Mock functions for demo
  const requestSession = () => {
    if (!issueDetails.trim()) {
      setError('Please provide issue details.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setSession({
        _id: 'demo-session',
        status: 'Pending',
        counselor: { fullName: 'Dr. Emily Watson', specialization: 'Anxiety & Stress Management' },
        roomName: 'demo-room'
      });
      setLoading(false);
      setError('');
      setTimeout(() => {
        setSession(prev => ({ ...prev, status: 'Active' }));
      }, 3000);
    }, 2000);
  };

  const endSession = () => {
    setEnding(true);
    setTimeout(() => {
      setEndedSession(session);
      setSession(null);
      setShowFeedback(true);
      setEnding(false);
    }, 1500);
  };

  const handleAddNotes = () => {
    if (!notes.trim()) {
      setNoteStatus('Please enter some notes');
      return;
    }
    setNoteStatus('Notes saved successfully!');
    setTimeout(() => setNoteStatus(''), 3000);
  };

  const handleFeedbackSubmit = () => {
    if (!feedback.trim()) {
      setFeedbackStatus('Please provide feedback');
      return;
    }
    setFeedbackStatus('Thank you for your feedback!');
    setTimeout(() => {
      setShowFeedback(false);
      setFeedback('');
      setRating(5);
      setEndedSession(null);
      setFeedbackStatus('');
    }, 2000);
  };

  const handleSkipFeedback = () => {
    setShowFeedback(false);
    setFeedback('');
    setRating(5);
    setEndedSession(null);
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
  const RequestForm = () => (
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
            onChange={(e) => setIssueDetails(e.target.value)}
            placeholder="Share what's on your mind. This helps us match you with the right counselor..."
            rows="4"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none text-slate-200 placeholder-slate-500"
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
  const ActiveSession = () => (
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
              <span>12:34</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-slate-300">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>{session?.counselor?.fullName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <span>{session?.counselor?.specialization}</span>
          </div>
        </div>
      </div>

      {/* Video Interface */}
      {session?.status === 'Active' ? (
        <div className="relative bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
          <div className="aspect-video w-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center border border-slate-700">
            <div className="text-center text-white">
              <Video className="w-12 h-12 mx-auto mb-3 opacity-60" />
              <p className="text-lg font-medium mb-1">Video Session Active</p>
              <p className="text-sm opacity-80">Secure connection established</p>
            </div>
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
          onChange={(e) => setNotes(e.target.value)}
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
              className="text-sm text-emerald-400 font-medium"
            >
              {noteStatus}
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Feedback form component
  const FeedbackForm = () => (
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
          onChange={(e) => setFeedback(e.target.value)}
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
  const SessionHistory = () => (
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
                  <h4 className="font-semibold text-white">{session.counselor?.fullName}</h4>
                  <p className="text-sm text-slate-400">{session.counselor?.specialization}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-amber-400 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < (session.rating || 0) ? 'fill-current' : 'text-slate-600'}`} />
                    ))}
                  </div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            
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
                  <FeedbackForm key="feedback" />
                ) : session ? (
                  <ActiveSession key="active" />
                ) : (
                  <RequestForm key="request" />
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
              <SessionHistory />
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