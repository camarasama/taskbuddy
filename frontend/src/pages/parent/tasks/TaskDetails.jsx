import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../../services/api';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Calendar,
  Award,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  Camera,
  User,
  FileText,
  RefreshCw,
  UserPlus
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const config = {
    active: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Active', icon: CheckCircle },
    completed: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Completed', icon: CheckCircle },
    archived: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Archived', icon: AlertCircle }
  };
  
  const { color, label, icon: Icon } = config[status] || config.active;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${color}`}>
      <Icon className="w-4 h-4 mr-1" />
      {label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const config = {
    urgent: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Urgent' },
    high: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'High' },
    medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Medium' },
    low: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Low' }
  };
  
  const { color, label } = config[priority] || config.medium;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${color}`}>
      {label}
    </span>
  );
};

const AssignmentCard = ({ assignment }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-50 border-yellow-200 text-yellow-800', label: 'Pending', icon: Clock },
    in_progress: { color: 'bg-blue-50 border-blue-200 text-blue-800', label: 'In Progress', icon: RefreshCw },
    submitted: { color: 'bg-purple-50 border-purple-200 text-purple-800', label: 'Submitted', icon: CheckCircle },
    approved: { color: 'bg-green-50 border-green-200 text-green-800', label: 'Approved', icon: CheckCircle },
    rejected: { color: 'bg-red-50 border-red-200 text-red-800', label: 'Rejected', icon: AlertCircle }
  };
  
  const status = statusConfig[assignment.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  
  return (
    <div className={`p-4 rounded-lg border-2 ${status.color}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span className="font-medium">{assignment.child_name || assignment.assigned_to_name || 'Unknown'}</span>
        </div>
        <div className="flex items-center space-x-1 text-sm">
          <StatusIcon className="w-4 h-4" />
          <span>{status.label}</span>
        </div>
      </div>
      
      {assignment.assigned_at && (
        <p className="text-sm text-gray-600">
          Assigned: {new Date(assignment.assigned_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
      )}
      
      {assignment.submitted_at && (
        <p className="text-sm text-gray-600">
          Submitted: {new Date(assignment.submitted_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      )}
      
      {assignment.submission_notes && (
        <p className="text-sm text-gray-700 mt-2 italic">
          "{assignment.submission_notes}"
        </p>
      )}
    </div>
  );
};

export default function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  const [task, setTask] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📤 Fetching task details:', taskId);
      
      // Fetch task details
      const taskRes = await api.get(`/tasks/${taskId}`);
      const taskData = taskRes.data.data?.task || taskRes.data.data || taskRes.data;
      
      console.log('✅ Task loaded:', taskData);
      setTask(taskData);
      
      // Fetch assignments
      try {
        const assignmentsRes = await api.get(`/tasks/${taskId}/assignments`);
        const assignmentsData = assignmentsRes.data.data?.assignments || 
                               assignmentsRes.data.data || 
                               assignmentsRes.data.assignments || 
                               [];
        
        console.log('✅ Assignments loaded:', assignmentsData.length);
        setAssignments(assignmentsData);
      } catch (err) {
        console.warn('No assignments found or error fetching assignments:', err);
        setAssignments([]);
      }
      
    } catch (err) {
      console.error('❌ Error fetching task details:', err);
      setError(err.response?.data?.message || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/tasks/${taskId}`);
      
      navigate('/parent/tasks', {
        state: { message: 'Task deleted successfully!' }
      });
    } catch (err) {
      console.error('Error deleting task:', err);
      alert(err.response?.data?.message || 'Failed to delete task');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">{error}</p>
            <button
              onClick={fetchTaskDetails}
              className="text-sm underline mt-1 hover:text-red-900"
            >
              Try again
            </button>
          </div>
        </div>
        <Link
          to="/parent/tasks"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Tasks
        </Link>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          Task not found
        </div>
        <Link
          to="/parent/tasks"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Tasks
        </Link>
      </div>
    );
  }

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status === 'active';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/parent/tasks"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Tasks
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {task.title || task.task_name}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              {task.photo_required && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  <Camera className="w-4 h-4 mr-1" />
                  Photo Required
                </span>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Link
              to={`/parent/tasks/edit/${taskId}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Task Details Card */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-4">
          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Description
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {task.description || 'No description provided'}
            </p>
          </div>

          {/* Task Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            {/* Category */}
            {task.category && (
              <div className="flex items-center text-gray-600">
                <Tag className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium text-gray-900">{task.category}</p>
                </div>
              </div>
            )}

            {/* Points */}
            <div className="flex items-center text-gray-600">
              <Award className="w-5 h-5 mr-2 text-primary-500" />
              <div>
                <p className="text-sm text-gray-500">Points Reward</p>
                <p className="font-medium text-primary-600">{task.points_reward} points</p>
              </div>
            </div>

            {/* Deadline */}
            {task.deadline && (
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Deadline</p>
                  <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                    {new Date(task.deadline).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                    {isOverdue && <span className="ml-2 text-xs">(Overdue)</span>}
                  </p>
                </div>
              </div>
            )}

            {/* Created */}
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-2 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium text-gray-900">
                  {new Date(task.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Recurrence */}
          {task.is_recurring && task.recurrence_pattern && task.recurrence_pattern !== 'none' && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center text-gray-600">
                <RefreshCw className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Recurrence</p>
                  <p className="font-medium text-gray-900 capitalize">{task.recurrence_pattern}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assignments Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Assignments ({assignments.length})
          </h2>
          <Link
            to={`/parent/tasks/${taskId}/assign`}
            className="inline-flex items-center px-3 py-1.5 border border-primary-300 rounded-md text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Assign to Children
          </Link>
        </div>
        
        <div className="p-6">
          {assignments.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No assignments yet</p>
              <Link
                to={`/parent/tasks/${taskId}/assign`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Assign to Children
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map(assignment => (
                <AssignmentCard 
                  key={assignment.assignment_id} 
                  assignment={assignment}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      {assignments.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {assignments.filter(a => a.status === 'pending').length}
            </p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {assignments.filter(a => a.status === 'in_progress' || a.status === 'submitted').length}
            </p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {assignments.filter(a => a.status === 'approved').length}
            </p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {assignments.filter(a => a.status === 'rejected').length}
            </p>
            <p className="text-sm text-gray-600">Rejected</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Task</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "<strong>{task.title || task.task_name}</strong>"?
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This will permanently delete:
              </p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1 ml-4">
                <li>• {assignments.length} assignment(s)</li>
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
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Task'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
