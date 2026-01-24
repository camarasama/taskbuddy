// ============================================================================
// AddMember Component - UPDATED: Date of Birth Instead of Age
// Form for adding children or spouse to family
// 
// CHANGES:
// - Changed from age input to date_of_birth input
// - Added age calculation from date of birth
// - Updated validation logic
// ============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { UserPlus, Baby, UserCircle, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

export default function AddMember() {
  const navigate = useNavigate();
  const [memberType, setMemberType] = useState('child'); // 'child' or 'spouse'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [familyId, setFamilyId] = useState(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    date_of_birth: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchUserFamily();
  }, []);

  const fetchUserFamily = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data.data;
      
      if (userData.family_id) {
        setFamilyId(userData.family_id);
      } else {
        setError('You must be part of a family to add members');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load family information');
    }
  };

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const validateForm = () => {
    const errors = {};

    // Validate full name
    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 3) {
      errors.full_name = 'Name must be at least 3 characters';
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    // Validate password
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Validate date of birth (only for children)
    if (memberType === 'child') {
      if (!formData.date_of_birth) {
        errors.date_of_birth = 'Date of birth is required for children';
      } else {
        const age = calculateAge(formData.date_of_birth);
        const birthDate = new Date(formData.date_of_birth);
        const today = new Date();
        
        if (birthDate > today) {
          errors.date_of_birth = 'Date of birth cannot be in the future';
        } else if (age < 1) {
          errors.date_of_birth = 'Child must be at least 1 year old';
        } else if (age > 18) {
          errors.date_of_birth = 'Child must be 18 years or younger';
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!familyId) {
      setError('Family ID not found. Please try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // ✅ CORRECT: Use the proper backend endpoint with familyId
      const endpoint = memberType === 'child' 
        ? `/families/${familyId}/add-child`
        : `/families/${familyId}/add-spouse`;

      const payload = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };

      // Add date_of_birth for children
      if (memberType === 'child' && formData.date_of_birth) {
        payload.date_of_birth = formData.date_of_birth;
      }

      console.log('Submitting to:', endpoint);
      console.log('Payload:', { ...payload, password: '[REDACTED]' });

      const response = await api.post(endpoint, payload);

      console.log('Response:', response.data);

      // Success - navigate back to family management
      navigate('/parent/family', {
        state: {
          successMessage: `${memberType === 'child' ? 'Child' : 'Spouse'} added successfully!`
        }
      });

    } catch (err) {
      console.error('Add member error:', err);
      
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Invalid data provided');
        if (err.response.data.errors) {
          setFormErrors(err.response.data.errors);
        }
      } else if (err.response?.status === 403) {
        setError('You do not have permission to add family members');
      } else if (err.response?.status === 409) {
        setError('A user with this email already exists');
      } else if (err.response?.status === 404) {
        setError('Family not found. Please try again.');
      } else {
        setError(err.response?.data?.message || 'Failed to add family member. Please try again.');
      }
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
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMemberTypeChange = (type) => {
    setMemberType(type);
    setFormErrors({});
    setError('');
  };

  // Get max date (today) and min date (18 years ago) for date picker
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 1); // Min 1 year old
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 18); // Max 18 years old

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/parent/family')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Family Member</h1>
          <p className="text-gray-600 mt-1">Add a child or spouse to your family</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Member Type Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Who would you like to add?
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleMemberTypeChange('child')}
            className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors ${
              memberType === 'child'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Baby className={`w-8 h-8 ${memberType === 'child' ? 'text-primary-600' : 'text-gray-400'}`} />
            <span className={`font-medium ${memberType === 'child' ? 'text-primary-700' : 'text-gray-700'}`}>
              Child
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleMemberTypeChange('spouse')}
            className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors ${
              memberType === 'spouse'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <UserCircle className={`w-8 h-8 ${memberType === 'spouse' ? 'text-primary-600' : 'text-gray-400'}`} />
            <span className={`font-medium ${memberType === 'spouse' ? 'text-primary-700' : 'text-gray-700'}`}>
              Spouse
            </span>
          </button>
        </div>
      </div>

      {/* Add Member Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {memberType === 'child' ? 'Child' : 'Spouse'} Information
        </h2>

        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.full_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={`Enter ${memberType}'s full name`}
            disabled={loading}
          />
          {formErrors.full_name && (
            <p className="mt-1 text-sm text-red-500">{formErrors.full_name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="email@example.com"
            disabled={loading}
          />
          {formErrors.email && (
            <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            This will be used for login and notifications
          </p>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Minimum 8 characters"
            disabled={loading}
          />
          {formErrors.password && (
            <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Must contain uppercase, lowercase, and number
          </p>
        </div>

        {/* Date of Birth (only for children) */}
        {memberType === 'child' && (
          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              max={today}
              min={minDate.toISOString().split('T')[0]}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                formErrors.date_of_birth ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {formErrors.date_of_birth && (
              <p className="mt-1 text-sm text-red-500">{formErrors.date_of_birth}</p>
            )}
            {formData.date_of_birth && !formErrors.date_of_birth && (
              <p className="mt-1 text-xs text-gray-600">
                Age: {calculateAge(formData.date_of_birth)} years old
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Child must be between 10 and 16 years old
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">What happens next?</p>
              <ul className="space-y-1 list-disc list-inside">
                {memberType === 'child' ? (
                  <>
                    <li>Child account will be created automatically</li>
                    <li>They'll receive login credentials via email</li>
                    <li>They can start completing tasks right away</li>
                    <li>Initial points balance will be 0</li>
                  </>
                ) : (
                  <>
                    <li>Spouse account will be created automatically</li>
                    <li>They'll receive login credentials via email</li>
                    <li>They can create tasks and manage rewards</li>
                    <li>They cannot remove other parents</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading || !familyId}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding {memberType}...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Add {memberType === 'child' ? 'Child' : 'Spouse'}
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/parent/family')}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-900 mb-2">💡 Tips</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Make sure the email address is valid and accessible</li>
          <li>• The {memberType} will receive their login credentials via email</li>
          <li>• Passwords can be changed later from their profile settings</li>
          {memberType === 'child' && (
            <>
              <li>• Children aged 10-16 are the target users for this system</li>
              <li>• Age is automatically calculated from date of birth</li>
            </>
          )}
          {memberType === 'spouse' && (
            <li>• Spouses have similar permissions to parents except removing other parents</li>
          )}
        </ul>
      </div>
    </div>
  );
}