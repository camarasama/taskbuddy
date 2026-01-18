import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assignmentAPI } from '../../../services/api';
import { 
  Search, 
  Filter, 
  Calendar, 
  Star, 
  Camera,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown
} from 'lucide-react';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('due_date');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, searchTerm, statusFilter, sortBy]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await assignmentAPI.getAll();
      setTasks(response.data.assignments || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...tasks];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'overdue') {
        filtered = filtered.filter(task => 
          new Date(task.due_date) < new Date() && task.status === 'pending'
        );
      } else {
        filtered = filtered.filter(task => task.status === statusFilter);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'due_date':
          return new Date(a.due_date) - new Date(b.due_date);
        case 'points':
          return b.points_reward - a.points_reward;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  };

  const getStatusCounts = () => {
    const now = new Date();
    return {
      all: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      submitted: tasks.filter(t => t.status === 'submitted').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => new Date(t.due_date) < now && t.status === 'pending').length
    };
  };

  const counts = getStatusCounts();

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tasks 📋</h1>
          <p className="text-gray-600">
            Complete your tasks to earn points and rewards!
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="due_date">Due Date</option>
                  <option value="points">Points (High to Low)</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <StatusTab
            label="All"
            count={counts.all}
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
            color="gray"
          />
          <StatusTab
            label="To Do"
            count={counts.pending}
            active={statusFilter === 'pending'}
            onClick={() => setStatusFilter('pending')}
            color="blue"
          />
          <StatusTab
            label="Submitted"
            count={counts.submitted}
            active={statusFilter === 'submitted'}
            onClick={() => setStatusFilter('submitted')}
            color="yellow"
          />
          <StatusTab
            label="Completed"
            count={counts.completed}
            active={statusFilter === 'completed'}
            onClick={() => setStatusFilter('completed')}
            color="green"
          />
          <StatusTab
            label="Overdue"
            count={counts.overdue}
            active={statusFilter === 'overdue'}
            onClick={() => setStatusFilter('overdue')}
            color="red"
          />
        </div>

        {/* Task List */}
        {filteredTasks.length > 0 ? (
          <div className="grid gap-4">
            {filteredTasks.map(task => (
              <TaskCard key={task.assignment_id} task={task} />
            ))}
          </div>
        ) : (
          <EmptyState 
            searchTerm={searchTerm}
            statusFilter={statusFilter}
          />
        )}
      </div>
    </div>
  );
};

// Sub-components
const StatusTab = ({ label, count, active, onClick, color }) => {
  const colorClasses = {
    gray: active ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    blue: active ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    yellow: active ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    green: active ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200',
    red: active ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${colorClasses[color]}`}
    >
      {label} {count > 0 && <span className="ml-1">({count})</span>}
    </button>
  );
};

const TaskCard = ({ task }) => {
  const daysUntilDue = Math.ceil(
    (new Date(task.due_date) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const getStatusBadge = () => {
    if (task.status === 'completed') {
      return { text: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle };
    }
    if (task.status === 'submitted') {
      return { text: 'Waiting for Review', color: 'bg-yellow-100 text-yellow-700', icon: Clock };
    }
    if (daysUntilDue < 0) {
      return { text: 'Overdue', color: 'bg-red-100 text-red-700', icon: AlertCircle };
    }
    if (daysUntilDue === 0) {
      return { text: 'Due Today', color: 'bg-orange-100 text-orange-700', icon: Clock };
    }
    return { text: `${daysUntilDue} days left`, color: 'bg-blue-100 text-blue-700', icon: Calendar };
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  return (
    <Link 
      to={`/child/tasks/${task.assignment_id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-l-4 border-blue-500"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{task.task_name}</h3>
            {task.priority && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor()} bg-opacity-10`}>
                {task.priority.toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-gray-600 line-clamp-2">{task.description}</p>
        </div>
        
        <div className="ml-4 flex flex-col items-end gap-2">
          <div className="flex items-center gap-1 text-yellow-500 font-bold text-xl">
            {task.points_reward}
            <Star className="w-5 h-5" fill="currentColor" />
          </div>
          {task.requires_photo && (
            <div className="flex items-center gap-1 text-purple-600 text-xs">
              <Camera className="w-4 h-4" />
              Photo required
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium ${status.color}`}>
          <StatusIcon className="w-3 h-3" />
          {status.text}
        </span>
        
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Due: {new Date(task.due_date).toLocaleDateString()}
        </span>

        {task.category && (
          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
            {task.category}
          </span>
        )}
      </div>
    </Link>
  );
};

const EmptyState = ({ searchTerm, statusFilter }) => {
  let message = 'No tasks found';
  let subMessage = 'Check back later for new tasks!';

  if (searchTerm) {
    message = 'No tasks match your search';
    subMessage = 'Try different keywords';
  } else if (statusFilter === 'completed') {
    message = 'No completed tasks yet';
    subMessage = 'Start completing tasks to see them here!';
  } else if (statusFilter === 'overdue') {
    message = 'No overdue tasks';
    subMessage = 'Great job staying on top of everything! 🎉';
  }

  return (
    <div className="text-center py-16 bg-white rounded-xl">
      <CheckCircle className="w-20 h-20 mx-auto text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{message}</h3>
      <p className="text-gray-500">{subMessage}</p>
    </div>
  );
};

export default MyTasks;