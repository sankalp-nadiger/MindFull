import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Clock, AlertCircle, Loader, Calendar, Video, MessageSquare, Star, User } from 'lucide-react';

const NotificationsContent = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingActions, setProcessingActions] = useState(new Set());

  const API_BASE_URL = import.meta.env.VITE_BASE_API_URL;

  const getAuthHeaders = () => {
  const token = sessionStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

  // Fetch notifications
  const fetchNotifications = async () => {
  try {
    setLoading(true);
    setError(null);
    const response = await fetch(`${API_BASE_URL}/counsellor/notifications`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    const data = await response.json();
    // If data is not an array, fallback to empty array
setNotifications(Array.isArray(data) ? data : []);
  } catch (err) {
    setError(err.message);
    console.error('Error fetching notifications:', err);
  } finally {
    setLoading(false);
  }
};


  // Initial fetch + auto-refresh every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s
    return () => clearInterval(interval);
  }, []);

  // Mark single notification as read
  const markAsRead = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/counsellor/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (response.ok) {
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, unread: false } : notif
        )
      );
    }
  } catch (err) {
    console.error('Error marking notification as read:', err);
  }
};

const markAllAsRead = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/counsellor/notifications/read-all`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (response.ok) {
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, unread: false }))
      );
    }
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
  }
};

const handleAcceptRequest = async (notificationId, type) => {
  setProcessingActions(prev => new Set([...prev, notificationId]));
  try {
    const response = await fetch(`${API_BASE_URL}/counsellor/notifications/${notificationId}/accept`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, unread: false, accepted: true } : notif
        )
      );
      if (type === 'session_request' && onNavigate) onNavigate('/session');
      else if (type === 'appointment' && onNavigate) onNavigate('/clients');
      else if (type === 'sitting_recommendation' && onNavigate) onNavigate('/clients'); // ✅ redirect counselor
    }
  } catch (err) {
    console.error('Error accepting request:', err);
  } finally {
    setProcessingActions(prev => {
      const newSet = new Set(prev);
      newSet.delete(notificationId);
      return newSet;
    });
  }
};

const handleRejectRequest = async (notificationId) => {
  setProcessingActions(prev => new Set([...prev, notificationId]));
  try {
    const response = await fetch(`${API_BASE_URL}/counsellor/notifications/${notificationId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (response.ok) {
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, unread: false, rejected: true } : notif
        )
      );
    }
  } catch (err) {
    console.error('Error rejecting request:', err);
  } finally {
    setProcessingActions(prev => {
      const newSet = new Set(prev);
      newSet.delete(notificationId);
      return newSet;
    });
  }
};


  // Notification click
  const handleNotificationClick = (notification) => {
    if (notification.unread) markAsRead(notification._id);
    if (onNavigate) {
      switch (notification.type) {
        case 'appointment': onNavigate('/clients'); break;
        case 'session_reminder': onNavigate('/schedule'); break;
        default: break;
      }
    }
  };

  // Notification icon
  // Notification icon
const getNotificationIcon = (type) => {
  switch (type) {
    case 'session_request': return <Video className="h-5 w-5 text-blue-600" />;
    case 'session_reminder': return <Clock className="h-5 w-5 text-yellow-600" />;
    case 'appointment': return <Calendar className="h-5 w-5 text-purple-600" />;
    case 'feedback':
    case 'review': return <Star className="h-5 w-5 text-green-600" />;
    case 'sitting_recommendation': return <User className="h-5 w-5 text-pink-600" />; // ✅ New type
    case 'message': return <MessageSquare className="h-5 w-5 text-indigo-600" />;
    case 'client_update': return <User className="h-5 w-5 text-teal-600" />;
    default: return <Bell className="h-5 w-5 text-gray-600" />;
  }
};

  const getNotificationColor = (type, unread) => {
    return unread ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white';
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader className="h-8 w-8 animate-spin text-blue-600" />
      <span className="ml-2 text-gray-600">Loading notifications...</span>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
        <span className="text-red-800">Error loading notifications: {error}</span>
      </div>
      <button 
        onClick={fetchNotifications}
        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Notifications {unreadCount > 0 && <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">{unreadCount} new</span>}
          </h2>
          <p className="text-gray-600">Stay updated with your latest activities</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Mark All Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-500">You're all caught up! No new notifications.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => (
              <div key={notification._id} className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${getNotificationColor(notification.type, notification.unread)}`}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900">{notification.title}</h3>
                          {notification.unread && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <span className="text-xs text-gray-500 mt-2 block">{notification.time ? new Date(notification.time).toLocaleString() : 'Recently'}</span>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {notification.unread && (
                          <button onClick={() => markAsRead(notification._id)} className="text-blue-600 hover:text-blue-800 transition-colors" title="Mark as read">
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
{(notification.type === 'session_request' || 
  notification.type === 'appointment' ||
  notification.type === 'sitting_recommendation') && 
  !notification.accepted && !notification.rejected && (
    <div className="flex items-center space-x-2 mt-3">
      <button
        onClick={() => handleAcceptRequest(notification._id, notification.type)}
        disabled={processingActions.has(notification._id)}
        className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
      >
        {processingActions.has(notification._id) ? <Loader className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
        <span>Accept</span>
      </button>
      <button
        onClick={() => handleRejectRequest(notification._id)}
        disabled={processingActions.has(notification._id)}
        className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
      >
        <X className="h-3 w-3" />
        <span>Reject</span>
      </button>
    </div>
)}


                    {/* Status */}
                    {notification.accepted && <span className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Accepted</span>}
                    {notification.rejected && <span className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><X className="h-3 w-3 mr-1" />Rejected</span>}

                    {/* View Details */}
                    {(notification.type === 'appointment' || notification.type === 'session_reminder' || notification.type === 'feedback') && (
                      <button onClick={() => handleNotificationClick(notification)} className="text-xs text-blue-600 hover:text-blue-800 mt-2 underline">View Details →</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsContent;