import { useState, useEffect } from 'react';
import { 
  UserPlus, 
  UserMinus, 
  CheckSquare, 
  Gift, 
  Users, 
  AlertCircle,
  Clock 
} from 'lucide-react';

/**
 * ActivityLog Component
 * Displays recent system activity in a timeline format
 * 
 * @param {Object} props
 * @param {Array} props.activities - Array of activity objects
 * @param {boolean} props.loading - Loading state
 * @param {number} props.limit - Number of activities to show (default: 10)
 * @param {boolean} props.showViewAll - Show "View All" button
 * @param {Function} props.onViewAll - Callback for "View All" button
 */
export default function ActivityLog({ 
  activities = [], 
  loading = false,
  limit = 10,
  showViewAll = false,
  onViewAll
}) {
  const [displayActivities, setDisplayActivities] = useState([]);

  useEffect(() => {
    setDisplayActivities(activities.slice(0, limit));
  }, [activities, limit]);

  const getActivityIcon = (type) => {
    const iconMap = {
      'user_registered': UserPlus,
      'user_deleted': UserMinus,
      'task_created': CheckSquare,
      'task_completed': CheckSquare,
      'reward_redeemed': Gift,
      'family_created': Users,
      'error': AlertCircle
    };

    const Icon = iconMap[type] || Clock;
    return Icon;
  };

  const getActivityColor = (type) => {
    const colorMap = {
      'user_registered': 'text-green-500 bg-green-50',
      'user_deleted': 'text-red-500 bg-red-50',
      'task_created': 'text-blue-500 bg-blue-50',
      'task_completed': 'text-green-500 bg-green-50',
      'reward_redeemed': 'text-purple-500 bg-purple-50',
      'family_created': 'text-blue-500 bg-blue-50',
      'error': 'text-red-500 bg-red-50'
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading activity...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          {showViewAll && onViewAll && (
            <button
              onClick={onViewAll}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View All
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {displayActivities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {displayActivities.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                const colorClasses = getActivityColor(activity.type);
                const isLast = index === displayActivities.length - 1;

                return (
                  <li key={activity.id || index}>
                    <div className="relative pb-8">
                      {!isLast && (
                        <span
                          className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex items-start space-x-3">
                        <div className="relative">
                          <div className={`h-10 w-10 rounded-full ${colorClasses} flex items-center justify-center ring-4 ring-white`}>
                            <Icon className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {activity.title || activity.description}
                            </p>
                            {activity.details && (
                              <p className="mt-0.5 text-sm text-gray-500">
                                {activity.details}
                              </p>
                            )}
                          </div>
                          <div className="mt-1 flex items-center space-x-2">
                            <p className="text-xs text-gray-500">
                              {formatTime(activity.timestamp || activity.created_at)}
                            </p>
                            {activity.user && (
                              <>
                                <span className="text-gray-400">•</span>
                                <p className="text-xs text-gray-500">
                                  {activity.user}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example Usage:
 * 
 * const activities = [
 *   {
 *     id: 1,
 *     type: 'user_registered',
 *     title: 'New user registered',
 *     details: 'John Doe (john@example.com)',
 *     user: 'System',
 *     timestamp: '2024-01-18T10:30:00Z'
 *   },
 *   {
 *     id: 2,
 *     type: 'task_completed',
 *     title: 'Task completed',
 *     details: '"Clean your room" by Sarah',
 *     user: 'Parent: Jane',
 *     timestamp: '2024-01-18T09:15:00Z'
 *   }
 * ];
 * 
 * <ActivityLog
 *   activities={activities}
 *   loading={false}
 *   limit={10}
 *   showViewAll={true}
 *   onViewAll={() => navigate('/admin/activity')}
 * />
 */
