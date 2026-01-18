import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { assignmentAPI, redemptionAPI, pointsAPI } from '../../services/api';
import { 
  Trophy, 
  Star, 
  CheckCircle, 
  Gift, 
  TrendingUp,
  Calendar,
  Award,
  Target
} from 'lucide-react';

const ChildDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    points: 0,
    activeTasks: 0,
    completedToday: 0,
    pendingRedemptions: 0,
    weeklyProgress: 0,
    streak: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [availableRewards, setAvailableRewards] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch points balance
      const pointsRes = await pointsAPI.getMyBalance();
      const points = pointsRes.data.balance || 0;

      // Fetch active tasks
      const tasksRes = await assignmentAPI.getAll({ status: 'pending' });
      const tasks = tasksRes.data.assignments || [];

      // Fetch pending redemptions
      const redemptionsRes = await redemptionAPI.getAll({ status: 'pending' });
      const redemptions = redemptionsRes.data.redemptions || [];

      // Calculate stats
      const today = new Date().toDateString();
      const completedToday = tasks.filter(
        t => t.completed_at && new Date(t.completed_at).toDateString() === today
      ).length;

      setStats({
        points,
        activeTasks: tasks.filter(t => t.status === 'pending').length,
        completedToday,
        pendingRedemptions: redemptions.length,
        weeklyProgress: calculateWeeklyProgress(tasks),
        streak: 3 // TODO: Calculate from API
      });

      setRecentTasks(tasks.slice(0, 3));
      
      // Fetch available rewards user can afford
      const rewardsRes = await pointsAPI.getAffordableRewards(points);
      setAvailableRewards((rewardsRes.data.rewards || []).slice(0, 3));

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWeeklyProgress = (tasks) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const weekTasks = tasks.filter(t => 
      new Date(t.created_at) >= weekStart
    );
    
    const completed = weekTasks.filter(t => t.status === 'completed').length;
    return weekTasks.length > 0 ? Math.round((completed / weekTasks.length) * 100) : 0;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Champion'}! 👋
          </h1>
          <p className="text-gray-600">Ready to earn some points today?</p>
        </div>

        {/* Points Balance Card - Large & Prominent */}
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-3xl p-8 mb-8 shadow-2xl transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-lg font-medium mb-2">Your Points</p>
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
                {stats.points}
                <Star className="inline-block w-10 h-10 ml-2 text-white" fill="white" />
              </h2>
              <div className="flex items-center gap-4 text-white">
                <div className="flex items-center gap-1">
                  <Trophy className="w-5 h-5" />
                  <span className="text-sm">{stats.streak} day streak</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm">+{stats.completedToday} today</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <Trophy className="w-32 h-32 text-white opacity-30" />
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={CheckCircle}
            label="Active Tasks"
            value={stats.activeTasks}
            color="blue"
          />
          <StatCard
            icon={Target}
            label="Completed Today"
            value={stats.completedToday}
            color="green"
          />
          <StatCard
            icon={Gift}
            label="Pending Rewards"
            value={stats.pendingRedemptions}
            color="purple"
          />
          <StatCard
            icon={Award}
            label="Weekly Progress"
            value={`${stats.weeklyProgress}%`}
            color="orange"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Recent Tasks */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-500" />
                Your Tasks
              </h3>
              <Link 
                to="/child/tasks"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All →
              </Link>
            </div>

            {recentTasks.length > 0 ? (
              <div className="space-y-4">
                {recentTasks.map(task => (
                  <TaskCard key={task.assignment_id} task={task} />
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={CheckCircle}
                message="No active tasks"
                subMessage="Great job! You've completed everything! 🎉"
              />
            )}
          </div>

          {/* Available Rewards */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Gift className="w-6 h-6 text-purple-500" />
                Rewards You Can Get
              </h3>
              <Link 
                to="/child/rewards"
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                View All →
              </Link>
            </div>

            {availableRewards.length > 0 ? (
              <div className="space-y-4">
                {availableRewards.map(reward => (
                  <RewardCard key={reward.reward_id} reward={reward} />
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={Gift}
                message="No affordable rewards yet"
                subMessage="Keep earning points to unlock rewards! 💪"
              />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <QuickActionCard
            to="/child/tasks"
            icon={CheckCircle}
            title="View My Tasks"
            description="See what needs to be done"
            color="blue"
          />
          <QuickActionCard
            to="/child/rewards"
            icon={Gift}
            title="Browse Rewards"
            description="See what you can earn"
            color="purple"
          />
          <QuickActionCard
            to="/child/points"
            icon={TrendingUp}
            title="Points History"
            description="Track your progress"
            color="green"
          />
        </div>
      </div>
    </div>
  );
};

// Sub-components
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 text-white shadow-lg`}>
      <Icon className="w-8 h-8 mb-3 opacity-80" />
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm opacity-90">{label}</p>
    </div>
  );
};

const TaskCard = ({ task }) => {
  const daysUntilDue = Math.ceil(
    (new Date(task.due_date) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const getUrgencyColor = () => {
    if (daysUntilDue < 0) return 'text-red-600 bg-red-50';
    if (daysUntilDue <= 1) return 'text-orange-600 bg-orange-50';
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <Link 
      to={`/child/tasks/${task.assignment_id}`}
      className="block p-4 rounded-xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{task.task_name}</h4>
        <span className="text-yellow-500 font-bold flex items-center gap-1">
          {task.points_reward}
          <Star className="w-4 h-4" fill="currentColor" />
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getUrgencyColor()}`}>
          {daysUntilDue < 0 ? 'Overdue' : daysUntilDue === 0 ? 'Due Today' : `${daysUntilDue} days left`}
        </span>
        {task.requires_photo && (
          <span className="text-xs px-3 py-1 rounded-full bg-purple-50 text-purple-600 font-medium">
            📸 Photo needed
          </span>
        )}
      </div>
    </Link>
  );
};

const RewardCard = ({ reward }) => (
  <Link 
    to={`/child/rewards/${reward.reward_id}`}
    className="block p-4 rounded-xl border-2 border-gray-100 hover:border-purple-300 hover:shadow-md transition-all"
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 mb-1">{reward.reward_name}</h4>
        <p className="text-sm text-gray-600 line-clamp-1">{reward.description}</p>
      </div>
      <div className="ml-4 text-right">
        <div className="text-yellow-500 font-bold flex items-center gap-1">
          {reward.points_required}
          <Star className="w-4 h-4" fill="currentColor" />
        </div>
        <span className="text-xs text-green-600 font-medium">✨ You can afford this!</span>
      </div>
    </div>
  </Link>
);

const QuickActionCard = ({ to, icon: Icon, title, description, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
  };

  return (
    <Link 
      to={to}
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all`}
    >
      <Icon className="w-10 h-10 mb-3" />
      <h4 className="font-bold text-lg mb-1">{title}</h4>
      <p className="text-sm opacity-90">{description}</p>
    </Link>
  );
};

const EmptyState = ({ icon: Icon, message, subMessage }) => (
  <div className="text-center py-8">
    <Icon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
    <p className="text-gray-600 font-medium mb-1">{message}</p>
    <p className="text-gray-400 text-sm">{subMessage}</p>
  </div>
);

export default ChildDashboard;