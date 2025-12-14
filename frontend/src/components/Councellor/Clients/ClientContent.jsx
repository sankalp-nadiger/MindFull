import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Users, Search, Filter, MoreVertical, AlertCircle, Loader, Eye, Calendar, Clock, X, Check } from 'lucide-react';

const ClientsContent = ({ onViewCaseHistory }) => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
    sessionType: 'follow-up'
  });

  const API_BASE_URL = import.meta.env.VITE_BASE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchClientsData();
  }, []);

  useEffect(() => {
    if (showScheduleModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showScheduleModal]);

  const fetchClientsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/counsellor/clients`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch clients data');
      }
      const data = await response.json();
      setClients(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (clientId) => {
    try {
      setLoadingSlots(true);
      const response = await fetch(`${API_BASE_URL}/counsellor/available-slots/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }
      
      const data = await response.json();
      setAvailableSlots(data);
    } catch (err) {
      console.error('Error fetching available slots:', err);
      setError('Failed to fetch available time slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleScheduleAppointment = async () => {
    try {
      setScheduling(true);
      const response = await fetch(`${API_BASE_URL}/counsellor/schedule-appointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          clientId: selectedClient.id,
          appointmentDate: appointmentForm.date,
          startTime: appointmentForm.startTime,
          endTime: appointmentForm.endTime,
          notes: appointmentForm.notes,
          sessionType: appointmentForm.sessionType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to schedule appointment');
      }

      const data = await response.json();
      
      // Show success message
      alert('Appointment scheduled successfully!');
      
      // Reset form and close modal
      setAppointmentForm({
        date: '',
        startTime: '',
        endTime: '',
        notes: '',
        sessionType: 'follow-up'
      });
      setShowScheduleModal(false);
      setSelectedClient(null);
      
    } catch (err) {
      console.error('Error scheduling appointment:', err);
      alert(err.message || 'Failed to schedule appointment');
    } finally {
      setScheduling(false);
    }
  };

  const openScheduleModal = async (client) => {
    setSelectedClient(client);
    setShowScheduleModal(true);
    await fetchAvailableSlots(client.id);
  };

  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setSelectedClient(null);
    setAvailableSlots([]);
    setAppointmentForm({
      date: '',
      startTime: '',
      endTime: '',
      notes: '',
      sessionType: 'follow-up'
    });
  };

  const selectTimeSlot = (date, slot) => {
    setAppointmentForm(prev => ({
      ...prev,
      date: date,
      startTime: slot.startTime,
      endTime: slot.endTime
    }));
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = (client.name || client.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewCaseHistory = (clientId) => {
    if (onViewCaseHistory) {
      onViewCaseHistory(clientId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading clients...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">Error loading clients: {error}</span>
        </div>
        <button 
          onClick={fetchClientsData}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Clients Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Clients</h2>
            <p className="text-gray-600">Manage your client relationships and schedule appointments</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">{clients.length}</p>
            <p className="text-sm text-gray-500">Total Clients</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Clients Found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sessions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {client.name || client.clientName || 'Client'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.email || 'No email'}</div>
                      <div className="text-sm text-gray-500">{client.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {client.sessions || client.sessionCount || 0} sessions
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.lastSession ? new Date(client.lastSession).toLocaleDateString() : 'No sessions'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                        {client.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleViewCaseHistory(client.id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View Case History"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => openScheduleModal(client)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Schedule Appointment"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                        {/* <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Appointment Modal */}
      {showScheduleModal && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Schedule Appointment - {selectedClient?.name}
              </h3>
              <button 
                onClick={closeScheduleModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {loadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading available slots...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Available Time Slots */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Available Time Slots</h4>
                  {availableSlots.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No available slots for the next 7 days
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableSlots.map((daySlots) => (
                        <div key={daySlots.date} className="border border-gray-200 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2">
                            {daySlots.dayName} - {formatDate(daySlots.date)}
                          </h5>
                          <div className="space-y-2">
                            {daySlots.slots.map((slot) => (
                              <button
                                key={`${slot.startTime}-${slot.endTime}`}
                                onClick={() => selectTimeSlot(daySlots.date, slot)}
                                className={`w-full p-2 text-sm rounded-md border transition-colors ${
                                  appointmentForm.date === daySlots.date && 
                                  appointmentForm.startTime === slot.startTime
                                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <Clock className="h-4 w-4 inline mr-1" />
                                {slot.startTime} - {slot.endTime}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Appointment Details Form */}
                {appointmentForm.date && (
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Appointment Details</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Selected Date & Time
                        </label>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium text-blue-900">
                            {formatDate(appointmentForm.date)}
                          </div>
                          <div className="text-sm text-blue-700">
                            {appointmentForm.startTime} - {appointmentForm.endTime}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Session Type
                        </label>
                        <select
                          value={appointmentForm.sessionType}
                          onChange={(e) => setAppointmentForm(prev => ({
                            ...prev,
                            sessionType: e.target.value
                          }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="follow-up">Follow-up Session</option>
                          <option value="initial">Initial Consultation</option>
                          <option value="emergency">Emergency Session</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={appointmentForm.notes}
                        onChange={(e) => setAppointmentForm(prev => ({
                          ...prev,
                          notes: e.target.value
                        }))}
                        placeholder="Add any notes or special instructions for this appointment..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={closeScheduleModal}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleScheduleAppointment}
                        disabled={scheduling}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {scheduling ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin mr-2" />
                            Scheduling...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Schedule Appointment
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ClientsContent;