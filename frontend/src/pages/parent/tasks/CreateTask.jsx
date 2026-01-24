import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Calendar,
  Tag,
  Award,
  Image,
  Repeat,
  Users
} from 'lucide-react';

export default function CreateTask() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [familyId, setFamilyId] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // ✅ FIXED: Use correct field names that match backend expectations
  const [formData, setFormData] = useState({
    title: '',                    // ✅ Changed from 'task_name' to 'title'
    description: '',
    category: 'Chores',
    priority: 'medium',
    points_reward: '',
    photo_required: false,        // ✅ Changed from 'requires_photo' to 'photo_required'
    deadline: '',                 // ✅ Changed from 'due_date' to 'deadline'
    status: 'active',
    is_recurring: false,
    recurrence_pattern: 'none',
    assigned_children: []         // ✅ NEW: For task assignment (optional)
  });

  const categories = [
    'Chores',
    'Homework',
    'Personal Care',
    'Pet Care',
    'Outdoor',
    'Indoor',
    'Creative',
    'Learning',
    'Exercise',
    'Other'
  ];

  // Fetch family and members on mount
  useEffect(() => {
    fetchFamilyAndMembers();
  }, []);

  // ============================================================================
  // FETCH FAMILY AND CHILDREN
  // ============================================================================
  const fetchFamilyAndMembers = async () => {
    try {
      // Get user's families
      const familiesRes = await api.get('/families');
      const families = familiesRes.data.data?.families || familiesRes.data.data || [];
      
      if (families.length === 0) {
        setErrors({ family: 'No family found. Please create a family first.' });
        return;
      }

      const userFamily = families[0];
      setFamilyId(userFamily.family_id);
      console.log('📋 Family loaded:', userFamily.family_id);

      // Get family members (children only)
      const membersRes = await api.get(`/families/${userFamily.family_id}/members`);
      const allMembers = membersRes.data.data?.members || membersRes.data.data || [];
      
      // Filter only children
      const children = allMembers.filter(m => m.role === 'child');
      setFamilyMembers(children);
      console.log('👶 Children loaded:', children.length);

    } catch (err) {
      console.error('Error fetching family data:', err);
      setErrors({ family: 'Failed to load family information' });
    } finally {
      setLoadingMembers(false);
    }
  };

  // ============================================================================
  // HANDLE INPUT CHANGES
  // ============================================================================
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

  // ============================================================================
  // HANDLE CHILD SELECTION
  // ============================================================================
  const handleChildSelection = (childId) => {
    setFormData(prev => {
      const isSelected = prev.assigned_children.includes(childId);
      return {
        ...prev,
        assigned_children: isSelected
          ? prev.assigned_children.filter(id => id !== childId)
          : [...prev.assigned_children, childId]
      };
    });
  };

  // ============================================================================
  // VALIDATE FORM
  // ============================================================================
  const validateForm = () => {
    const newErrors = {};

    // Title validation (backend expects 'title' 3-255 chars)
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be 255 characters or less';
    }

    // Description validation (optional, max 1000 chars)
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be 1000 characters or less';
    }

    // Category validation (optional, max 100 chars)
    if (formData.category && formData.category.length > 100) {
      newErrors.category = 'Category must be 100 characters or less';
    }

    // Points reward validation (required, min 1)
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

    // Deadline validation (optional, but if provided must be in future)
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadlineDate < today) {
        newErrors.deadline = 'Deadline cannot be in the past';
      }
    }

    // Family ID validation
    if (!familyId) {
      newErrors.family = 'Family information is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================================
  // HANDLE FORM SUBMISSION
  // ============================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      // ✅ FIXED: Build payload with correct field names for backend
      const payload = {
        family_id: familyId,                                    // ✅ REQUIRED
        title: formData.title.trim(),                           // ✅ Changed from task_name
        description: formData.description.trim() || undefined,  // Optional
        category: formData.category || undefined,               // Optional
        priority: formData.priority,                            // Required
        points_reward: parseInt(formData.points_reward),        // Required
        photo_required: formData.photo_required,                // ✅ Changed from requires_photo
        status: formData.status,
        ...(formData.deadline && { deadline: formData.deadline }), // ✅ Changed from due_date
        ...(formData.is_recurring && formData.recurrence_pattern !== 'none' && {
          is_recurring: true,
          recurrence_pattern: formData.recurrence_pattern
        })
      };

      console.log('📤 Sending task creation payload:', payload);

      // Create the task
      const response = await api.post('/tasks', payload);
      const createdTask = response.data.data;
      
      console.log('✅ Task created:', createdTask);

      // ✅ NEW: If children are selected, assign the task to them
      if (formData.assigned_children.length > 0) {
        try {
          await api.post(`/tasks/${createdTask.task_id}/assign`, {
            child_ids: formData.assigned_children,
            ...(formData.deadline && { due_date: formData.deadline })
          });
          console.log('✅ Task assigned to children');
        } catch (assignError) {
          console.error('⚠️ Task created but assignment failed:', assignError);
          // Continue anyway - task is created, just not assigned
        }
      }

      // Success - navigate to task list
      navigate('/parent/tasks', { 
        state: { 
          message: 'Task created successfully!',
          taskId: createdTask.task_id 
        } 
      });

    } catch (err) {
      console.error('❌ Error creating task:', err);
      
      // Handle validation errors from backend
      if (err.response?.data?.errors) {
        const backendErrors = {};
        if (Array.isArray(err.response.data.errors)) {
          err.response.data.errors.forEach(error => {
            backendErrors[error.path || error.param] = error.msg || error.message;
          });
        }
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

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (loadingMembers) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/parent/tasks')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
          <p className="text-gray-600 mt-1">Define a task for your family</p>
        </div>
      </div>

      {/* Family Error */}
      {errors.family && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{errors.family}</span>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Submit Error */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{errors.submit}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="space-y-4">
            {/* Task Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Clean your room, Do homework, Walk the dog"
                disabled={loading}
                maxLength={255}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.title.length}/255 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Provide detailed instructions for this task..."
                disabled={loading}
                maxLength={1000}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/1000 characters
              </p>
            </div>

            {/* Category and Priority Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Reward & Settings Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Reward & Settings</h2>
          
          <div className="space-y-4">
            {/* Points Reward */}
            <div>
              <label htmlFor="points_reward" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Award className="w-4 h-4 mr-1" />
                Points Reward <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="number"
                id="points_reward"
                name="points_reward"
                value={formData.points_reward}
                onChange={handleChange}
                min="1"
                max="1000"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.points_reward ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 10, 25, 50"
                disabled={loading}
              />
              {errors.points_reward && (
                <p className="mt-1 text-sm text-red-500">{errors.points_reward}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Points awarded when task is completed (1-1000)
              </p>
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Deadline (Optional)
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.deadline ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.deadline && (
                <p className="mt-1 text-sm text-red-500">{errors.deadline}</p>
              )}
            </div>

            {/* Photo Required Checkbox */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="photo_required"
                  name="photo_required"
                  checked={formData.photo_required}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  disabled={loading}
                />
              </div>
              <label htmlFor="photo_required" className="ml-3 text-sm">
                <span className="font-medium text-gray-900 flex items-center">
                  <Image className="w-4 h-4 mr-1" />
                  Require photo verification
                </span>
                <span className="text-gray-600 block mt-1">
                  Child must upload a photo when submitting this task
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Assign To Card (Optional) */}
        {familyMembers.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Assign To (Optional)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Select children to assign this task to immediately, or leave blank to assign later
            </p>
            
            <div className="space-y-2">
              {familyMembers.map(child => (
                <div key={child.user_id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id={`child-${child.user_id}`}
                    checked={formData.assigned_children.includes(child.user_id)}
                    onChange={() => handleChildSelection(child.user_id)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    disabled={loading}
                  />
                  <label htmlFor={`child-${child.user_id}`} className="ml-3 flex-1 cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold mr-3">
                        {child.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{child.full_name}</p>
                        <p className="text-xs text-gray-500">{child.email}</p>
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
            
            {formData.assigned_children.length > 0 && (
              <p className="mt-3 text-sm text-primary-600">
                {formData.assigned_children.length} {formData.assigned_children.length === 1 ? 'child' : 'children'} selected
              </p>
            )}
          </div>
        )}

        {/* Recurring Task (Advanced) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Repeat className="w-5 h-5 mr-2" />
            Recurring Task (Advanced)
          </h2>
          
          <div className="space-y-4">
            {/* Is Recurring Checkbox */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="is_recurring"
                  name="is_recurring"
                  checked={formData.is_recurring}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  disabled={loading}
                />
              </div>
              <label htmlFor="is_recurring" className="ml-3 text-sm">
                <span className="font-medium text-gray-900">Make this a recurring task</span>
                <span className="text-gray-600 block mt-1">
                  Task will automatically repeat based on the pattern you choose
                </span>
              </label>
            </div>

            {/* Recurrence Pattern */}
            {formData.is_recurring && (
              <div>
                <label htmlFor="recurrence_pattern" className="block text-sm font-medium text-gray-700 mb-1">
                  Recurrence Pattern
                </label>
                <select
                  id="recurrence_pattern"
                  name="recurrence_pattern"
                  value={formData.recurrence_pattern}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="none">Select pattern...</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 bg-white rounded-lg shadow p-6">
          <button
            type="button"
            onClick={() => navigate('/parent/tasks')}
            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !familyId}
            className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Task
              </>
            )}
          </button>
        </div>
      </form>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Task Creation Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use clear, specific titles that children can easily understand</li>
          <li>• Set appropriate point rewards based on task difficulty and time required</li>
          <li>• Enable photo verification for tasks that need proof of completion</li>
          <li>• You can assign tasks to children now or later from the task list</li>
          <li>• Recurring tasks are great for daily chores or regular responsibilities</li>
        </ul>
      </div>
    </div>
  );
}
