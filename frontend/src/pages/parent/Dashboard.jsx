import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  CheckSquare,
  Gift,
  AlertCircle,
  TrendingUp,
  Calendar,
  Award,
  Clock,
  Plus,
  FileText // ✅ Added for Reports
} from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, subtitle, color, link }) => (
  <Link
    to={link}
    className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-3xl font-bold ${color} mt-2`}>{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`${color} bg-opacity-10 p-3 rounded-full`}>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  </Link>
);

const QuickAction = ({ icon: Icon, title, description, link, color }) => (
  <Link
    to={link}
    className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow flex items-start space-x-4"
  >
    <div className={`${color} bg-opacity-10 p-3 rounded-lg`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
  </Link>
);

const RecentActivity = ({ activities, loading }) => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
    </div>
    <div className="p-6">
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : activities.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No recent activity</p>
      ) : (
        <div className="space-y-4">
          {activities.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
              <div className="flex-shrink-0 mt-1">
                {activity.type === 'task_completed' && <CheckSquare className="w-5 h-5 text-green-500" />}
                {activity.type === 'task_created' && <Calendar className="w-5 h-5 text-blue-500" />}
                {activity.type === 'reward_redeemed' && <Gift className="w-5 h-5 text-purple-500" />}
                {activity.type === 'task_overdue' && <AlertCircle className="w-5 h-5 text-red-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default function ParentDashboard() {
  const [stats, setStats] = useState({
    familyMembers: 0,
    activeTasks: 0,
    pendingReviews: 0,
    activeRewards: 0,
    totalPoints: 0,
    completionRate: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // ✅ FIX: First get user's family, then get members
      const familiesRes = await api.get('/families');
      const families = familiesRes.data.data?.families || familiesRes.data.data || [];
      
      let familyMembers = [];
      let familyId = null;
      
      if (families.length > 0) {
        familyId = families[0].family_id;
        
        // Now get members for this family
        const membersRes = await api.get(`/families/${familyId}/members`);
        familyMembers = membersRes.data.data?.members || membersRes.data.data || [];
      }
      
      // Fetch tasks (handle different response structures)
      const tasksRes = await api.get('/tasks');
      const tasks = tasksRes.data.data?.tasks || tasksRes.data.data || [];
      
      // Fetch pending reviews
      let pendingReviews = [];
      try {
        const reviewsRes = await api.get('/assignments/pending');
        pendingReviews = reviewsRes.data.data?.assignments || reviewsRes.data.data || [];
      } catch (err) {
        console.warn('Could not fetch pending reviews:', err.message);
      }
      
      // Fetch rewards
      let rewards = [];
      try {
        const rewardsRes = await api.get('/rewards');
        rewards = rewardsRes.data.data?.rewards || rewardsRes.data.data || [];
      } catch (err) {
        console.warn('Could not fetch rewards:', err.message);
      }
      
      // Fetch recent notifications for activity
      let notifications = [];
      try {
        const notificationsRes = await api.get('/notifications?limit=10');
        notifications = notificationsRes.data.data?.notifications || notificationsRes.data.data || [];
      } catch (err) {
        console.warn('Could not fetch notifications:', err.message);
      }

      // Calculate stats
      const activeTasks = tasks.filter(t => t.status === 'active').length;
      const activeRewards = rewards.filter(r => r.status === 'available' || r.is_active).length;
      
      // Calculate total points from all tasks
      const totalPoints = tasks.reduce((sum, task) => {
        return sum + (parseInt(task.points_reward) || 0);
      }, 0);

      // Calculate completion rate
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const completionRate = tasks.length > 0 
        ? Math.round((completedTasks / tasks.length) * 100) 
        : 0;

      setStats({
        familyMembers: familyMembers.length,
        activeTasks,
        pendingReviews: Array.isArray(pendingReviews) ? pendingReviews.length : 0,
        activeRewards,
        totalPoints,
        completionRate
      });

      // Format activities from notifications
      const formattedActivities = notifications.map(notif => ({
        type: notif.type || 'notification',
        title: notif.title || 'Notification',
        description: notif.message || '',
        time: notif.created_at 
          ? new Date(notif.created_at).toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'Recently'
      }));
      
      setActivities(formattedActivities);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Some features may not be available.');
      
      // Set empty stats to prevent app crash
      setStats({
        familyMembers: 0,
        activeTasks: 0,
        pendingReviews: 0,
        activeRewards: 0,
        totalPoints: 0,
        completionRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your family's tasks and rewards</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/parent/tasks/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Task
          </Link>
          <Link
            to="/parent/rewards/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Reward
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Family Members"
          value={stats.familyMembers}
          color="text-blue-600"
          link="/parent/family"
        />
        <StatCard
          icon={CheckSquare}
          title="Active Tasks"
          value={stats.activeTasks}
          subtitle={stats.pendingReviews > 0 ? `${stats.pendingReviews} pending review` : 'All caught up'}
          color="text-green-600"
          link="/parent/tasks"
        />
        <StatCard
          icon={Gift}
          title="Active Rewards"
          value={stats.activeRewards}
          color="text-purple-600"
          link="/parent/rewards"
        />
        <StatCard
          icon={Award}
          title="Total Points"
          value={stats.totalPoints}
          subtitle={`${stats.completionRate}% completion rate`}
          color="text-yellow-600"
          link="/parent/tasks"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            icon={CheckSquare}
            title="Create New Task"
            description="Assign a new task to your children"
            link="/parent/tasks/create"
            color="text-green-600"
          />
          <QuickAction
            icon={Gift}
            title="Create Reward"
            description="Add a new reward to the catalog"
            link="/parent/rewards/create"
            color="text-purple-600"
          />
          <QuickAction
            icon={Clock}
            title="Review Submissions"
            description={stats.pendingReviews > 0 
              ? `${stats.pendingReviews} tasks waiting for review`
              : 'No pending reviews'}
            link="/parent/tasks/review"
            color="text-orange-600"
          />
          <QuickAction
            icon={Users}
            title="Add Family Member"
            description="Invite spouse or add a child"
            link="/parent/family/add"
            color="text-blue-600"
          />
          {/* ✅ UPDATED: Reports Quick Action with FileText icon */}
          <QuickAction
            icon={FileText}
            title="Export Reports"
            description="Generate PDF reports and analytics"
            link="/parent/reports"
            color="text-indigo-600"
          />
          <QuickAction
            icon={AlertCircle}
            title="Reward Requests"
            description="Review pending redemptions"
            link="/parent/rewards/redemptions"
            color="text-red-600"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={activities} loading={false} />

      {/* Tips Section */}
      {stats.activeTasks === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">👋 Getting Started</h3>
          <p className="text-sm text-blue-800 mb-3">
            You don't have any active tasks yet. Here's how to get started:
          </p>
          <ul className="text-sm text-blue-700 space-y-2 ml-4">
            <li>• <strong>Create a task</strong> - Click the "Create Task" button above</li>
            <li>• <strong>Add children</strong> - Add family members to assign tasks to</li>
            <li>• <strong>Create rewards</strong> - Set up rewards that children can earn</li>
            <li>• <strong>Export reports</strong> - Generate PDF reports to track progress</li>
          </ul>
        </div>
      )}
    </div>
  );
}