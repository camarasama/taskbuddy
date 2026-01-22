import { useState } from 'react';
import { Eye, EyeOff, Check, X, Lock } from 'lucide-react';

/**
 * ChangePassword Component
 * Handles password change with validation and strength indicator
 * 
 * @param {Object} props
 * @param {Function} props.onSubmit - Callback when form is submitted
 * @param {boolean} props.loading - Loading state
 */
export default function ChangePassword({ onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validatePassword = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const strength = Object.values(checks).filter(Boolean).length;
    setPasswordStrength(strength);

    return checks;
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

    // Validate new password strength
    if (name === 'newPassword') {
      validatePassword(value);
    }
  };

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const checks = validatePassword(formData.newPassword);
      
      if (!checks.length) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      } else if (passwordStrength < 3) {
        newErrors.newPassword = 'Password is too weak';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (onSubmit) {
      onSubmit({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  const passwordChecks = formData.newPassword ? validatePassword(formData.newPassword) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Current Password */}
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
          Current Password *
        </label>
        <div className="mt-1 relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showPasswords.current ? 'text' : 'password'}
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className={`pl-10 pr-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.currentPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter current password"
          />
          <button
            type="button"
            onClick={() => toggleShowPassword('current')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
        )}
      </div>

      {/* New Password */}
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
          New Password *
        </label>
        <div className="mt-1 relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showPasswords.new ? 'text' : 'password'}
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className={`pl-10 pr-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.newPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter new password"
          />
          <button
            type="button"
            onClick={() => toggleShowPassword('new')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
        )}

        {/* Password Strength Indicator */}
        {formData.newPassword && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Password strength:</span>
              <span className={`text-xs font-medium ${
                passwordStrength <= 2 ? 'text-red-600' :
                passwordStrength <= 3 ? 'text-yellow-600' :
                passwordStrength <= 4 ? 'text-blue-600' :
                'text-green-600'
              }`}>
                {getStrengthLabel()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getStrengthColor()}`}
                style={{ width: `${(passwordStrength / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Password Requirements */}
        {formData.newPassword && passwordChecks && (
          <div className="mt-3 space-y-1">
            <p className="text-xs font-medium text-gray-700">Password must contain:</p>
            <div className="space-y-1">
              <PasswordCheck met={passwordChecks.length} text="At least 8 characters" />
              <PasswordCheck met={passwordChecks.uppercase} text="One uppercase letter" />
              <PasswordCheck met={passwordChecks.lowercase} text="One lowercase letter" />
              <PasswordCheck met={passwordChecks.number} text="One number" />
              <PasswordCheck met={passwordChecks.special} text="One special character" />
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm New Password *
        </label>
        <div className="mt-1 relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showPasswords.confirm ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`pl-10 pr-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Confirm new password"
          />
          <button
            type="button"
            onClick={() => toggleShowPassword('confirm')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Changing Password...
            </>
          ) : (
            'Change Password'
          )}
        </button>
      </div>
    </form>
  );
}

// Helper component for password requirements
function PasswordCheck({ met, text }) {
  return (
    <div className="flex items-center text-xs">
      {met ? (
        <Check className="w-4 h-4 text-green-500 mr-2" />
      ) : (
        <X className="w-4 h-4 text-gray-400 mr-2" />
      )}
      <span className={met ? 'text-green-700' : 'text-gray-600'}>{text}</span>
    </div>
  );
}

/**
 * Example Usage:
 * 
 * <ChangePassword
 *   onSubmit={async (data) => {
 *     await api.post('/auth/change-password', data);
 *   }}
 *   loading={false}
 * />
 */
