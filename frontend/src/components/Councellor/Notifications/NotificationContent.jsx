import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Clock } from 'lucide-react';

const NotificationsContent = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'session_request',
      title: 'New Session Request',
      message: 'Anonymous Client A has requested a session',
      time: '5 minutes ago',
      unread: true
    },
    {
      id: 2,
      type: 'session_reminder',
      title: 'Upcoming Session',
      message: 'Session with Client B starts in 30 minutes',
      time: '25 minutes ago',
      unread: true
    },
    {
      id: 3,
      type: 'feedback',
      title: 'New Feedback',
      message: 'Client C left a 5-star review',
      time: '2 hours ago',
      unread: false
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, unread: false }))
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'session_request':
        return <Bell className="h-5 w-5 text-blue-600" />;
      case 'session_reminder':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'feedback':
        return <Check className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Notifications Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h2>
            <p className="text-gray-600">Stay updated with your latest activities</p>
          </div>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border rounded-lg transition-colors ${
                notification.unread 
                  ? 'border-blue-200 bg-blue-50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {notification.time}
                      </span>
                      {notification.unread && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsContent;