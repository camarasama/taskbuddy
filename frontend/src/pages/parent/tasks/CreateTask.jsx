import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  FileText
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

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'One-time task' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' }
];

export default function CreateTask() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
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
      setLoading(true);
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

      const response = await api.post('/tasks', payload);
      
      // Success - navigate to task list
      navigate('/parent/tasks', { 
        state: { 
          message: 'Task created successfully!',
          taskId: response.data.data.task_id 
        } 
      });

    } catch (err) {
      console.error('Error creating task:', err);
      
      if (err.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = {};
        err.response.data.errors.forEach(error => {
          backendErrors[error.path] = error.msg;
        });
        setErrors(backendErrors);
      } else {
        setErrors({
          submit: err.response?.data?.message || 'Failed to create task. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
        <p className="text-gray-600 mt-2">Add a new task for your children to complete</p>
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
            <p className="mt-1 text-xs text-gray-500">
              {formData.task_name.length}/100 characters
            </p>
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

          {/* Category and Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
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

            {/* Priority */}
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

          {/* Points and Due Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Points Reward */}
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
                  placeholder="e.g., 50"
                />
              </div>
              {errors.points_reward && (
                <p className="mt-1 text-sm text-red-600">{errors.points_reward}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Points awarded when task is completed</p>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                Due Date (Optional)
              </label>
              <div className="mt-1 relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
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

          {/* Recurrence Pattern */}
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
            <p className="mt-1 text-xs text-gray-500">
              Recurring tasks will be automatically recreated after completion
            </p>
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
              <p className="text-sm text-gray-500">
                Children must upload a photo when submitting this task
              </p>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Create Task
                </>
              )}
            </button>
            <Link
              to="/parent/tasks"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">📝 Task Creation Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Be specific in your task description</li>
          <li>• Set appropriate point values based on task difficulty</li>
          <li>• Use recurring tasks for regular chores</li>
          <li>• Require photos for tasks that need verification</li>
          <li>• After creating, you'll need to assign the task to specific children</li>
        </ul>
      </div>
    </div>
  );
}
