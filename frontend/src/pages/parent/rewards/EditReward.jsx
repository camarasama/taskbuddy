import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import api from '../../../services/api';
import {
  ArrowLeft,
  Save,
  Gift,
  Award,
  Hash,
  AlertCircle,
  FileText,
  Trash2
} from 'lucide-react';

export default function EditReward() {
  const { rewardId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    reward_name: '',
    description: '',
    points_required: '',
    quantity_available: '',
    status: 'available'
  });
  const [redemptionStats, setRedemptionStats] = useState({
    total_redemptions: 0,
    pending_redemptions: 0
  });

  useEffect(() => {
    fetchReward();
  }, [rewardId]);

  const fetchReward = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/rewards/${rewardId}`);
      const reward = response.data.data;
      
      setFormData({
        reward_name: reward.reward_name,
        description: reward.description,
        points_required: reward.points_required,
        quantity_available: reward.quantity_available,
        status: reward.status
      });

      setRedemptionStats({
        total_redemptions: reward.quantity_redeemed || 0,
        pending_redemptions: reward.pending_redemptions || 0
      });
      
    } catch (err) {
      console.error('Error fetching reward:', err);
      setErrors({ fetch: 'Failed to load reward details' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.reward_name.trim()) {
      newErrors.reward_name = 'Reward name is required';
    } else if (formData.reward_name.length > 100) {
      newErrors.reward_name = 'Reward name must be 100 characters or less';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.points_required) {
      newErrors.points_required = 'Points required is required';
    } else {
      const points = parseInt(formData.points_required);
      if (isNaN(points) || points < 1) {
        newErrors.points_required = 'Points must be at least 1';
      } else if (points > 10000) {
        newErrors.points_required = 'Points cannot exceed 10,000';
      }
    }

    if (!formData.quantity_available) {
      newErrors.quantity_available = 'Quantity is required';
    } else {
      const quantity = parseInt(formData.quantity_available);
      if (isNaN(quantity) || quantity < redemptionStats.total_redemptions) {
        newErrors.quantity_available = `Quantity must be at least ${redemptionStats.total_redemptions} (already redeemed)`;
      } else if (quantity > 1000) {
        newErrors.quantity_available = 'Quantity cannot exceed 1,000';
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
        reward_name: formData.reward_name.trim(),
        description: formData.description.trim(),
        points_required: parseInt(formData.points_required),
        quantity_available: parseInt(formData.quantity_available),
        status: formData.status
      };

      await api.put(`/rewards/${rewardId}`, payload);
      
      navigate('/parent/rewards', { 
        state: { message: 'Reward updated successfully!' } 
      });

    } catch (err) {
      console.error('Error updating reward:', err);
      
      if (err.response?.data?.errors) {
        const backendErrors = {};
        err.response.data.errors.forEach(error => {
          backendErrors[error.path] = error.msg;
        });
        setErrors(backendErrors);
      } else {
        setErrors({
          submit: err.response?.data?.message || 'Failed to update reward'
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/rewards/${rewardId}`);
      
      navigate('/parent/rewards', { 
        state: { message: 'Reward deleted successfully!' } 
      });

    } catch (err) {
      console.error('Error deleting reward:', err);
      setErrors({
        delete: err.response?.data?.message || 'Failed to delete reward'
      });
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading reward...</p>
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
          to="/parent/rewards"
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Rewards
        </Link>
      </div>
    );
  }

  const availableQuantity = formData.quantity_available - redemptionStats.total_redemptions;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/parent/rewards"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Rewards
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Reward</h1>
        <p className="text-gray-600 mt-2">Update reward details and availability</p>
      </div>

      {/* Redemption Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Redemption Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{redemptionStats.total_redemptions}</p>
            <p className="text-sm text-blue-700 mt-1">Total Redeemed</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">{redemptionStats.pending_redemptions}</p>
            <p className="text-sm text-yellow-700 mt-1">Pending Requests</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{availableQuantity}</p>
            <p className="text-sm text-green-700 mt-1">Still Available</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          {/* Reward Name */}
          <div>
            <label htmlFor="reward_name" className="block text-sm font-medium text-gray-700">
              Reward Name *
            </label>
            <div className="mt-1 relative">
              <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="reward_name"
                name="reward_name"
                value={formData.reward_name}
                onChange={handleChange}
                className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.reward_name ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={100}
              />
            </div>
            {errors.reward_name && (
              <p className="mt-1 text-sm text-red-600">{errors.reward_name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <div className="mt-1 relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Points and Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="points_required" className="block text-sm font-medium text-gray-700">
                Points Required *
              </label>
              <div className="mt-1 relative">
                <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  id="points_required"
                  name="points_required"
                  value={formData.points_required}
                  onChange={handleChange}
                  min="1"
                  max="10000"
                  className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.points_required ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.points_required && (
                <p className="mt-1 text-sm text-red-600">{errors.points_required}</p>
              )}
            </div>

            <div>
              <label htmlFor="quantity_available" className="block text-sm font-medium text-gray-700">
                Quantity Available *
              </label>
              <div className="mt-1 relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  id="quantity_available"
                  name="quantity_available"
                  value={formData.quantity_available}
                  onChange={handleChange}
                  min={redemptionStats.total_redemptions}
                  max="1000"
                  className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.quantity_available ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.quantity_available && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity_available}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Minimum: {redemptionStats.total_redemptions} (already redeemed)
              </p>
            </div>
          </div>

          {/* Status */}
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
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
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
              Delete Reward
            </button>

            <Link
              to="/parent/rewards"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Reward?</h3>
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete this reward?
            </p>
            {redemptionStats.pending_redemptions > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded text-sm mb-4">
                Warning: There are {redemptionStats.pending_redemptions} pending redemption requests for this reward.
              </div>
            )}
            <p className="text-sm text-gray-600 mb-6">
              This action cannot be undone. All redemption history will be kept for record purposes.
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
