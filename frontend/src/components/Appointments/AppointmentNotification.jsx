import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, User, Calendar } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AppointmentNotification = () => {
  const { t } = useTranslation();
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Check if within join time window (4 min before start to 4 min after end)
  const isWithinJoinTimeWindow = () => {
    if (!upcomingAppointment) return false;

    const now = new Date();
    const appointmentDate = new Date(upcomingAppointment.appointmentDate);
    
    // Parse start time
    const [startHour, startMinute] = upcomingAppointment.startTime.split(':').map(Number);
    const startDateTime = new Date(appointmentDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    
    // Parse end time
    const [endHour, endMinute] = upcomingAppointment.endTime.split(':').map(Number);
    const endDateTime = new Date(appointmentDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);
    
    // Calculate time window: 4 minutes before start to 4 minutes after end
    const windowStart = new Date(startDateTime.getTime() - 4 * 60 * 1000); // 4 minutes before
    const windowEnd = new Date(endDateTime.getTime() + 4 * 60 * 1000); // 4 minutes after
    
    return now >= windowStart && now <= windowEnd;
  };

  // Mark appointment as joined and navigate to video page
  const handleJoinSession = async () => {
    if (!upcomingAppointment || !upcomingAppointment.sessionId) return;
    
    try {
      const sessionId = upcomingAppointment.sessionId._id || upcomingAppointment.sessionId;
      console.log('🎥 Joining session from notification:', sessionId);
      
      // Mark appointment as joined
      await axios.patch(
        `${import.meta.env.VITE_BASE_API_URL}/users/appointments/${upcomingAppointment._id}/joined`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );
      
      // Navigate to video page with sessionId in URL
      // The VideoChat component will pick it up and join the session
      navigate(`/video?sessionId=${sessionId}`);
    } catch (error) {
      console.error('❌ Error joining session:', error);
      // Still try to navigate
      const sessionId = upcomingAppointment.sessionId?._id || upcomingAppointment.sessionId;
      if (sessionId) {
        navigate(`/video?sessionId=${sessionId}`);
      }
    }
  };

  // Fetch today's appointments
  const fetchTodaysAppointments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_API_URL}/users/appointments/today`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );

      if (response.data.appointments && response.data.appointments.length > 0) {
        const now = new Date();
        
        // Filter appointments that haven't ended yet AND user hasn't joined
        const activeAppointments = response.data.appointments.filter(appointment => {
          if (!appointment.endTime || !/^[0-2]?\d:\d{2}$/.test(appointment.endTime)) return false;
          
          const appointmentDate = new Date(appointment.appointmentDate);
          const [endH, endM] = appointment.endTime.split(':').map(x => parseInt(x, 10));
          appointmentDate.setHours(endH, endM, 0, 0);
          
          // Show if end time hasn't passed AND user hasn't joined
          return appointmentDate.getTime() > now.getTime() && !appointment.userJoined;
        });
        
        if (activeAppointments.length > 0) {
          const appointment = activeAppointments[0]; // Get the first active appointment
          checkIfUpcoming(appointment);
        } else {
          setIsVisible(false);
          setUpcomingAppointment(null);
        }
      } else {
        setIsVisible(false);
        setUpcomingAppointment(null);
      }
    } catch (error) {
      console.error('Error fetching today\'s appointments:', error);
    }
  };

  // Check if appointment is within 1 hour or already active
  const checkIfUpcoming = (appointment) => {
    const now = new Date();
    const appointmentStartDate = new Date(appointment.appointmentDate);
    const appointmentEndDate = new Date(appointment.appointmentDate);
    
    // Parse start time (format: "14:30")
    const [startHours, startMinutes] = appointment.startTime.split(':');
    appointmentStartDate.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);
    
    // Parse end time
    const [endHours, endMinutes] = appointment.endTime.split(':');
    appointmentEndDate.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

    const timeDiff = appointmentStartDate - now;
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    // Show notification if:
    // 1. Appointment is within 1 hour before start, OR
    // 2. Appointment has started but not ended yet
    if ((timeDiff > 0 && timeDiff <= oneHour) || (now >= appointmentStartDate && now < appointmentEndDate)) {
      setUpcomingAppointment(appointment);
      setIsVisible(true);
    } else {
      setIsVisible(false);
      setUpcomingAppointment(null);
    }
  };

  // Calculate time remaining
  const calculateTimeRemaining = () => {
    if (!upcomingAppointment) return '';

    const now = new Date();
    const appointmentStartDate = new Date(upcomingAppointment.appointmentDate);
    const [hours, minutes] = upcomingAppointment.startTime.split(':');
    appointmentStartDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const timeDiff = appointmentStartDate - now;

    // If appointment has already started
    if (timeDiff <= 0) {
      return t('appointments.sessionInProgress');
    }

    const minutesRemaining = Math.floor(timeDiff / (1000 * 60));
    
    if (minutesRemaining < 1) {
      return t('appointments.startingNow');
    } else if (minutesRemaining === 1) {
      return t('appointments.oneMinuteToGo');
    } else {
      return t('appointments.minutesToGo', { minutes: minutesRemaining });
    }
  };

  useEffect(() => {
    // Fetch appointments on mount
    fetchTodaysAppointments();

    // Check every minute
    const interval = setInterval(() => {
      fetchTodaysAppointments();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update time remaining every second
    if (upcomingAppointment) {
      const interval = setInterval(() => {
        const remaining = calculateTimeRemaining();
        setTimeRemaining(remaining);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [upcomingAppointment]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || !upcomingAppointment) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="fixed bottom-[140px] right-6 z-50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Collapsed state - Clock icon */}
        {!isHovered && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative cursor-pointer"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl hover:shadow-blue-500/50 transition-all">
              <Clock className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">1</span>
            </div>
          </motion.div>
        )}

        {/* Expanded state - Full notification */}
        {isHovered && (
          <motion.div
            initial={{ width: 48, height: 48 }}
            animate={{ width: 'auto', height: 'auto' }}
            exit={{ width: 48, height: 48 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-blue-500/50 overflow-hidden"
          >
            <div className="p-5 min-w-[320px] max-w-[400px]">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{t('appointments.upcomingSession')}</h3>
                    <p className="text-blue-400 text-sm font-medium">{timeRemaining}</p>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Counselor Info */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {upcomingAppointment.counsellorId?.fullName || t('videoChat.counselor')}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {upcomingAppointment.counsellorId?.specialization || t('videoChat.mentalHealthProfessional')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300">
                      {new Date(upcomingAppointment.appointmentDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">
                      {upcomingAppointment.startTime} - {upcomingAppointment.endTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {isWithinJoinTimeWindow() ? (
                <button
                  onClick={handleJoinSession}
                  className="mt-4 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold text-center block hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-emerald-500/50 animate-pulse"
                >
                  {t('appointments.joinSession') || 'Join Session Now'}
                </button>
              ) : (
                <button
                  disabled
                  className="mt-4 w-full bg-slate-700 text-slate-400 py-3 rounded-xl font-semibold text-center block cursor-not-allowed opacity-50"
                  title="Join available 4 minutes before session starts"
                >
                  {t('appointments.joinAvailableSoon') || 'Join Available Soon'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default AppointmentNotification;
