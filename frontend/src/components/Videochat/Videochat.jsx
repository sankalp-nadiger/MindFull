import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  VideoOff,
  Bell
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Link } from "react-router-dom";
import Toast from "../pages/Toast";
import { useTranslation } from 'react-i18next';

// WebRTC Configuration
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ],
  iceTransportPolicy: 'all',
  iceCandidatePoolSize: 10
};

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
const TrustIndicators = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center space-x-6 mb-8 text-sm text-slate-400">
      <div className="flex items-center space-x-2">
        <Shield className="w-4 h-4 text-emerald-400" />
        <span>{t('videoChat.hipaaCompliant')}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Heart className="w-4 h-4 text-rose-400" />
        <span>{t('videoChat.licensedTherapists')}</span>
      </div>
      <div className="flex items-center space-x-2">
        <CheckCircle className="w-4 h-4 text-blue-400" />
        <span>{t('videoChat.endToEndEncrypted')}</span>
      </div>
    </div>
  );
};

// Request form component
const RequestForm = ({ issueDetails, loading, requestSession, handleIssueDetailsChange, activeSession, rejoinSession, rejoinLoading, dismissActiveSession }) => {
  const { t } = useTranslation();
  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    {/* Active Session Alert */}
    {activeSession && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            <div>
              <h4 className="font-semibold text-white">{t('videoChat.activeSessionFound')}</h4>
              <p className="text-sm text-slate-300">
                {t('videoChat.ongoingSessionWith', { counselor: activeSession.counselor?.fullName || t('videoChat.aCounselor') })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => rejoinSession(activeSession._id)}
              disabled={rejoinLoading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg disabled:opacity-50"
            >
              {rejoinLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('videoChat.joining')}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Video className="w-4 h-4" />
                  <span>{t('videoChat.rejoin')}</span>
                </div>
              )}
            </button>
            <button
              onClick={() => dismissActiveSession(activeSession._id)}
              disabled={rejoinLoading}
              className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all font-semibold border border-slate-600 disabled:opacity-50"
              title={t('videoChat.dismissTooltip')}
            >
              <div className="flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{t('videoChat.dismiss')}</span>
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    )}

    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
        <Video className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-2xl font-semibold text-white mb-2">
        {activeSession ? t('videoChat.startNewSession') : t('videoChat.startHealingJourney')}
      </h3>
      <p className="text-slate-400">
        {t('videoChat.connectDescription')}
      </p>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {t('videoChat.whatBringsYou')}
        </label>
        <textarea
          value={issueDetails}
          onChange={handleIssueDetailsChange}
          placeholder={t('videoChat.sharePlaceholder')}
          rows="4"
          maxLength={500}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none text-slate-200 placeholder-slate-500"
          autoComplete="off"
          spellCheck="true"
        />
        <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
          <span>{t('videoChat.confidential')}</span>
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
            <span>{t('videoChat.findingCounselor')}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Video className="w-5 h-5" />
            <span>{t('videoChat.requestNewSession')}</span>
          </div>
        )}
      </button>
    </div>
  </motion.div>
  );
};

