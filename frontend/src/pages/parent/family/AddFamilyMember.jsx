import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../services/api';
import { UserPlus, ArrowLeft, Mail, User, Calendar, AlertCircle } from 'lucide-react';

export default function AddFamilyMember() {
  const navigate = useNavigate();
  const [memberType, setMemberType] = useState('child'); // 'child' or 'spouse'
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    date_of_birth: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (memberType === 'child' && !formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required for children';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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

      const endpoint = memberType === 'child' 
        ? '/families/children' 
        : '/families/spouse';

      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        ...(memberType === 'child' && { date_of_birth: formData.date_of_birth })
      };

      const response = await api.post(endpoint, payload);

      setSuccessMessage(
        `${memberType === 'child' ? 'Child' : 'Spouse'} added successfully! 
        A verification email has been sent to ${formData.email}.`
      );

      // Reset form
      setFormData({
        full_name: '',
        email: '',
        date_of_birth: '',
        password: ''
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/parent/family');
      }, 2000);

    } catch (err) {
      console.error('Error adding family member:', err);
      if (err.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = {};
        err.response.data.errors.forEach(error => {
          backendErrors[error.path] = error.msg;
        });
        setErrors(backendErrors);
      } else {
        setErrors({
          submit: err.response?.data?.message || 'Failed to add family member'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/parent/family"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Family
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add Family Member</h1>
        <p className="text-gray-600 mt-2">Add a spouse or child to your family</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {/* Member Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMemberType('child')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  memberType === 'child'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <UserPlus className={`w-6 h-6 mx-auto mb-2 ${
                  memberType === 'child' ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <p className={`font-medium ${
                  memberType === 'child' ? 'text-primary-600' : 'text-gray-700'
                }`}>
                  Child
                </p>
              </button>
              <button
                type="button"
                onClick={() => setMemberType('spouse')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  memberType === 'spouse'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <User className={`w-6 h-6 mx-auto mb-2 ${
                  memberType === 'spouse' ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <p className={`font-medium ${
                  memberType === 'spouse' ? 'text-primary-600' : 'text-gray-700'
                }`}>
                  Spouse
                </p>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.full_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                />
              </div>
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="email@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Date of Birth (for children only) */}
            {memberType === 'child' && (
              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">
                  Date of Birth *
                </label>
                <div className="mt-1 relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.date_of_birth && (
                  <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Child must be between 10-16 years old
                </p>
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Initial Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Minimum 6 characters"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                They can change this password after logging in
              </p>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Add {memberType === 'child' ? 'Child' : 'Spouse'}
                  </>
                )}
              </button>
              <Link
                to="/parent/family"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Important Information</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• A verification email will be sent to the provided email address</li>
          <li>• The new member must verify their email before logging in</li>
          <li>• They can change their password after their first login</li>
          {memberType === 'child' && (
            <li>• Children aged 10-16 can be added to the family</li>
          )}
        </ul>
      </div>
    </div>
  );
}
