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
  Users,
  Tag,
  Award,
  Edit,
  Trash2,
  Eye,
  XCircle,
  RefreshCw,
  UserCheck,
  UserX
} from 'lucide-react';

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================
const StatusBadge = ({ status }) => {
  const config = {
    active: { 
      color: 'bg-green-100 text-green-800 border-green-200', 
      label: 'Active',
      icon: CheckCircle 
    },
    completed: { 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      label: 'Completed',
      icon: CheckCircle 
    },
    archived: { 
      color: 'bg-gray-100 text-gray-800 border-gray-200', 
      label: 'Archived',
      icon: XCircle 
    }
  };

  const { color, label, icon: Icon } = config[status] || config.active;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
};

// ============================================================================
// PRIORITY BADGE COMPONENT
// ============================================================================
const PriorityBadge = ({ priority }) => {
  const config = {
    high: { 
      color: 'text-red-700 bg-red-50 border-red-200', 
      label: 'High Priority',
      icon: AlertCircle 
    },
    urgent: { 
      color: 'text-red-800 bg-red-100 border-red-300', 
      label: 'Urgent',
      icon: AlertCircle 
    },
    medium: { 
      color: 'text-yellow-700 bg-yellow-50 border-yellow-200', 
      label: 'Medium',
      icon: Clock 
    },
    low: { 
      color: 'text-green-700 bg-green-50 border-green-200', 
      label: 'Low Priority',
      icon: CheckCircle 
    }
  };

  const { color, label, icon: Icon } = config[priority] || config.medium;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
};

