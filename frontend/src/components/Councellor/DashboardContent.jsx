import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Video, Clock, TrendingUp, Heart, Calendar, MessageCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardContent = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [todaySessions, setTodaySessions] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);


  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/counsellor/dashboard-stats`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    const fetchTodaySessions = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/counsellor/appointments/today`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch today's sessions");
        const data = await response.json();
        setTodaySessions(data);
      } catch (error) {
        console.error(error);
        setTodaySessions([]);
      }
    };

    fetchTodaySessions();
    fetchStats();
  }, []);



  const recentActivities = [
    { id: 1, action: 'Session completed', client: 'Client A', time: '1 hour ago' },
    { id: 2, action: 'New appointment scheduled', client: 'Client B', time: '2 hours ago' },
    { id: 3, action: 'Session notes updated', client: 'Client C', time: '3 hours ago' }
  ];

  const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
  if (!stats) return null;

  return (
    <div className="space-y-8 ">
      {/* Welcome Section */}
      <div className=" bg-gradient-to-r from-blue-600 to-green-500 rounded-xl p-8 text-white">
        <div className="flex items-center justify-center ">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {stats.counselorName}! 👋
            </h2>
            <p className="text-blue-100">
              You have {stats.upcomingSessions} sessions scheduled for today. Keep making a difference!
            </p>
          </div>
          <div className="hidden md:block">
            <Heart className="h-16 w-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sessions"
          value={stats.sessionsTaken}
          subtitle="This month"
          icon={Video}
          color="text-blue-600"
        />
        <StatCard
          title="Upcoming Today"
          value={stats.upcomingSessions}
          subtitle="Scheduled sessions"
          icon={Clock}
          color="text-green-600"
        />
        <StatCard
          title="Total Hours"
          value={`${stats.totalHours}h`}
          subtitle="This month"
          icon={TrendingUp}
          color="text-purple-600"
        />
        <StatCard
          title="Avg. Rating"
          value={stats.avgSessionRating}
          subtitle="Client feedback"
          icon={Heart}
          color="text-pink-600"
        />
      </div>

      {/* Today's Schedule & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {todaySessions.length > 0 ? (
              todaySessions.map((session) => (
                <div
                  key={session._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {session.clientId?.fullName || "Unknown Client"}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      {session.type || "Session"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-blue-600">
                      {session.startTime || "N/A"}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedAppointment(session);
                        setShowDetailsModal(true);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No sessions scheduled for today.</p>
            )}
          </div>
          <button
            onClick={() => navigate('/schedule')}
            className="w-full mt-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            View Full Schedule →
          </button>
        </div>

        {/* Recent Activity */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <MessageCircle className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.client}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
            View All Activity →
          </button>
        </div> */}
      </div>

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && ReactDOM.createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999] p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedAppointment(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900 text-sm">
                  {selectedAppointment.clientId?.fullName || 'Unknown Client'}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900 text-sm">
                  {new Date(selectedAppointment.appointmentDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </div>
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900 text-sm">
                  {selectedAppointment.startTime || 'N/A'}
                </div>
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900 text-sm">
                  {selectedAppointment.endTime || 'N/A'}
                </div>
              </div>

              {/* Session Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900 capitalize text-sm">
                  {selectedAppointment.type || selectedAppointment.sessionType || 'Follow-up'}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900 capitalize text-sm">
                  {selectedAppointment.status || 'Pending'}
                </div>
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900 text-sm">
                    {selectedAppointment.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedAppointment(null);
                }}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DashboardContent;