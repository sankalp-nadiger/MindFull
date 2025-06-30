import React, { useState, useEffect } from 'react';
import { Video, Clock, TrendingUp, Heart, Calendar, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardContent = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    fetchStats();
  }, []);

  // Simulated data for demonstration (keep for now, but can be replaced with real data)
  const upcomingSessions = [
    { id: 1, client: 'Anonymous Client A', time: '2:00 PM', type: 'Individual Therapy' },
    { id: 2, client: 'Anonymous Client B', time: '3:30 PM', type: 'Couples Therapy' },
    { id: 3, client: 'Anonymous Client C', time: '5:00 PM', type: 'Group Session' }
  ];

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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{session.client}</p>
                  <p className="text-sm text-gray-600">{session.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-blue-600">{session.time}</p>
                  <button className="text-sm text-gray-500 hover:text-gray-700">View Details</button>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate('/schedule')}
            className="w-full mt-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            View Full Schedule →
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;