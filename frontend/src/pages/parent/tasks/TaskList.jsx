import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import {
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Tag,
  Award
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const config = {
    active: { color: 'bg-green-100 text-green-800', label: 'Active' },
    completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed' },
    archived: { color: 'bg-gray-100 text-gray-800', label: 'Archived' }
  };

  const { color, label } = config[status] || config.active;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const config = {
    high: { color: 'text-red-600 bg-red-50', label: 'High' },
    medium: { color: 'text-yellow-600 bg-yellow-50', label: 'Medium' },
    low: { color: 'text-green-600 bg-green-50', label: 'Low' }
  };

  const { color, label } = config[priority] || config.medium;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

const TaskCard = ({ task }) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date();
  
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{task.task_name}</h3>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
        </div>
      </div>

      {/* Task Details */}
      <div className="space-y-2 mb-4">
        {task.category && (
          <div className="flex items-center text-sm text-gray-600">
            <Tag className="w-4 h-4 mr-2" />
            {task.category}
          </div>
        )}
        
        {task.due_date && (
          <div className={`flex items-center text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
            {isOverdue ? <AlertCircle className="w-4 h-4 mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
            Due: {new Date(task.due_date).toLocaleDateString()}
            {isOverdue && <span className="ml-2 font-medium">(Overdue)</span>}
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600">
          <Award className="w-4 h-4 mr-2" />
          {task.points_reward} points
        </div>

        {task.assigned_to_count > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2" />
            Assigned to {task.assigned_to_count} {task.assigned_to_count === 1 ? 'child' : 'children'}
          </div>
        )}
      </div>

      {/* Task Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex space-x-4 text-sm">
          <div>
            <span className="text-gray-600">Completed:</span>
            <span className="ml-1 font-medium text-green-600">{task.completed_count || 0}</span>
          </div>
          <div>
            <span className="text-gray-600">In Progress:</span>
            <span className="ml-1 font-medium text-blue-600">{task.in_progress_count || 0}</span>
          </div>
          <div>
            <span className="text-gray-600">Pending:</span>
            <span className="ml-1 font-medium text-yellow-600">{task.pending_count || 0}</span>
          </div>
        </div>
        
        <Link
          to={`/parent/tasks/edit/${task.task_id}`}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Edit
        </Link>
      </div>
    </div>
  );
};

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      const tasksData = response.data.data || [];
      
      setTasks(tasksData);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(tasksData.map(t => t.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.task_name.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.category?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(task => task.category === categoryFilter);
    }

    setFilteredTasks(filtered);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-2">Create and manage family tasks</p>
        </div>
        <Link
          to="/parent/tasks/create"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Task
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </h2>
          <button
            onClick={resetFilters}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </p>
        {filteredTasks.length > 0 && (
          <Link
            to="/parent/tasks/review"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center"
          >
            <Clock className="w-4 h-4 mr-1" />
            Review Pending Tasks
          </Link>
        )}
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
          </h3>
          <p className="text-gray-600 mb-6">
            {tasks.length === 0 
              ? 'Create your first task to get started'
              : 'Try adjusting your filters to see more tasks'
            }
          </p>
          {tasks.length === 0 && (
            <Link
              to="/parent/tasks/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Task
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <TaskCard key={task.task_id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
