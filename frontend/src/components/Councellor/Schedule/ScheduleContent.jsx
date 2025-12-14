import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Calendar, Clock, Plus, Edit, Trash2, AlertCircle, Loader, ChevronLeft, ChevronRight, Video, FileText } from 'lucide-react';
import Toast from '../../pages/Toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import VideoMeetWindow from '../Session/VideoMeetWindow';
import CounselorReview from '../Session/CounselorReview';

const ScheduleContent = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const navigate = useNavigate();
  const [activeRoom, setActiveRoom] = useState(null);
  const [socket] = useState(() => io(`${import.meta.env.VITE_BASE_URL}`, {
    transports: ['websocket'],
    withCredentials: true,
  }));
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAppointment, setReviewAppointment] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);


  const API_BASE_URL = import.meta.env.VITE_BASE_API_URL;

  useEffect(() => {
    fetchScheduleData();

    fetchClients();
  }, [selectedDate]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);
  
  const fetchClients = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/counsellor/clients`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
        },
      });
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/counsellor/appointments?date=${selectedDate}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch schedule data');
      }
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(
    appointment =>
      new Date(appointment.appointmentDate).toISOString().split('T')[0] === selectedDate
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditAppointment = (appointmentId) => {
    const appointmentToEdit = appointments.find(a => a._id === appointmentId);
    setEditingAppointment(appointmentToEdit);
    setShowModal(true);
  };

  const handleDeleteAppointment = (appointmentId) => {
    const appointment = appointments.find(a => a._id === appointmentId);
    setAppointmentToDelete(appointment);
    setShowDeleteModal(true);
  };

  const confirmDeleteAppointment = async () => {
    if (!appointmentToDelete) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/counsellor/appointments/${appointmentToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
        },
      });
      if (response.ok) {
        setAppointments(prev => prev.filter(apt => apt._id !== appointmentToDelete._id));
        setToast({ message: 'Appointment deleted successfully', type: 'success' });
      } else {
        setToast({ message: 'Failed to delete appointment', type: 'error' });
      }
    } catch (err) {
      console.error('Error deleting appointment:', err);
      setToast({ message: 'Error deleting appointment', type: 'error' });
    } finally {
      setShowDeleteModal(false);
      setAppointmentToDelete(null);
    }
  };

  const handleNewAppointment = () => {
    // Handle new appointment creation
    setEditingAppointment(null);
    setShowModal(true);
  };

  const handlePreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const handleJoinSession = async (appointment) => {
    if (!appointment.sessionId) {
      setToast({ message: 'No session found for this appointment', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const sessionId = appointment.sessionId._id || appointment.sessionId;
      
      console.log('✅ Joining/Rejoining session:', sessionId);
      console.log('📋 Full appointment data:', appointment);
      console.log('🔄 Counselor already joined?', appointment.counselorJoined);
      
      // For rejoin, use the rejoin endpoint if counselor already joined
      const endpoint = appointment.counselorJoined 
        ? `${API_BASE_URL}/counsellor/rejoin`
        : `${API_BASE_URL}/counsellor/accept`;
      
      console.log('🔗 Using endpoint:', endpoint);
      
      const response = await axios.post(
        endpoint,
        { sessionId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );

      console.log('📞 Session response:', response.data);

      if (!response.data.session?.roomName) {
        throw new Error('No room name provided in session response');
      }

      // Mark counselor as joined in appointment (only if not already joined)
      if (!appointment.counselorJoined) {
        await axios.patch(
          `${API_BASE_URL}/counsellor/appointments/${appointment._id}/counselor-joined`,
          {},
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
            },
          }
        );
      }

      setActiveRoom(response.data.session.roomName);
      console.log('🏠 Video room activated:', response.data.session.roomName);
      setToast({ message: appointment.counselorJoined ? 'Rejoining session...' : 'Joining session...', type: 'success' });
      
      // Refresh appointments to update UI
      fetchScheduleData();
    } catch (err) {
      console.error('❌ Error joining session:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      setToast({ message: err.response?.data?.message || 'Failed to join session', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

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
    const windowStart = new Date(startDateTime.getTime() - 4 * 60 * 1000); // 4 minutes before
    const windowEnd = new Date(endDateTime.getTime() + 4 * 60 * 1000); // 4 minutes after
    
    return now >= windowStart && now <= windowEnd;
  };

  const isWithinRejoinTimeWindow = (appointment) => {
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
    
    // Can rejoin if: during appointment time OR within 10 minutes after end time
    const rejoinWindowEnd = new Date(endDateTime.getTime() + 10 * 60 * 1000); // 10 minutes after end
    
    return now >= startDateTime && now <= rejoinWindowEnd;
  };

  const isWithinAppointmentTime = (appointment) => {
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
    
    return now >= startDateTime && now <= endDateTime;
  };

  const handleEndSession = async (appointment) => {
    try {
      const sessionId = appointment.sessionId._id || appointment.sessionId;
      const response = await axios.post(
        `${API_BASE_URL}/counsellor/end-session`,
        { sessionId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );
      
      if (response.data.success) {
        setToast({ message: 'Session ended successfully', type: 'success' });
        fetchScheduleData(); // Refresh to update session status
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error ending session:', err);
      setToast({ message: err.response?.data?.message || 'Failed to end session', type: 'error' });
      return false;
    }
  };

  const handleAddReview = async (appointment) => {
    if (!appointment.sessionId) {
      setToast({ message: 'No session found for this appointment', type: 'error' });
      return;
    }

    const sessionId = appointment.sessionId._id || appointment.sessionId;
    const isSessionComplete = appointment.sessionId?.status === 'completed' || appointment.sessionId?.isComplete;
    
    // If session is complete, open review directly
    if (isSessionComplete) {
      setReviewAppointment(appointment);
      setShowReviewModal(true);
      return;
    }

    // If session is not complete
    if (isWithinAppointmentTime(appointment)) {
      // Within time frame - ask to end session first
      if (window.confirm('The session is still active. Do you want to end it and add a review?')) {
        const ended = await handleEndSession(appointment);
        if (ended) {
          setReviewAppointment(appointment);
          setShowReviewModal(true);
        }
      }
    } else {
      // Outside time frame - add review directly
      setReviewAppointment(appointment);
      setShowReviewModal(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading schedule...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">Error loading schedule: {error}</span>
        </div>
        <button
          onClick={fetchScheduleData}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Schedule Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule</h2>
            <p className="text-gray-600">Manage your appointments and availability</p>
          </div>
          <button
            onClick={handleNewAppointment}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousDay}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors group relative"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Previous day
            </span>
          </button>
          
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                fetchScheduleData();
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors group relative"
            aria-label="Next day"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Next day
            </span>
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Appointments for {new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </h3>

        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Appointments</h3>
            <p className="text-gray-500">You don't have any appointments scheduled for this date.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {appointment.clientId?.fullName || 'Client'}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.sessionId.status || 'pending'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.startTime}</span>
                      </div>
                      <span>•</span>
                      <span>{appointment.type || appointment.sessionType || 'Therapy Session'}</span>
                    </div>
                    {appointment.notes && (
                      <p className="text-sm text-gray-500 mt-2">{appointment.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {appointment.sessionId && !appointment.counselorJoined && isWithinJoinTimeWindow(appointment) && (
                      <button
                        onClick={() => handleJoinSession(appointment)}
                        className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-1 animate-pulse"
                        title="Join Session (Available now)"
                      >
                        <Video className="h-4 w-4" />
                        <span className="text-sm font-medium">Join</span>
                      </button>
                    )}
                    {appointment.sessionId && appointment.counselorJoined && isWithinRejoinTimeWindow(appointment) && (
                      <button
                        onClick={() => handleJoinSession(appointment)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                        title="Rejoin Session"
                      >
                        <Video className="h-4 w-4" />
                        <span className="text-sm font-medium">Rejoin</span>
                      </button>
                    )}
                    {appointment.sessionId && !appointment.counselorJoined && !isWithinJoinTimeWindow(appointment) && (
                      <button
                        disabled
                        className="px-3 py-2 bg-gray-400 text-gray-200 rounded-lg cursor-not-allowed flex items-center space-x-1 opacity-50"
                        title="Join available 4 min before - 4 min after session time"
                      >
                        <Video className="h-4 w-4" />
                        <span className="text-sm font-medium">Join</span>
                      </button>
                    )}
                    {appointment.sessionId && !appointment.sessionId?.counsellorReview && (
                      <button
                        onClick={() => handleAddReview(appointment)}
                        className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1"
                        title="Add Review"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-medium">Review</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleEditAppointment(appointment._id)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(appointment._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {showModal && ReactDOM.createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999] p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">{editingAppointment ? 'Edit Appointment' : 'Create New Appointment'}</h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);

                const newAppointment = {
                  clientId: formData.get('clientId'),
                  appointmentDate: formData.get('date'),
                  startTime: formData.get('startTime'),
                  endTime: formData.get('endTime'),
                  sessionType: formData.get('type'),
                  notes: formData.get('notes'),
                };

                try {
                  const url = editingAppointment
                    ? `${API_BASE_URL}/counsellor/appointments/${editingAppointment._id}`
                    : `${API_BASE_URL}/counsellor/schedule-appointment`;

                  const method = editingAppointment ? 'PUT' : 'POST';

                  const response = await fetch(url, {
                    method,
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
                    },
                    body: JSON.stringify(newAppointment),
                  });

                  let result = {};
                  try { result = await response.json(); } catch {}

                  if (response.ok) {
                    setToast({ message: editingAppointment ? 'Appointment updated successfully.' : 'Appointment created successfully.', type: 'success' });
                    setShowModal(false);
                    setEditingAppointment(null);
                    fetchScheduleData(); // refresh
                  } else {
                    setToast({ message: result.message || 'Operation failed.', type: 'error' });
                  }
                } catch (err) {
                  console.error('Error creating/updating appointment:', err);
                  setToast({ message: 'Unexpected error during update.', type: 'error' });
                }
              }}
            >
              {/* ------------------ CLIENT DROPDOWN ------------------ */}
              <label className="block text-sm font-medium text-gray-700">Client</label>
              <select
                name="clientId"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
                defaultValue={editingAppointment?.clientId?._id || editingAppointment?.clientId || ''}
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id || client._id} value={client.id || client._id}>
                    {client.name || client.fullName}
                  </option>
                ))}
              </select>

              {/* ------------------ DATE ------------------ */}
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                name="date"
                type="date"
                defaultValue={editingAppointment ? new Date(editingAppointment.appointmentDate).toISOString().split('T')[0] : selectedDate}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />

              {/* ------------------ TIME ------------------ */}
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                name="startTime"
                type="time"
                defaultValue={editingAppointment?.startTime || ''}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                name="endTime"
                type="time"
                defaultValue={editingAppointment?.endTime || ''}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />

              {/* ------------------ SESSION TYPE DROPDOWN ------------------ */}
              <label className="block text-sm font-medium text-gray-700">Session Type</label>
              <select
                name="type"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                defaultValue={editingAppointment?.sessionType || 'follow-up'}
              >
                <option value="initial">Initial</option>
                <option value="follow-up">Follow-up</option>
                <option value="emergency">Emergency</option>
              </select>

              {/* ------------------ NOTES ------------------ */}
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                name="notes"
                placeholder="Add any notes..."
                defaultValue={editingAppointment?.notes || ''}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />

              {/* ------------------ BUTTONS ------------------ */}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingAppointment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      
      {/* Toast Notification */}
      {toast.message && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ message: '', type: 'info' })}
          />
        </div>
      )}

      {/* Video Meeting Window */}
      {activeRoom && (
        <VideoMeetWindow 
          activeRoom={activeRoom}
          onClose={() => setActiveRoom(null)}
          socket={socket}
          userId={sessionStorage.getItem('userId')}
          userType="counselor"
        />
      )}

      {/* Counselor Review Modal */}
      {showReviewModal && reviewAppointment && ReactDOM.createPortal(
        <CounselorReview
          isOpen={showReviewModal}
          onClose={(success) => {
            setShowReviewModal(false);
            setReviewAppointment(null);
            if (success) {
              setToast({ message: 'Review added successfully', type: 'success' });
            }
            fetchScheduleData(); // Refresh appointments after review
          }}
          sessionData={{
            sessionId: reviewAppointment.sessionId?._id || reviewAppointment.sessionId,
            fullName: reviewAppointment.clientId?.fullName || 'Client',
            duration: `${reviewAppointment.startTime} - ${reviewAppointment.endTime}`,
          }}
          userId={reviewAppointment.clientId?._id || reviewAppointment.clientId}
          inSittingSeries={false}
          sittingNotes=""
          currentSittingNumber={0}
          totalRecommendedSittings={0}
        />,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && appointmentToDelete && ReactDOM.createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999] p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Delete Appointment</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the appointment with{' '}
              <span className="font-semibold">{appointmentToDelete.clientId?.fullName || 'Client'}</span>{' '}
              on {new Date(appointmentToDelete.appointmentDate).toLocaleDateString('en-GB')} at {appointmentToDelete.startTime}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setAppointmentToDelete(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAppointment}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ScheduleContent;