// Appointments Display Component
const AppointmentsDisplay = ({ appointments, loading, onJoinSession }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isWithinJoinTimeWindow = (appointment) => {
    if (!appointment.appointmentDate || !appointment.startTime || !appointment.endTime) {
      return false;
    }

    const now = new Date();
    const appointmentDate = new Date(appointment.appointmentDate);
    
    // Parse start time
    const [startHour, startMinute] = appointment.startTime.split(':').map(Number);
    const startDateTime = new Date(appointmentDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    
    // Parse end time
    const [endHour, endMinute] = appointment.endTime.split(':').map(Number);
    const endDateTime = new Date(appointmentDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);
    
    // Calculate time window: 4 minutes before start to 4 minutes after end
    const windowStart = new Date(startDateTime.getTime() - 4 * 60 * 1000);
    const windowEnd = new Date(endDateTime.getTime() + 4 * 60 * 1000);
    
    return now >= windowStart && now <= windowEnd;
  };

  const handleJoinSession = async (appointment) => {
    if (!appointment.sessionId) {
      console.error('No session ID found in appointment');
      alert('No session ID found in this appointment');
      return;
    }
    
    try {
      const sessionId = appointment.sessionId._id || appointment.sessionId;
      console.log('🎥 User joining session from appointment:', sessionId);
      
      // Mark appointment as joined
      await axios.patch(
        `${import.meta.env.VITE_BASE_API_URL}/users/appointments/${appointment._id}/joined`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );
      
      // Navigate to video page with sessionId - let VideoChat's joinSessionFromAppointment handle it
      navigate(`/video?sessionId=${sessionId}`);
    } catch (error) {
      console.error('❌ Error joining session:', error);
      // Still try to navigate
      const sessionId = appointment.sessionId?._id || appointment.sessionId;
      if (sessionId) {
        navigate(`/video?sessionId=${sessionId}`);
      }
    }
  };

  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 p-6 mb-6"
  >
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">{t('videoChat.scheduledAppointments')}</h3>
          <p className="text-sm text-slate-400">{t('videoChat.upcomingSessions')}</p>
        </div>
      </div>
    </div>

    {loading ? (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    ) : (() => {
      // Filter appointments to only show scheduled ones after current time
      const now = new Date();
      const upcoming = (appointments || []).filter((appointment) => {
        if (!appointment) return false;
        if (appointment.status !== 'scheduled') return false;

        const appointmentDate = new Date(appointment.appointmentDate);
        if (isNaN(appointmentDate)) return false;

        // Parse end time "HH:MM" for today's appointments
        const today = new Date();
        const isToday = appointmentDate.toDateString() === today.toDateString();
        
        if (isToday) {
          // For today's appointments, check if end time hasn't passed
          if (!appointment.endTime || !/^[0-2]?\d:\d{2}$/.test(appointment.endTime)) return false;
          const [endH, endM] = appointment.endTime.split(':').map((x) => parseInt(x, 10));
          const appointmentEndTime = new Date(appointmentDate);
          appointmentEndTime.setHours(endH, endM, 0, 0);
          
          return appointmentEndTime.getTime() > now.getTime();
        } else {
          // For future dates, check if start time is after now
          if (!appointment.startTime || !/^[0-2]?\d:\d{2}$/.test(appointment.startTime)) return false;
          const [h, m] = appointment.startTime.split(':').map((x) => parseInt(x, 10));
          appointmentDate.setHours(h, m, 0, 0);
          
          return appointmentDate.getTime() > now.getTime();
        }
      });

      return upcoming.length > 0 ? (
        <div className="space-y-4">
          {upcoming.map((appointment, index) => {
          const appointmentDate = new Date(appointment.appointmentDate);
          const today = new Date();
          const isToday = appointmentDate.toDateString() === today.toDateString();
          const isPast = appointmentDate < today && !isToday;
          
          return (
            <motion.div
              key={appointment._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-xl border ${
                isPast 
                  ? 'bg-slate-800/50 border-slate-600/50' 
                  : isToday 
                    ? 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-blue-500/50' 
                    : 'bg-slate-800 border-slate-700'
              } p-4 hover:border-blue-500/50 transition-all`}
            >
              {isToday && (
                <div className="absolute top-2 right-2">
                  <div className="flex items-center space-x-1 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    <span>{t('videoChat.today')}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg">
                        {appointment.counsellorId?.fullName || 'Counselor'}
                      </h4>
                      <p className="text-sm text-slate-400">
                        {appointment.counsellorId?.specialization || 'Mental Health Professional'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center space-x-2 text-slate-300">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-xs text-slate-500">Date</p>
                        <p className="font-medium">
                          {appointmentDate.toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-slate-300">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="text-xs text-slate-500">Time</p>
                        <p className="font-medium">
                          {appointment.startTime} - {appointment.endTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-slate-300">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-xs text-slate-500">Session Type</p>
                        <p className="font-medium capitalize">
                          {appointment.sessionType || 'Follow-up'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-slate-300">
                      <CheckCircle className={`w-4 h-4 ${
                        appointment.status === 'scheduled' ? 'text-green-400' :
                        appointment.status === 'completed' ? 'text-blue-400' :
                        appointment.status === 'cancelled' ? 'text-red-400' :
                        'text-amber-400'
                      }`} />
                      <div>
                        <p className="text-xs text-slate-500">Status</p>
                        <p className="font-medium capitalize">
                          {appointment.status}
                        </p>
                      </div>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mt-4 bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                      <p className="text-xs text-slate-400 mb-1">Notes</p>
                      <p className="text-sm text-slate-200">{appointment.notes}</p>
                    </div>
                  )}

                  {appointment.sessionId && (
                    <div className="mt-4">
                      {isWithinJoinTimeWindow(appointment) ? (
                        <button
                          onClick={() => handleJoinSession(appointment)}
                          className={`w-full px-4 py-3 text-white rounded-lg transition-all font-semibold shadow-lg flex items-center justify-center space-x-2 ${
                            appointment.sessionId?.status === 'Active' && appointment.sessionId?.userJoined
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/20'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/20 animate-pulse'
                          }`}
                        >
                          <Video className="w-5 h-5" />
                          <span>
                            {appointment.userJoined
                              ? (t('videoChat.rejoinSession') || 'Rejoin Session')
                              : (t('videoChat.joinSession') || 'Join Session Now')}
                          </span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full px-4 py-3 bg-slate-700 text-slate-400 rounded-lg cursor-not-allowed font-semibold flex items-center justify-center space-x-2 opacity-50"
                          title="Available 4 minutes before session starts"
                        >
                          <Video className="w-5 h-5" />
                          <span>{t('videoChat.joinAvailableSoon') || 'Join Available Soon'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800 rounded-xl border-2 border-dashed border-slate-700">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">{t('videoChat.noAppointments')}</p>
          <p className="text-sm text-slate-500">{t('videoChat.onlyFutureShown')}</p>
        </div>
      );
    })()}
  </motion.div>
  );
};

// Active session component
const ActiveSession = ({ 
  session, 
  endSession, 
  ending, 
  notes, 
  handleNotesChange, 
  handleAddNotes, 
  noteStatus,
  userId,
  userType = 'user'
}) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [remoteUserConnected, setRemoteUserConnected] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const socket = getSocket();

  useEffect(() => {
    console.log('🎥 Initializing WebRTC session:', session?.roomName);
    if (session?.status === 'Active') {
      initializeWebRTC();
    }
    return () => cleanupWebRTC();
  }, [session?.status, session?.roomName]);

  const initializeWebRTC = async () => {
    try {
      console.log('📡 Starting WebRTC initialization');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices not supported in this browser');
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }, 
          audio: true 
        });
      } catch (err) {
        console.warn('Failed to get HD video, trying lower quality:', err);
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
      }
      
      console.log('🎥 Got media stream:', stream.getTracks().map(t => `${t.kind}: ${t.label}`));
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      peerConnectionRef.current = new RTCPeerConnection(rtcConfig);
      
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      peerConnectionRef.current.ontrack = (event) => {
        console.log('📺 Received remote track');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setRemoteUserConnected(true);
        }
      };

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 Sending ICE candidate');
          socket.emit('ice-candidate', {
            room: session.roomName,
            candidate: event.candidate,
            from: userId
          });
        }
      };

      peerConnectionRef.current.onconnectionstatechange = () => {
        const state = peerConnectionRef.current.connectionState;
        setConnectionStatus(state);
        console.log('🔌 Connection state:', state);

        if (state === 'failed' || state === 'disconnected') {
          console.log('🔄 Connection lost, attempting to reconnect...');
          setTimeout(() => {
            if (session?.status === 'Active') {
              console.log('♻️ Reinitializing WebRTC connection');
              cleanupWebRTC();
              initializeWebRTC();
            }
          }, 2000);
        }
      };

      console.log('🏠 Joining WebRTC room:', session.roomName);
      socket.emit('join-room', {
        room: session.roomName,
        userId: userId,
        userType: userType
      });

      socket.on('user-joined', handleUserJoined);
      socket.on('offer', handleOffer);
      socket.on('answer', handleAnswer);
      socket.on('ice-candidate', handleIceCandidate);
      socket.on('user-left', handleUserLeft);

      setConnectionStatus('connecting');
    } catch (error) {
      console.error('❌ Error initializing WebRTC:', error);
      setConnectionStatus('failed');
    }
  };

  const handleUserJoined = async (data) => {
    console.log('👥 User joined:', data);
    if (data.userId !== userId && peerConnectionRef.current) {
      try {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        
        socket.emit('offer', {
          room: session.roomName,
          offer: offer,
          from: userId,
          to: data.userId
        });
      } catch (error) {
        console.error('❌ Error creating offer:', error);
      }
    }
  };

  const handleOffer = async (data) => {
    if (data.to === userId && peerConnectionRef.current) {
      try {
        console.log('📨 Received offer from:', data.from);
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        
        socket.emit('answer', {
          room: session.roomName,
          answer: answer,
          from: userId,
          to: data.from
        });
      } catch (error) {
        console.error('❌ Error handling offer:', error);
      }
    }
  };

  const handleAnswer = async (data) => {
    if (data.to === userId && peerConnectionRef.current) {
      try {
        console.log('📨 Received answer from:', data.from);
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      } catch (error) {
        console.error('❌ Error handling answer:', error);
      }
    }
  };

  const handleIceCandidate = async (data) => {
    if (data.from !== userId && peerConnectionRef.current) {
      try {
        console.log('🧊 Adding ICE candidate');
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        console.error('❌ Error handling ICE candidate:', error);
      }
    }
  };

  const handleUserLeft = (data) => {
    console.log('👋 User left:', data);
    setRemoteUserConnected(false);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioOn(!isAudioOn);
    }
  };

  const cleanupWebRTC = () => {
    console.log('🧹 Cleaning up WebRTC');
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    socket.off('user-joined');
    socket.off('offer');
    socket.off('answer');
    socket.off('ice-candidate');
    socket.off('user-left');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
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
              <span>{connectionStatus === 'connected' ? 'Connected' : 'Connecting...'}</span>
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

      {session?.status === 'Active' && (
        <div className="relative bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
          <div className="aspect-video w-full relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-4 right-4 w-1/4 aspect-video object-cover rounded-lg border-2 border-slate-600"
            />
          </div>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 bg-black/70 backdrop-blur-md rounded-full px-4 py-2 border border-slate-700">
            <button 
              onClick={toggleAudio}
              className={`p-2 ${isAudioOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'} rounded-full transition-colors border border-slate-600`}
            >
              {isAudioOn ? (
                <Mic className="w-4 h-4 text-white" />
              ) : (
                <MicOff className="w-4 h-4 text-white" />
              )}
            </button>
            <button 
              onClick={toggleVideo}
              className={`p-2 ${isVideoOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'} rounded-full transition-colors border border-slate-600`}
            >
              {isVideoOn ? (
                <Camera className="w-4 h-4 text-white" />
              ) : (
                <VideoOff className="w-4 h-4 text-white" />
              )}
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
      )}

      {!session?.status === 'Active' && (
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
};

// Feedback form component
const FeedbackForm = ({ 
  feedback, 
  rating, 
  setRating, 
  handleFeedbackChange, 
  handleFeedbackSubmit, 
  handleSkipFeedback, 
  feedbackStatus,
  endedSession,
  onRejoinSession
}) => {
  // Check if session ended within last 10 minutes
  const canRejoin = () => {
    if (!endedSession || !endedSession.endTime) return false;
    
    const now = new Date();
    const sessionEndTime = new Date(endedSession.endTime);
    const timeDiffMinutes = (now - sessionEndTime) / (1000 * 60);
    
    return timeDiffMinutes <= 10 && endedSession.roomName;
  };

  return (
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

    {canRejoin() && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-900/50 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm"
      >
        <div className="flex items-center space-x-3 mb-3">
          <Video className="w-5 h-5 text-blue-400" />
          <div>
            <h4 className="font-semibold text-white">Session just ended</h4>
            <p className="text-sm text-slate-300">
              You can rejoin the session room within 10 minutes
            </p>
          </div>
        </div>
        <button
          onClick={onRejoinSession}
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all font-semibold shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2"
        >
          <Video className="w-5 h-5" />
          <span>Rejoin Session Room</span>
        </button>
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
};

// Session history component
const SessionHistory = ({ sessions, isLoadingSessions }) => {
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState('');

  const handleViewNotes = (notes) => {
    setSelectedNotes(notes);
    setShowNotesModal(true);
  };

  return (
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
                <span className="text-xs text-slate-500 block mb-1">
                  {new Date(session.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
                {session.rating && (
                  <div className="flex items-center justify-end space-x-1">
                    <Star className="w-3 h-3 text-amber-400 fill-current" />
                    <span className="text-xs text-slate-400">{session.rating}/5</span>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-sm text-slate-300 mb-2 line-clamp-2">
              <span className="font-medium">Discussed:</span> {session.issueDetails}
            </p>
            
            {session.userNotes && (
              <div className="flex justify-center mb-2">
                <button
                  onClick={() => handleViewNotes(session.userNotes)}
                  className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Notes</span>
                </button>
              </div>
            )}
            
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

    {/* Notes Modal */}
    {showNotesModal && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowNotesModal(false)}>
        <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-slate-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">Session Notes</h3>
            </div>
            <button
              onClick={() => setShowNotesModal(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 max-h-96 overflow-y-auto">
            <p className="text-slate-200 whitespace-pre-wrap">{selectedNotes}</p>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

const VideoChat = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [showCounselorChoice, setShowCounselorChoice] = useState(false);
  const [lastCounselor, setLastCounselor] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [activeSession, setActiveSession] = useState(null);
  const [rejoinLoading, setRejoinLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);

  // Get user ID from token or storage
  const getUserId = useCallback(() => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id || payload._id;
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }
    return null;
  }, []);

  // Join session from appointment
  const joinSessionFromAppointment = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      console.log('🔄 Joining session from appointment:', sessionId);
      
      // Fetch all sessions and find the matching one
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_API_URL}/users/sessions`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );

      console.log('📊 Sessions API response:', response.data);
      
      // Handle both response.data.sessions and response.data array formats
      const sessionsList = response.data.sessions || response.data;
      
      if (!Array.isArray(sessionsList)) {
        console.error('❌ Sessions list is not an array:', sessionsList);
        throw new Error('Invalid sessions response format');
      }

      console.log('📝 Looking for session:', sessionId, 'in', sessionsList.length, 'sessions');
      
      const foundSession = sessionsList.find(s => s._id === sessionId);
      
      if (!foundSession) {
        console.error('❌ Session not found with ID:', sessionId);
        console.log('Available session IDs:', sessionsList.map(s => s._id));
        throw new Error('Session not found in your sessions list');
      }

      console.log('✅ Found session:', foundSession);
      console.log('🏠 Session roomName:', foundSession.roomName);
      console.log('📊 Session status:', foundSession.status);
      
      // Use the same ActiveSession component regardless of roomName
      if (foundSession.status === 'Active') {
        console.log('⚡ Session is Active, using ActiveSession component');
        setSession(foundSession);
        setActiveSession(null); // Clear any active session alert
        setActiveRoom(null); // Don't use VideoMeetWindow
        setToast({ message: 'Joining session...', type: 'success' });
        // Clear URL parameter
        window.history.replaceState({}, '', '/video');
      } else {
        // If session is still Pending, show waiting state
        console.log('⏳ Session is pending, waiting for counselor...');
        setSession(foundSession);
        setActiveSession(null);
      }
    } catch (error) {
      console.error('❌ Error joining session:', error);
      setError(error.message || 'Failed to join session. Please try again or contact support.');
      setToast({ message: error.message || 'Failed to join session', type: 'error' });
      // Clear URL parameter on error
      window.history.replaceState({}, '', '/video');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check for active session
  const checkActiveSession = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/users/active-session`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.data.activeSession) {
        setActiveSession(response.data.activeSession);
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  }, []);

  // Handle join session from appointment
  const handleJoinSessionFromAppointment = useCallback((roomName) => {
    console.log('🎥 Opening VideoMeetWindow with room:', roomName);
    setActiveRoom(roomName);
  }, []);

  // Handle rejoin after session end
  const handleRejoinEndedSession = useCallback(() => {
    if (!endedSession) {
      setError('Session information not available.');
      return;
    }
    
    console.log('🔄 Rejoining ended session:', endedSession._id);
    // Use the same ActiveSession component by setting session
    setSession(endedSession);
    setShowFeedback(false);
    setEndedSession(null);
    setToast({ message: 'Rejoining session...', type: 'success' });
  }, [endedSession]);

  // Dismiss active session function
  const dismissActiveSession = useCallback(async (sessionId) => {
    try {
      setRejoinLoading(true);
      console.log('❌ Dismissing active session:', sessionId);
      
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/users/dismiss-session`,
        { sessionId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );

      console.log('✅ Session dismissed:', response.data);
      
      // Clear the active session alert
      setActiveSession(null);
      setToast({
        message: "Session has been dismissed and marked as completed.",
        type: "info"
      });
    } catch (error) {
      setError("Failed to dismiss session. Please try again.");
      console.error('❌ Error dismissing session:', error);
    } finally {
      setRejoinLoading(false);
    }
  }, []);
  const rejoinSession = useCallback(async (sessionId) => {
    try {
      setRejoinLoading(true);
      console.log('🔄 Rejoining session:', sessionId);
      
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/users/rejoin`,
        { sessionId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );

      console.log('🎥 Rejoined session:', response.data);
      
      if (response.data.session) {
        // Ensure session status is Active when rejoining
        const rejoinedSession = {
          ...response.data.session,
          status: 'Active'
        };
        setSession(rejoinedSession);
        setActiveSession(null); // Clear the active session alert
        setError('');
        setToast({ message: 'Successfully rejoined session', type: 'success' });
      } else {
        throw new Error('No session data returned');
      }
    } catch (error) {
      setError("Failed to rejoin session. Please try again.");
      console.error('❌ Error rejoining session:', error);
    } finally {
      setRejoinLoading(false);
    }
  }, []);

  // Memoized API functions to prevent re-creation
  const requestSession = useCallback(async () => {
    console.log('RequestSession called with:', issueDetails);
    
    if (!issueDetails.trim()) {
      setError('Please provide issue details.');
      return;
    }

    // Check for last counselor progress before making request
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      const progressRes = await axios.get(
        `${import.meta.env.VITE_BASE_API_URL}/users/last-counselor-progress`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (progressRes.data.hasProgress) {
        // Show counselor choice modal
        setLastCounselor(progressRes.data.counselor);
        setShowCounselorChoice(true);
        return; // Don't proceed with request yet
      }
    } catch (e) {
      // If check fails, proceed with request
      console.log('No previous counselor progress found, proceeding with request');
    }

    // Proceed with actual session request
    await proceedWithSessionRequest();
  }, [issueDetails]);

  // Separate function to actually make the session request
  const proceedWithSessionRequest = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }
      
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
      
      console.log('API Response:', response.data);
      
      const newSession = response.data.session;
      setSession(newSession);
      setActiveSession(null); // Clear any active session alert
      
      // Emit socket event for new session request
      socket.emit('sessionRequested', {
        sessionId: newSession._id,
        issueDetails: issueDetails,
        userId: newSession.userId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Request session error:', error);
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

  const fetchAppointments = useCallback(async () => {
    setIsLoadingAppointments(true);
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/users/appointments`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      });
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoadingAppointments(false);
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
      // Store the session with current timestamp as endTime
      setEndedSession({ ...session, endTime: new Date().toISOString() });
      setSession(null);
      setShowFeedback(true);
    } catch (error) {
      setError('Failed to end session. Please try again.');
    } finally {
      setEnding(false);
    }
  }, [session, socket]);

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

  
  const handleFeedbackSubmit = useCallback(async () => {
    if (!endedSession || !endedSession._id) {
      setFeedbackStatus("Session information missing.");
      return;
    }

    if (!rating || rating < 1) {
      setFeedbackStatus("Please provide a rating");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/users/feedback`,
        { feedback: feedback.trim() || '', sessionId: endedSession._id, rating },
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
  }, [endedSession, feedback, rating, handleFeedbackComplete]);

  // On mount, check for active session only
  useEffect(() => {
    checkActiveSession();
  }, [checkActiveSession]);

  // Handler for user choice
  const handleCounselorChoice = async (continueWithSame) => {
    setShowCounselorChoice(false);
    try {
      const token = sessionStorage.getItem('accessToken');
      await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/users/update-counselor-progress`,
        { counselorId: lastCounselor._id,
          sittingProgress: lastCounselor.sittingProgress || 0,
           continueWithSame },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!continueWithSame) {
        setToast({
          message: "You chose to change counselor. Your sittings & progress with the previous counselor will be retained. We won't connect you with the previous counselor.",
          type: "warning"
        });
      } else {
        setToast({
          message: "Continuing with the same counselor. Your sittings & progress will continue.",
          type: "success"
        });
      }
      
      // Proceed with the session request after choice is made
      await proceedWithSessionRequest();
    } catch (e) {
      setToast({ message: "Error updating counselor progress.", type: "error" });
    }
  };

  // Effects
  useEffect(() => {
    // Check for sessionId in URL params (from appointment join)
    const urlParams = new URLSearchParams(location.search);
    const sessionIdFromUrl = urlParams.get('sessionId');
    
    if (sessionIdFromUrl) {
      joinSessionFromAppointment(sessionIdFromUrl);
    } else {
      checkActiveSession();
    }

    fetchSessions();
    fetchAppointments();
    
    const handleSessionsUpdated = () => {
      fetchSessions();
    };
    
    socket.on('sessionsUpdated', handleSessionsUpdated);
    
    return () => {
      socket.off('sessionsUpdated', handleSessionsUpdated);
    };
  }, [location.search, fetchSessions, fetchAppointments, socket, joinSessionFromAppointment, checkActiveSession]);

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
      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />}
      
      {/* Counselor choice modal */}
      {showCounselorChoice && lastCounselor && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-8 max-w-md w-full border border-emerald-500/30 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Continue with previous counselor?</h2>
            <p className="text-slate-300 mb-4">
              You have <span className="font-semibold text-emerald-400">{lastCounselor.sittingProgress}</span> sittings in progress with <span className="font-semibold">{lastCounselor.fullName}</span>.<br />
              <span className="text-amber-400">If you change counselor, your sittings & progress with the previous counselor will be reset.</span>
            </p>
            <div className="flex gap-4">
              <button
                className="flex-1 py-2 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold"
                onClick={() => handleCounselorChoice(true)}
              >
                Continue with Same
              </button>
              <button
                className="flex-1 py-2 px-4 bg-slate-700 text-slate-200 rounded-lg font-semibold border border-slate-600"
                onClick={() => handleCounselorChoice(false)}
              >
                Change Counselor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/MainPage"
              className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:block text-sm font-medium sm:text-base">{t('videoChat.backToDashboard')}</span>
            </Link>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                SoulCare
              </h1>
              <p className="text-sm text-slate-400">{t('videoChat.professionalVideoCounseling')}</p>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-slate-400">{t('videoChat.secureSession')}</span>
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
            {/* Appointments Display */}
            <AppointmentsDisplay 
              appointments={appointments} 
              loading={isLoadingAppointments}
              onJoinSession={handleJoinSessionFromAppointment}
            />
            
            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 p-6 lg:p-8">
              <AnimatePresence>
                {error && (
                  <motion.div
                    key="error-message"
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
              </AnimatePresence>

              <AnimatePresence mode="wait">
               {showFeedback ? (
                  <FeedbackForm
                    key="feedback-form"
                    feedback={feedback}
                    rating={rating}
                    setRating={setRating}
                    handleFeedbackChange={handleFeedbackChange}
                    handleFeedbackSubmit={handleFeedbackSubmit}
                    handleSkipFeedback={handleSkipFeedback}
                    feedbackStatus={feedbackStatus}
                    endedSession={endedSession}
                    onRejoinSession={handleRejoinEndedSession}
                  />
                ) : session ? (
                  <ActiveSession
                    key="active-session"
                    session={session}
                    endSession={endSession}
                    ending={ending}
                    notes={notes}
                    handleNotesChange={handleNotesChange}
                    handleAddNotes={handleAddNotes}
                    noteStatus={noteStatus}
                    userId={getUserId()}
                    userType="user"
                  />
                ) :  (
                  <RequestForm
                    key="request-form"
                    issueDetails={issueDetails}
                    loading={loading}
                    requestSession={requestSession}
                    handleIssueDetailsChange={handleIssueDetailsChange}
                    activeSession={activeSession}
                    rejoinSession={rejoinSession}
                    rejoinLoading={rejoinLoading}
                    dismissActiveSession={dismissActiveSession}
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
                <h2 className="text-xl font-semibold text-white">{t('videoChat.recentSessions')}</h2>
              </div>
              <SessionHistory 
                sessions={sessions} 
                isLoadingSessions={isLoadingSessions} 
              />
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 rounded-2xl border border-emerald-500/30 p-6 backdrop-blur-md">
              <h3 className="font-semibold text-white mb-4">{t('videoChat.needImmediateHelp')}</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 hover:border-emerald-500/50 transition-all text-left">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="font-medium text-white">{t('videoChat.crisisHotline')}</p>
                    <p className="text-sm text-slate-400">{t('videoChat.support24_7')}</p>
                  </div>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 hover:border-emerald-500/50 transition-all text-left">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="font-medium text-white">{t('videoChat.chatSupport')}</p>
                    <p className="text-sm text-slate-400">{t('videoChat.getHelpNow')}</p>
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