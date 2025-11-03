import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2, AlertCircle, Loader } from 'lucide-react';

const ScheduleContent = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [editingAppointment, setEditingAppointment] = useState(null);


  const API_BASE_URL = import.meta.env.VITE_BASE_API_URL;

  useEffect(() => {
    fetchScheduleData();

    fetchClients();
  }, [selectedDate]);
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

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/counsellor/appointments/${appointmentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        });
        if (response.ok) {
          setAppointments(prev => prev.filter(apt => apt._id !== appointmentId));
        } else {
          console.error('Failed to delete appointment');
        }
      } catch (err) {
        console.error('Error deleting appointment:', err);
      }
    }
  };

  const handleNewAppointment = () => {
    // Handle new appointment creation
    setShowModal(true);
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
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-600" />
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
      </div>

      {/* Appointments List */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Appointments for {new Date(selectedDate).toLocaleDateString()}
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
                        {appointment.status || 'pending'}
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
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Create New Appointment</h2>

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

                  const result = await response.json();

                  if (response.ok) {
                    setShowModal(false);
                    setEditingAppointment(null);
                    fetchScheduleData(); // refresh
                  } else {
                    alert(result.message || 'Operation failed');
                  }
                } catch (err) {
                  console.error('Error creating/updating appointment:', err);
                }
              }}
            >
              {/* ------------------ CLIENT DROPDOWN ------------------ */}
              <label className="block text-sm font-medium text-gray-700">Client</label>
              <select
                name="clientId"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>

              {/* ------------------ DATE ------------------ */}
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                name="date"
                type="date"
                defaultValue={selectedDate}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />

              {/* ------------------ TIME ------------------ */}
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                name="startTime"
                type="time"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                name="endTime"
                type="time"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />

              {/* ------------------ SESSION TYPE DROPDOWN ------------------ */}
              <label className="block text-sm font-medium text-gray-700">Session Type</label>
              <select
                name="type"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                defaultValue="follow-up"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />

              {/* ------------------ BUTTONS ------------------ */}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

  );
};

export default ScheduleContent;