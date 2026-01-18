import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assignmentAPI } from '../../../services/api';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star,
  Calendar,
  TrendingUp,
  Award,
  Filter,
  ChevronDown
} from 'lucide-react';

const TaskHistory = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, statusFilter, dateFilter]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await assignmentAPI.getAll({ 
        status: ['completed', 'rejected'] 
      });
      setTasks(response.data.assignments || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      filtered = filtered.filter(task => 
        new Date(task.completed_at).toDateString() === now.toDateString()
      );
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      filtered = filtered.filter(task => 
        new Date(task.completed_at) >= weekAgo
      );
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      filtered = filtered.filter(task => 
        new Date(task.completed_at) >= monthAgo
      );
    }

    // Sort by completion date (newest first)
    filtered.sort((a, b) => 
      new Date(b.completed_at) - new Date(a.completed_at)
    );

    setFilteredTasks(filtered);
  };

  const calculateStats = () => {
    const completed = tasks.filter(t => t.status === 'completed');
    const rejected = tasks.filter(t => t.status === 'rejected');
    const totalPoints = completed.reduce((sum, task) => sum + (task.points_reward || 0), 0);
    const successRate = tasks.length > 0 
      ? Math.round((completed.length / tasks.length) * 100) 
      : 0;

    return {
      total: tasks.length,
      completed: completed.length,
      rejected: rejected.length,
      totalPoints,
      successRate
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Task History 📚</h1>
          <p className="text-gray-600">Review your completed tasks and feedback</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Award}
            label="Total Tasks"
            value={stats.total}
            color="blue"
          />
          <StatCard
            icon={CheckCircle}
            label="Completed"
            value={stats.completed}
            color="green"
          />
          <StatCard
            icon={Star}
            label="Points Earned"
            value={stats.totalPoints}
            color="yellow"
          />
          <StatCard
            icon={TrendingUp}
            label="Success Rate"
            value={`${stats.successRate}%`}
            color="purple"
          />
        </div>

        {/* Motivational Message */}
        {stats.successRate >= 80 && stats.total >= 5 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl text-white">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🏆</div>
              <div>
                <p className="font-bold text-lg">Amazing Work!</p>
                <p className="text-sm opacity-90">
                  You have a {stats.successRate}% success rate! Keep it up!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-between w-full md:w-auto gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Period
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Task List */}
        {filteredTasks.length > 0 ? (
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <HistoryCard key={task.assignment_id} task={task} />
            ))}
          </div>
        ) : (
          <EmptyState 
            statusFilter={statusFilter}
            dateFilter={dateFilter}
          />
        )}
      </div>
    </div>
  );
};

// Sub-components
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-orange-500',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 text-white`}>
      <Icon className="w-6 h-6 mb-2 opacity-80" />
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm opacity-90">{label}</p>
    </div>
  );
};

const HistoryCard = ({ task }) => {
  const isCompleted = task.status === 'completed';
  const isRejected = task.status === 'rejected';

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
      isCompleted ? 'border-green-500' : 'border-red-500'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{task.task_name}</h3>
            {isCompleted ? (
              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Completed
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                <XCircle className="w-4 h-4" />
                Needs Improvement
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm">{task.description}</p>
        </div>
        
        {isCompleted && (
          <div className="ml-4 flex items-center gap-1 text-yellow-500 font-bold text-xl">
            +{task.points_reward}
            <Star className="w-5 h-5" fill="currentColor" />
          </div>
        )}
      </div>

      {/* Completion Info */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          Completed: {new Date(task.completed_at).toLocaleDateString()}
        </span>
        {task.approved_at && (
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Reviewed: {new Date(task.approved_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Submission Notes */}
      {task.submission_notes && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Your notes: </span>
            {task.submission_notes}
          </p>
        </div>
      )}

      {/* Parent Feedback */}
      {task.feedback && (
        <div className={`p-4 rounded-lg ${
          isCompleted ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start gap-2">
            <div className={`text-lg ${isCompleted ? 'text-green-600' : 'text-red-600'}`}>
              💬
            </div>
            <div className="flex-1">
              <p className={`font-medium mb-1 ${
                isCompleted ? 'text-green-900' : 'text-red-900'
              }`}>
                Parent Feedback:
              </p>
              <p className={`text-sm ${
                isCompleted ? 'text-green-800' : 'text-red-800'
              }`}>
                {task.feedback}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resubmit Button for Rejected Tasks */}
      {isRejected && (
        <Link
          to={`/child/tasks/${task.assignment_id}/submit`}
          className="mt-4 block text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Resubmit Task
        </Link>
      )}
    </div>
  );
};

const EmptyState = ({ statusFilter, dateFilter }) => {
  let message = 'No tasks in history yet';
  let subMessage = 'Start completing tasks to see them here!';

  if (statusFilter === 'completed') {
    message = 'No completed tasks yet';
    subMessage = 'Keep working on your tasks!';
  } else if (statusFilter === 'rejected') {
    message = 'No rejected tasks';
    subMessage = "Great! You're doing everything right! 🎉";
  } else if (dateFilter !== 'all') {
    message = 'No tasks in this time period';
    subMessage = 'Try selecting a different time range';
  }

  return (
    <div className="text-center py-16 bg-white rounded-xl">
      <Award className="w-20 h-20 mx-auto text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{message}</h3>
      <p className="text-gray-500">{subMessage}</p>
    </div>
  );
};

export default TaskHistory;
