import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import NotificationItem from '../../components/notifications/NotificationItem';
import NotificationFilter from '../../components/notifications/NotificationFilter';
import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  RefreshCw,
  Inbox
} from 'lucide-react';

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time notifications with Socket.io
    setupRealtimeNotifications();

    return () => {
      // Cleanup socket connection
      cleanupRealtimeNotifications();
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [notifications, filters]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeNotifications = () => {
    // TODO: Implement Socket.io connection
    // const socket = io(API_URL);
    // socket.on('notification', (notification) => {
    //   setNotifications(prev => [notification, ...prev]);
    // });
  };

  const cleanupRealtimeNotifications = () => {
    // TODO: Disconnect socket
    // socket.disconnect();
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(notif => 
        notif.type?.includes(filters.type)
      );
    }

    // Status filter
    if (filters.status === 'unread') {
      filtered = filtered.filter(notif => !notif.is_read);
    } else if (filters.status === 'read') {
      filtered = filtered.filter(notif => notif.is_read);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(notif => {
        const notifDate = new Date(notif.created_at);
        
        switch (filters.dateRange) {
          case 'today':
            return notifDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return notifDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return notifDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      
      setNotifications(prev => prev.map(notif =>
        notif.notification_id === notificationId
          ? { ...notif, is_read: true }
          : notif
      ));

      setSuccessMessage('Notification marked as read');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      console.error('Error marking as read:', err);
      alert('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      
      setNotifications(prev => prev.map(notif => ({
        ...notif,
        is_read: true
      })));

      setSuccessMessage('All notifications marked as read');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      console.error('Error marking all as read:', err);
      alert('Failed to mark all notifications as read');
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm('Delete this notification?')) return;

    try {
      await api.delete(`/notifications/${notificationId}`);
      
      setNotifications(prev => prev.filter(
        notif => notif.notification_id !== notificationId
      ));

      setSuccessMessage('Notification deleted');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      console.error('Error deleting notification:', err);
      alert('Failed to delete notification');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete all notifications? This action cannot be undone.')) return;

    try {
      await api.delete('/notifications/all');
      
      setNotifications([]);
      
      setSuccessMessage('All notifications deleted');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      console.error('Error deleting all notifications:', err);
      alert('Failed to delete all notifications');
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.is_read) {
      handleMarkAsRead(notification.notification_id);
    }

    // Navigate to action URL if available
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const resetFilters = () => {
    setFilters({
      type: 'all',
      status: 'all',
      dateRange: 'all'
    });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Bell className="w-8 h-8 mr-3 text-primary-600" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-3 px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-2">Stay updated with your family's activities</p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={fetchNotifications}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All
            </button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-primary-600">{unreadCount}</p>
            </div>
            <BellOff className="w-8 h-8 text-primary-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Read</p>
              <p className="text-2xl font-bold text-green-600">
                {notifications.length - unreadCount}
              </p>
            </div>
            <CheckCheck className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <NotificationFilter
        filters={filters}
        onFilterChange={setFilters}
        onReset={resetFilters}
      />

      {/* Results Count */}
      <p className="text-sm text-gray-600">
        Showing {filteredNotifications.length} of {notifications.length} notifications
      </p>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Inbox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {notifications.length === 0 
              ? 'No notifications yet' 
              : 'No notifications match your filters'
            }
          </h3>
          <p className="text-gray-600">
            {notifications.length === 0
              ? "You'll see notifications about tasks, rewards, and family activities here"
              : 'Try adjusting your filters to see more notifications'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
          {filteredNotifications.map(notification => (
            <NotificationItem
              key={notification.notification_id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
              onClick={handleNotificationClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
