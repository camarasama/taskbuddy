import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import api from '../../../services/api';
import {
  ArrowLeft,
  Save,
  Calendar,
  Tag,
  Award,
  AlertCircle,
  Camera,
  Clock,
  FileText,
  Trash2,
  Archive
} from 'lucide-react';

const CATEGORIES = [
  'Household',
  'Education',
  'Personal Care',
  'Outdoor',
  'Pet Care',
  'Health & Fitness',
  'Creative',
  'Other'
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'text-green-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-red-600' }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'text-green-600' },
  { value: 'completed', label: 'Completed', color: 'text-blue-600' },
  { value: 'archived', label: 'Archived', color: 'text-gray-600' }
];

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'One-time task' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' }
];

export default function EditTask() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    task_name: '',
    description: '',
    category: '',
    priority: 'medium',
    points_reward: '',
    due_date: '',
    requires_photo: false,
    recurrence_pattern: 'none',
    status: 'active'
  });

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tasks/${taskId}`);
      const task = response.data.data;
      
      setFormData({
        task_name: task.task_name,
        description: task.description,
        category: task.category || '',
        priority: task.priority,
        points_reward: task.points_reward,
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        requires_photo: task.requires_photo,
        recurrence_pattern: task.recurrence_pattern || 'none',
        status: task.status
      });
      
    } catch (err) {
      console.error('Error fetching task:', err);
      setErrors({ fetch: 'Failed to load task details' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.task_name.trim()) {
      newErrors.task_name = 'Task name is required';
    } else if (formData.task_name.length > 100) {
      newErrors.task_name = 'Task name must be 100 characters or less';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.points_reward) {
      newErrors.points_reward = 'Points reward is required';
    } else {
      const points = parseInt(formData.points_reward);
      if (isNaN(points) || points < 1) {
        newErrors.points_reward = 'Points must be at least 1';
      } else if (points > 1000) {
        newErrors.points_reward = 'Points cannot exceed 1000';
      }
    }

    if (formData.due_date) {
      const dueDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.due_date = 'Due date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setErrors({});

      const payload = {
        task_name: formData.task_name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        points_reward: parseInt(formData.points_reward),
        status: formData.status,
        requires_photo: formData.requires_photo,
        ...(formData.due_date && { due_date: formData.due_date }),
        ...(formData.recurrence_pattern !== 'none' && { 
          recurrence_pattern: formData.recurrence_pattern 
        })
      };

      await api.put(`/tasks/${taskId}`, payload);
      
      navigate('/parent/tasks', { 
        state: { message: 'Task updated successfully!' } 
      });

    } catch (err) {
      console.error('Error updating task:', err);
      
      if (err.response?.data?.errors) {
        const backendErrors = {};
        err.response.data.errors.forEach(error => {
          backendErrors[error.path] = error.msg;
        });
        setErrors(backendErrors);
      } else {
        setErrors({
          submit: err.response?.data?.message || 'Failed to update task'
        });
      }
    } finally {
      setSaving(false);
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
      setErrors({
        delete: err.response?.data?.message || 'Failed to delete task'
      });
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleArchive = async () => {
    setFormData(prev => ({ ...prev, status: 'archived' }));
    // Submit will be triggered by the form
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (errors.fetch) {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errors.fetch}
        </div>
        <Link
          to="/parent/tasks"
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/parent/tasks"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Tasks
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Task</h1>
        <p className="text-gray-600 mt-2">Update task details and settings</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          {/* Task Name */}
          <div>
            <label htmlFor="task_name" className="block text-sm font-medium text-gray-700">
              Task Name *
            </label>
            <div className="mt-1 relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="task_name"
                name="task_name"
                value={formData.task_name}
                onChange={handleChange}
                className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.task_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Clean your room"
                maxLength={100}
              />
            </div>
            {errors.task_name && (
              <p className="mt-1 text-sm text-red-600">{errors.task_name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe what needs to be done..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <div className="mt-1 relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority Level *
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {PRIORITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Points and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="points_reward" className="block text-sm font-medium text-gray-700">
                Points Reward *
              </label>
              <div className="mt-1 relative">
                <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  id="points_reward"
                  name="points_reward"
                  value={formData.points_reward}
                  onChange={handleChange}
                  min="1"
                  max="1000"
                  className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.points_reward ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.points_reward && (
                <p className="mt-1 text-sm text-red-600">{errors.points_reward}</p>
              )}
            </div>

            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <div className="mt-1 relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.due_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.due_date && (
                <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>
              )}
            </div>
          </div>

          {/* Status and Recurrence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="recurrence_pattern" className="block text-sm font-medium text-gray-700">
                Recurrence
              </label>
              <div className="mt-1 relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="recurrence_pattern"
                  name="recurrence_pattern"
                  value={formData.recurrence_pattern}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {RECURRENCE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Photo Requirement */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="requires_photo"
                name="requires_photo"
                checked={formData.requires_photo}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="requires_photo" className="font-medium text-gray-700 flex items-center">
                <Camera className="w-4 h-4 mr-2" />
                Require photo proof of completion
              </label>
            </div>
          </div>

          {/* Errors */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{errors.submit}</span>
            </div>
          )}

          {errors.delete && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.delete}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Task
            </button>

            <Link
              to="/parent/tasks"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Task?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this task? This action cannot be undone. All assignments and history will be permanently removed.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
