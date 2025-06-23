import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Users, Settings, LogOut, Video, Home, Clock, TrendingUp, Heart, MessageCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
function Councellor() {
  const [stats, setStats] = useState({
    counselorName: 'Dr. Sarah Johnson',
    sessionsTaken: 47,
    upcomingSessions: 3,
    completedSessions: 44,
    avgSessionRating: 4.8,
    totalHours: 78.5
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Simulated data for demonstration
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

  const handleLogout = () => {
    // Handle logout logic here
    window.location.href = '/';
  };

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

  const NavigationItem = ({ icon: Icon, label, route, notifications }) => (
    <button
      onClick={() => navigate(route)}
      className="flex items-center justify-between w-full p-3 rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-50"
    >
      <div className="flex items-center space-x-3">
        <Icon className="h-5 w-5 text-gray-500" />
        <span className="font-medium">{label}</span>
      </div>
      {notifications && (
        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
          {notifications}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">MindCare Pro</h1>
                  <p className="text-sm text-gray-500">Counsellor Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
              </button>
              
              <div className="flex items-center space-x-3 border-l pl-4">
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Profile"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Dr. Sarah Johnson</p>
                  <p className="text-xs text-gray-500">Licensed Therapist</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <nav className="space-y-2">
                <NavigationItem
                  icon={Home}
                  label="Dashboard"
                  route="/dashboard"
                />
                <NavigationItem
                  icon={Bell}
                  label="Notifications"
                  route="/notifications"
                  notifications={3}
                />
                <NavigationItem
                  icon={Video}
                  label="Sessions"
                  route="/sessions"
                />
                <NavigationItem
                  icon={Calendar}
                  label="Schedule"
                  route="/schedule"
                />
                <NavigationItem
                  icon={Users}
                  label="Clients"
                  route="/clients"
                />
                <NavigationItem
                  icon={Settings}
                  label="Profile"
                  route="/profile"
                />
              </nav>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content - Dashboard */}
          <div className="col-span-9">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Councellor;