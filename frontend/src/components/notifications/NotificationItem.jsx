import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Gift, 
  Users, 
  Bell,
  Trash2,
  Eye,
  Clock
} from 'lucide-react';

/**
 * NotificationItem Component
 * Displays a single notification with icon, message, and actions
 * 
 * @param {Object} props
 * @param {Object} props.notification - Notification object
 * @param {Function} props.onMarkAsRead - Callback when marking as read
 * @param {Function} props.onDelete - Callback when deleting
 * @param {Function} props.onClick - Callback when clicking notification
 */
export default function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete,
  onClick 
}) {
  const getNotificationIcon = (type) => {
    const iconMap = {
      'success': CheckCircle,
      'info': Info,
      'warning': AlertCircle,
      'error': AlertCircle,
      'task_assigned': CheckCircle,
      'task_completed': CheckCircle,
      'task_approved': CheckCircle,
      'task_rejected': AlertCircle,
      'reward_redeemed': Gift,
      'reward_approved': Gift,
      'reward_denied': AlertCircle,
      'family_invite': Users,
      'points_earned': CheckCircle,
      'system': Bell
    };

    return iconMap[type] || Bell;
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      'success': 'text-green-500 bg-green-50',
      'info': 'text-blue-500 bg-blue-50',
      'warning': 'text-yellow-500 bg-yellow-50',
      'error': 'text-red-500 bg-red-50',
      'task_assigned': 'text-blue-500 bg-blue-50',
      'task_completed': 'text-green-500 bg-green-50',
      'task_approved': 'text-green-500 bg-green-50',
      'task_rejected': 'text-red-500 bg-red-50',
      'reward_redeemed': 'text-purple-500 bg-purple-50',
      'reward_approved': 'text-green-500 bg-green-50',
      'reward_denied': 'text-red-500 bg-red-50',
      'family_invite': 'text-blue-500 bg-blue-50',
      'points_earned': 'text-yellow-500 bg-yellow-50',
      'system': 'text-gray-500 bg-gray-50'
    };

    return colorMap[type] || 'text-gray-500 bg-gray-50';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
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

  const Icon = getNotificationIcon(notification.type);
  const colorClasses = getNotificationColor(notification.type);
  const isUnread = !notification.is_read;

  return (
    <div
      className={`p-4 border-l-4 hover:bg-gray-50 transition-colors cursor-pointer ${
        isUnread 
          ? 'bg-blue-50 border-blue-500' 
          : 'bg-white border-transparent'
      }`}
      onClick={() => onClick && onClick(notification)}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colorClasses} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm ${isUnread ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
            </div>

            {/* Unread Indicator */}
            {isUnread && (
              <div className="ml-2 flex-shrink-0">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            )}
          </div>

          {/* Timestamp and Actions */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              {formatTime(notification.created_at)}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {isUnread && onMarkAsRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.notification_id);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Mark as read
                </button>
              )}

              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.notification_id);
                  }}
                  className="text-red-600 hover:text-red-800 text-xs font-medium flex items-center"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Optional Action Link */}
          {notification.action_url && (
            <div className="mt-2">
              <a
                href={notification.action_url}
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View Details →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Example Usage:
 * 
 * const notification = {
 *   notification_id: 1,
 *   type: 'task_completed',
 *   title: 'Task Completed',
 *   message: 'Sarah completed "Clean your room"',
 *   is_read: false,
 *   created_at: '2024-01-18T10:30:00Z',
 *   action_url: '/parent/tasks/review'
 * };
 * 
 * <NotificationItem
 *   notification={notification}
 *   onMarkAsRead={(id) => console.log('Mark as read:', id)}
 *   onDelete={(id) => console.log('Delete:', id)}
 *   onClick={(notif) => console.log('Clicked:', notif)}
 * />
 */