// ============================================================================
// ASSIGNMENT BADGE COMPONENT - NEW!
// ============================================================================
const AssignmentBadge = ({ assignedChildren, totalAssigned }) => {
  if (!assignedChildren || assignedChildren.length === 0) {
    return (
      <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
        <UserX className="w-4 h-4 mr-2 flex-shrink-0" />
        <span className="font-medium">Unassigned</span>
      </div>
    );
  }

  return (
    <div className="flex items-center text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
      <UserCheck className="w-4 h-4 mr-2 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="font-medium">Assigned to: </span>
        <span className="truncate" title={assignedChildren.join(', ')}>
          {assignedChildren.length <= 2 
            ? assignedChildren.join(', ')
            : `${assignedChildren[0]}, ${assignedChildren[1]}, +${assignedChildren.length - 2} more`
          }
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// TASK CARD COMPONENT
// ============================================================================
const TaskCard = ({ task, onDelete, onRefresh }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Fetch assignments for this task
  useEffect(() => {
    fetchAssignments();
  }, [task.task_id]);

  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const response = await api.get(`/tasks/${task.task_id}/assignments`);
      
      // Handle different response structures
      const assignmentsData = response.data.data?.assignments || 
                             response.data.data || 
                             response.data.assignments || 
                             [];
      
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      // Don't show error to user, just keep empty assignments
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  // Extract assigned children names
  const assignedChildren = assignments
    .map(assignment => assignment.child_name || assignment.assigned_to_name || assignment.full_name)
    .filter(Boolean);

  // Check if task is overdue
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status === 'active';
  
  // Parse assignment counts from task data (if available)
  const totalAssigned = task.assigned_to_count || assignments.length || 0;
  const completedCount = task.completed_count || 0;
  const inProgressCount = task.in_progress_count || 0;
  const pendingCount = task.pending_count || 0;

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/tasks/${task.task_id}`);
      setShowDeleteModal(false);
      onDelete(task.task_id);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(error.response?.data?.message || 'Failed to delete task');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 p-6 border border-gray-100">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate" title={task.title || task.task_name}>
              {task.title || task.task_name}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2" title={task.description}>
            {task.description}
          </p>
        )}

        {/* ✅ NEW: Assignment Status */}
        <div className="mb-4">
          {loadingAssignments ? (
            <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              <span>Loading assignments...</span>
            </div>
          ) : (
            <AssignmentBadge 
              assignedChildren={assignedChildren} 
              totalAssigned={totalAssigned}
            />
          )}
        </div>

        {/* Task Details Grid */}
        <div className="space-y-2.5 mb-4 pb-4 border-b border-gray-100">
          {/* Category */}
          {task.category && (
            <div className="flex items-center text-sm text-gray-600">
              <Tag className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
              <span className="truncate">{task.category}</span>
            </div>
          )}
          
          {/* Due Date / Deadline */}
          {(task.deadline || task.due_date) && (
            <div className={`flex items-center text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
              {isOverdue ? (
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              ) : (
                <Calendar className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
              )}
              <span>
                Due: {new Date(task.deadline || task.due_date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
              {isOverdue && <span className="ml-2 text-xs">(Overdue!)</span>}
            </div>
          )}

          {/* Points Reward */}
          <div className="flex items-center text-sm text-gray-600">
            <Award className="w-4 h-4 mr-2 flex-shrink-0 text-primary-500" />
            <span className="font-medium text-primary-600">{task.points_reward}</span>
            <span className="ml-1">points reward</span>
          </div>

          {/* Photo Required */}
          {task.photo_required && (
            <div className="flex items-center text-sm text-purple-600">
              <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="font-medium">Photo verification required</span>
            </div>
          )}
        </div>

        {/* Task Statistics */}
        {totalAssigned > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 bg-green-50 rounded-lg border border-green-100">
              <p className="text-xl font-bold text-green-600">{completedCount}</p>
              <p className="text-xs text-green-700 font-medium">Completed</p>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xl font-bold text-blue-600">{inProgressCount}</p>
              <p className="text-xs text-blue-700 font-medium">In Progress</p>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded-lg border border-yellow-100">
              <p className="text-xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-xs text-yellow-700 font-medium">Pending</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Assign Button (if unassigned) */}
          {assignedChildren.length === 0 && (
            <Link
              to={`/parent/tasks/${task.task_id}/assign`}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <Users className="w-4 h-4 mr-2" />
              Assign
            </Link>
          )}
          
          <Link
            to={`/parent/tasks/edit/${task.task_id}`}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Link>
          <Link
            to={`/parent/tasks/${task.task_id}`}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-primary-300 rounded-md shadow-sm text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Created Date */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Created {new Date(task.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Task</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>"{task.title || task.task_name}"</strong>?
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This will also delete:
              </p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1 ml-4">
                <li>• All assignments for this task</li>
                <li>• All submissions and photos</li>
                <li>• Task history and statistics</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? (
                  <span className="flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  'Delete Task'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ============================================================================
// MAIN TASK LIST COMPONENT
// ============================================================================
export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all'); // ✅ NEW FILTER
  const [categories, setCategories] = useState([]);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Apply filters when tasks or filter values change
  useEffect(() => {
    applyFilters();
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter, assignmentFilter]);

  // ============================================================================
  // FETCH TASKS FROM API
  // ============================================================================
  const fetchTasks = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      console.log('📤 Fetching tasks...');
      const response = await api.get('/tasks');
      
      // ✅ Handle different possible response structures
      const tasksData = response.data.data?.tasks || response.data.data || response.data.tasks || [];
      
      console.log('✅ Tasks loaded:', tasksData.length);
      setTasks(tasksData);
      
      // Extract unique categories for filter dropdown
      const uniqueCategories = [...new Set(
        tasksData
          .map(t => t.category)
          .filter(Boolean)
      )].sort();
      
      setCategories(uniqueCategories);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching tasks:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load tasks';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================================
  // REFRESH TASKS
  // ============================================================================
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTasks(false);
  };

  // ============================================================================
  // APPLY FILTERS
  // ============================================================================
  const applyFilters = () => {
    let filtered = [...tasks];

    // Search filter (task name, description, category)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(query) ||
        task.task_name?.toLowerCase().includes(query) ||
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

    // ✅ NEW: Assignment filter
    if (assignmentFilter === 'assigned') {
      filtered = filtered.filter(task => (task.assigned_to_count || 0) > 0);
    } else if (assignmentFilter === 'unassigned') {
      filtered = filtered.filter(task => (task.assigned_to_count || 0) === 0);
    }

    setFilteredTasks(filtered);
  };

  // ============================================================================
  // RESET ALL FILTERS
  // ============================================================================
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
    setAssignmentFilter('all');
  };

  // ============================================================================
  // HANDLE TASK DELETION
  // ============================================================================
  const handleTaskDeleted = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(t => t.task_id !== taskId));
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  // Statistics
  const activeTasks = tasks.filter(t => t.status === 'active').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalPoints = tasks.reduce((sum, t) => sum + (parseInt(t.points_reward) || 0), 0);
  const assignedTasks = tasks.filter(t => (t.assigned_to_count || 0) > 0).length;
  const unassignedTasks = tasks.filter(t => (t.assigned_to_count || 0) === 0).length;

  const activeFilterCount = [searchQuery, statusFilter !== 'all', priorityFilter !== 'all', categoryFilter !== 'all', assignmentFilter !== 'all'].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-2">Create and manage tasks for your family</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/parent/tasks/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Task
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <div className="flex-1">
            <p>{error}</p>
            <button
              onClick={handleRefresh}
              className="text-sm underline mt-1 hover:text-red-900"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-600">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{tasks.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeTasks}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{completedTasks}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-600">Assigned</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">{assignedTasks}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-600">Unassigned</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">{unassignedTasks}</p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                {activeFilterCount} active
              </span>
            )}
          </h2>
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Reset All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2 lg:col-span-2">
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
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* ✅ NEW: Assignment Filter */}
          <div>
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Tasks</option>
              <option value="assigned">Assigned Only</option>
              <option value="unassigned">Unassigned Only</option>
            </select>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="md:col-span-2 lg:col-span-1">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium">{filteredTasks.length}</span> of <span className="font-medium">{tasks.length}</span> tasks
          {activeFilterCount > 0 && (
            <span className="text-primary-600 ml-1">(filtered)</span>
          )}
        </p>
      </div>

      {/* Tasks Grid or Empty State */}
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
          {tasks.length === 0 ? (
            <Link
              to="/parent/tasks/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Task
            </Link>
          ) : (
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <XCircle className="w-5 h-5 mr-2" />
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <TaskCard 
              key={task.task_id} 
              task={task}
              onDelete={handleTaskDeleted}
              onRefresh={handleRefresh}
            />
          ))}
        </div>
      )}

      {/* Tips Section */}
      {tasks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 Task Management Tips</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Assign tasks immediately after creation for better tracking</li>
            <li>• Use priorities to help children know which tasks to do first</li>
            <li>• Set realistic deadlines to avoid overwhelming children</li>
            <li>• Review pending submissions regularly to maintain motivation</li>
            <li>• Use categories to organize tasks by type or location</li>
          </ul>
        </div>
      )}
    </div>
  );
}
