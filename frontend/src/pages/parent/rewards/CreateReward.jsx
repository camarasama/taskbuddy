import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../services/api';
import {
  ArrowLeft,
  Save,
  Gift,
  Award,
  Hash,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function CreateReward() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingFamily, setLoadingFamily] = useState(true);
  const [familyId, setFamilyId] = useState(null);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    reward_name: '',
    description: '',
    points_required: '',
    quantity_available: '',
    status: 'available'
  });

  // ✅ Fetch family on mount
  useEffect(() => {
    fetchFamily();
  }, []);

  const fetchFamily = async () => {
    try {
      setLoadingFamily(true);
      const familiesRes = await api.get('/families');
      const families = familiesRes.data.data?.families || familiesRes.data.data || [];
      
      if (families.length === 0) {
        setErrors({ family: 'No family found. Please create a family first.' });
        return;
      }

      setFamilyId(families[0].family_id);
      console.log('📋 Family loaded:', families[0].family_id);
    } catch (err) {
      console.error('Error fetching family:', err);
      setErrors({ family: 'Failed to load family information' });
    } finally {
      setLoadingFamily(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.reward_name.trim()) {
      newErrors.reward_name = 'Reward name is required';
    } else if (formData.reward_name.length < 2) {
      newErrors.reward_name = 'Reward name must be at least 2 characters';
    } else if (formData.reward_name.length > 255) {
      newErrors.reward_name = 'Reward name must be 255 characters or less';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
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
      if (isNaN(quantity) || quantity < 1) {
        newErrors.quantity_available = 'Quantity must be at least 1';
      } else if (quantity > 1000) {
        newErrors.quantity_available = 'Quantity cannot exceed 1,000';
      }
    }

    if (!familyId) {
      newErrors.family = 'Family information is required';
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

      // ✅ FIX: Include family_id in payload
      const payload = {
        family_id: familyId,                                      // ✅ REQUIRED
        reward_name: formData.reward_name.trim(),                 // ✅ Required
        description: formData.description.trim(),                 // ✅ Optional but we require it
        points_required: parseInt(formData.points_required),      // ✅ Required
        quantity_available: parseInt(formData.quantity_available),// ✅ Optional
        status: formData.status                                   // ✅ Optional
      };

      console.log('📤 Sending reward creation payload:', payload);

      const response = await api.post('/rewards', payload);
      
      console.log('✅ Reward created:', response.data);

      navigate('/parent/rewards', { 
        state: { 
          message: 'Reward created successfully!',
          rewardId: response.data.data?.reward_id || response.data.data?.reward?.reward_id
        } 
      });

    } catch (err) {
      console.error('❌ Error creating reward:', err);
      
      if (err.response?.data?.errors) {
        const backendErrors = {};
        if (Array.isArray(err.response.data.errors)) {
          err.response.data.errors.forEach(error => {
            backendErrors[error.field || error.path || error.param] = error.message || error.msg;
          });
        }
        setErrors(backendErrors);
      } else {
        setErrors({
          submit: err.response?.data?.message || 'Failed to create reward. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loadingFamily) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Family error state
  if (errors.family) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{errors.family}</span>
        </div>
        <Link
          to="/parent/family"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          Go to Family Management
        </Link>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-gray-900">Create New Reward</h1>
        <p className="text-gray-600 mt-2">Add a new reward to motivate your children</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          {/* Reward Name */}
          <div>
            <label htmlFor="reward_name" className="block text-sm font-medium text-gray-700">
              Reward Name <span className="text-red-500">*</span>
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
                placeholder="e.g., Extra screen time, Movie night, New toy"
                maxLength={255}
                disabled={loading}
              />
            </div>
            {errors.reward_name && (
              <p className="mt-1 text-sm text-red-600">{errors.reward_name}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.reward_name.length}/255 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
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
                placeholder="Describe the reward in detail..."
                maxLength={500}
                disabled={loading}
              />
            </div>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/500 characters - Be specific about what the reward includes
            </p>
          </div>

          {/* Points and Quantity Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Points Required */}
            <div>
              <label htmlFor="points_required" className="block text-sm font-medium text-gray-700">
                Points Required <span className="text-red-500">*</span>
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
                  placeholder="e.g., 100"
                  disabled={loading}
                />
              </div>
              {errors.points_required && (
                <p className="mt-1 text-sm text-red-600">{errors.points_required}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Points children need to redeem this reward (1-10,000)
              </p>
            </div>

            {/* Quantity Available */}
            <div>
              <label htmlFor="quantity_available" className="block text-sm font-medium text-gray-700">
                Quantity Available <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  id="quantity_available"
                  name="quantity_available"
                  value={formData.quantity_available}
                  onChange={handleChange}
                  min="1"
                  max="1000"
                  className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.quantity_available ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 10"
                  disabled={loading}
                />
              </div>
              {errors.quantity_available && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity_available}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Total number of times this can be redeemed (1-1,000)
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
              disabled={loading}
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Unavailable rewards won't show up for children to redeem
            </p>
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
              disabled={loading || !familyId}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Create Reward
                </>
              )}
            </button>
            <Link
              to="/parent/rewards"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>

      {/* Tips Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Creating Great Rewards</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Mix tangible rewards (toys, treats) with intangible ones (privileges, activities)</li>
          <li>• Set point values that require multiple completed tasks</li>
          <li>• Keep some rewards unlimited (low points) and others limited (high value)</li>
          <li>• Update reward catalog regularly to maintain interest</li>
          <li>• Consider age-appropriate rewards for each child</li>
        </ul>
      </div>

      {/* Examples */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium text-gray-900 mb-3">Example Rewards</h3>
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">30 minutes extra screen time</p>
            <p className="text-sm text-gray-600">50 points • Unlimited quantity</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">Choose dinner menu for the family</p>
            <p className="text-sm text-gray-600">150 points • 4 per month</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">Movie night with popcorn</p>
            <p className="text-sm text-gray-600">200 points • 2 per week</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">Small toy or game (up to $15)</p>
            <p className="text-sm text-gray-600">500 points • 1 per month</p>
          </div>
        </div>
      </div>
    </div>
  );
}
