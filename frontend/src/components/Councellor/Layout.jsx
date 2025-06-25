import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Users, Settings, LogOut, Video, Home, Heart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Layout = ({ children, onViewCaseHistory }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [counselor, setCounselor] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCounselorProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_API_URL}/counsellor/profile`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
            },
          }
        );
        setCounselor(response.data.counselor);
      } catch (error) {
        console.error('Error fetching counselor profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounselorProfile();
  }, []);
  
  const handleLogout = () => {
    sessionStorage.removeItem('accessToken');
    window.location.href = '/';
  };

  const NavigationItem = ({ icon: Icon, label, route, notifications }) => {
    const isActive = location.pathname === route;
    
    return (
      <button
        onClick={() => navigate(route)}
        className={`flex items-center justify-between w-full p-3 rounded-lg transition-all duration-200 ${
          isActive 
            ? 'bg-indigo-50 text-indigo-600' 
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center space-x-3">
          <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
          <span className="font-medium">{label}</span>
        </div>
        {notifications && (
          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
            {notifications}
          </span>
        )}
      </button>
    );
  };

  // Clone children and pass onViewCaseHistory prop
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { onViewCaseHistory });
    }
    return child;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 pt-4">
              <a className="flex items-center flex-shrink-0 font-medium text-gray-900 transition-all duration-300 title-font group hover:scale-105" style={{ marginBottom: '1rem' }}>
                <div className="relative">
                  <img src="plant.png" alt="Logo" className="w-8 h-8 transition-transform duration-300 group-hover:rotate-12" />
                  <div className="absolute inset-0 transition-opacity duration-300 rounded-full opacity-0 bg-gradient-to-r from-blue-400/20 to-green-400/20 group-hover:opacity-100 blur-sm"></div>
                </div>
                <span className="ml-3 text-3xl font-bold tracking-wide text-transparent bg-gradient-to-r from-blue-400 via-teal-400 to-green-400 bg-clip-text">
                  MindFull
                </span>
              </a>
            </div>
            
            <div className="flex-1 flex justify-center">
              <div>
                <h1 className="text-xl font-bold text-gray-900">MindCare Pro</h1>
                <p className="text-sm text-gray-500 text-center">Counsellor Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
              </button>
              
              <div className="flex items-center space-x-3 border-l pl-4">
                {!loading && (
                  <>
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={counselor?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${counselor?._id}`}
                      alt="Profile"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {counselor?.fullName || 'Loading...'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {counselor?.specification?.[0] || 'Counselor'} • {counselor?.yearexp || 0} Years Exp.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <nav className="space-y-2">
                <NavigationItem
                  icon={Home}
                  label="Dashboard"
                  route="/councellor"
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

          {/* Main Content Area */}
          <div className="col-span-9">
            {childrenWithProps}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;