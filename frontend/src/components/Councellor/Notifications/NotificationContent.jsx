import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Clock, AlertCircle, Loader, Calendar, Video, MessageSquare, Star, User } from 'lucide-react';

const NotificationsContent = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingActions, setProcessingActions] = useState(new Set());

  const API_BASE_URL = import.meta.env.VITE_BASE_API_URL;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/counselor/notifications`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/counselor/notifications/${id}/read`, {
        method: 'PATCH',
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
      const response = await fetch(`${API_BASE_URL}/counselor/notifications/read-all`, {
        method: 'PATCH',
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
      const response = await fetch(`${API_BASE_URL}/counselor/notifications/${notificationId}/accept`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Mark as read and update status
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, unread: false, accepted: true }
              : notif
          )
        );
        
        // Navigate based on type
        if (type === 'session_request') {
          if (onNavigate) {
            onNavigate('/session');
          }
        } else if (type === 'appointment') {
          if (onNavigate) {
            onNavigate('/clients');
          }
        }
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
      const response = await fetch(`${API_BASE_URL}/counselor/notifications/${notificationId}/reject`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, unread: false, rejected: true }
              : notif
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

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (notification.unread) {
      markAsRead(notification.id);
    }

    // Navigate based on type
    if (onNavigate) {
      switch (notification.type) {
        case 'appointment':
          onNavigate('/clients');
          break;
        case 'session_reminder':
          onNavigate('/schedule');
          break;
        case 'feedback':
        case 'review':
          // Could navigate to a reviews/feedback page
          break;
        default:
          break;
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'session_request':
        return <Video className="h-5 w-5 text-blue-600" />;
      case 'session_reminder':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'appointment':
        return <Calendar className="h-5 w-5 text-purple-600" />;
      case 'feedback':
      case 'review':
        return <Star className="h-5 w-5 text-green-600" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-indigo-600" />;
      case 'client_update':
        return <User className="h-5 w-5 text-teal-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type, unread) => {
    const baseColor = unread ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white';
    return baseColor;
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading notifications...</span>
      </div>
    );
  }

  if (error) {
    return (
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
  }

  return (
    <div className="space-y-8">
      {/* Notifications Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                  {unreadCount} new
                </span>
              )}
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
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${getNotificationColor(notification.type, notification.unread)}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h3>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500">
                            {notification.time || notification.createdAt ? 
                              new Date(notification.time || notification.createdAt).toLocaleString() : 
                              'Recently'
                            }
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {notification.unread && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Action buttons for session requests and appointments */}
                    {(notification.type === 'session_request' || notification.type === 'appointment') && 
                     !notification.accepted && !notification.rejected && (
                      <div className="flex items-center space-x-2 mt-3">
                        <button
                          onClick={() => handleAcceptRequest(notification.id, notification.type)}
                          disabled={processingActions.has(notification.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          {processingActions.has(notification.id) ? (
                            <Loader className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleRejectRequest(notification.id)}
                          disabled={processingActions.has(notification.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          <X className="h-3 w-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {/* Status indicators */}
                    {notification.accepted && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Accepted
                        </span>
                      </div>
                    )}
                    {notification.rejected && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <X className="h-3 w-3 mr-1" />
                          Rejected
                        </span>
                      </div>
                    )}

                    {/* Clickable area for navigation */}
                    {(notification.type === 'appointment' || notification.type === 'session_reminder' || notification.type === 'feedback') && (
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className="text-xs text-blue-600 hover:text-blue-800 mt-2 underline"
                      >
                        View Details →
                      </button>
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