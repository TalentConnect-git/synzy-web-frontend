import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, CheckCheck, Check, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api/notificationService';
import { useAuth } from '../context/AuthContext';

const POLL_INTERVAL_MS = 30000; // Poll every 30 seconds

const NotificationIcon = () => {
  const { user: currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const pollTimerRef = useRef(null);

  // The backend notification system uses authId. For all user types,
  // the user object contains _id which is their authId from the auth table.
  const getAuthId = useCallback(() => {
    return currentUser?._id || currentUser?.authId || null;
  }, [currentUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = useCallback(async (silent = false) => {
    const authId = getAuthId();
    if (!authId || !currentUser) return;

    if (!silent) setLoading(true);
    try {
      const result = await getUserNotifications(authId, 1, 20);
      const fetched = result.notifications || [];
      setNotifications(fetched);
      setUnreadCount(fetched.filter(n => !n.is_read).length);
    } catch (error) {
      if (!silent) {
        console.error('Error fetching notifications:', error);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [currentUser, getAuthId]);

  // Fetch on mount and when user changes
  useEffect(() => {
    if (!currentUser || !getAuthId()) return;
    fetchNotifications(false);
  }, [currentUser, fetchNotifications, getAuthId]);

  // Poll for new notifications periodically
  useEffect(() => {
    if (!currentUser || !getAuthId()) return;

    pollTimerRef.current = setInterval(() => {
      fetchNotifications(true); // silent poll
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [currentUser, fetchNotifications, getAuthId]);

  // Reload notifications when dropdown is opened
  const handleBellClick = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) fetchNotifications(false);
  };

  const handleMarkAsRead = async (notification) => {
    if (notification.is_read) return;
    try {
      await markNotificationAsRead(notification._id);
      setNotifications(prev =>
        prev.map(n => n._id === notification._id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const authId = getAuthId();
    if (!authId) return;
    try {
      await markAllNotificationsAsRead(authId);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const cls = 'w-5 h-5 flex-shrink-0';
    switch (type) {
      case 'Accepted':  return <CheckCircle className={`${cls} text-green-500`} />;
      case 'Rejected':  return <XCircle className={`${cls} text-red-500`} />;
      case 'Interview': return <AlertTriangle className={`${cls} text-yellow-500`} />;
      case 'Reviewed':  return <Info className={`${cls} text-blue-500`} />;
      case 'Submitted': return <Check className={`${cls} text-indigo-500`} />;
      default:          return <Info className={`${cls} text-gray-400`} />;
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'Accepted':  return 'bg-green-100 text-green-700';
      case 'Rejected':  return 'bg-red-100 text-red-700';
      case 'Interview': return 'bg-yellow-100 text-yellow-700';
      case 'Reviewed':  return 'bg-blue-100 text-blue-700';
      case 'Submitted': return 'bg-indigo-100 text-indigo-700';
      default:          return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Don't render if not logged in
  if (!currentUser || !getAuthId()) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none shadow">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          id="notification-dropdown"
          className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          style={{ maxHeight: '500px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-blue-600" />
              <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  id="mark-all-read-btn"
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <CheckCheck size={13} />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-300 border-t-blue-600 mb-3" />
                <p className="text-sm">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 px-6">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Bell size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">No notifications yet</p>
                <p className="text-xs text-gray-400 text-center mt-1">
                  You'll be notified about important updates here
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`group flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 cursor-pointer transition-colors duration-150 ${
                    !notification.is_read ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleMarkAsRead(notification)}
                >
                  {/* Icon */}
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.notificationType)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!notification.is_read ? 'font-semibold text-gray-900' : 'font-normal text-gray-700'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
                      {notification.body}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-gray-400">
                        {formatDate(notification.createdAt)}
                      </span>
                      {notification.notificationType && notification.notificationType !== 'Others' && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${getBadgeColor(notification.notificationType)}`}>
                          {notification.notificationType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!notification.is_read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-center">
              <p className="text-xs text-gray-400">
                Showing latest {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
