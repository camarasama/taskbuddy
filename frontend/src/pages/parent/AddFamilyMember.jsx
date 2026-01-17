import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { User, Mail, Calendar, UserPlus, Copy, Check } from 'lucide-react';
import axios from 'axios';

const AddFamilyMember = () => {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const [memberType, setMemberType] = useState('child'); // 'child' or 'spouse'
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    date_of_birth: '',
    phone_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name || formData.full_name.length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setTempPassword('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const endpoint = memberType === 'child' 
        ? `/families/${familyId}/add-child`
        : `/families/${familyId}/add-spouse`;
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${endpoint}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const memberData = response.data[memberType];
      setTempPassword(memberData?.temporary_password || '');
      setSuccess(`${memberType === 'child' ? 'Child' : 'Spouse'} account created successfully!`);
      
      // Reset form
      setFormData({
        full_name: '',
        email: '',
        date_of_birth: '',
        phone_number: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add family member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Family Member</h2>
        <p className="text-gray-600 mb-6">Create an account for a child or spouse in your family</p>
        
        {/* Member Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Member Type <span className="text-danger-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setMemberType('child')}
              className={`p-4 rounded-lg border-2 font-medium transition-all ${
                memberType === 'child'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <UserPlus className="w-6 h-6 mx-auto mb-2" />
              <span className="font-medium">Child (10-16)</span>
            </button>
            <button
              type="button"
              onClick={() => setMemberType('spouse')}
              className={`p-4 rounded-lg border-2 font-medium transition-all ${
                memberType === 'spouse'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <UserPlus className="w-6 h-6 mx-auto mb-2" />
              <span className="font-medium">Spouse</span>
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />}
        
        {success && (
          <Alert type="success" message={success} className="mb-6">
            {tempPassword && (
              <div className="mt-3 p-4 bg-white rounded-lg border-2 border-success-200">
                <p className="font-semibold text-success-800 mb-2">
                  Temporary Password:
                </p>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 text-lg font-mono bg-gray-100 px-3 py-2 rounded">
                    {tempPassword}
                  </code>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="p-2 bg-success-600 text-white rounded hover:bg-success-700 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-sm text-success-700 mt-2">
                  📧 An email with login credentials has been sent to {formData.email}
                </p>
                <p className="text-sm text-success-700 mt-1">
                  ⚠️ Make sure to share this password with the family member
                </p>
              </div>
            )}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder={memberType === 'child' ? "Child's full name" : "Spouse's full name"}
            error={errors.full_name}
            icon={User}
            required
          />
          
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
            error={errors.email}
            icon={Mail}
            required
          />
          
          <Input
            label="Date of Birth"
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            error={errors.date_of_birth}
            icon={Calendar}
            required
          />

          <Input
            label="Phone Number (Optional)"
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="+1234567890"
          />

          {/* Age requirement info */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-800">
              <strong>Age requirement:</strong>{' '}
              {memberType === 'child' 
                ? 'Child must be between 10 and 16 years old'
                : 'Spouse must be at least 18 years old'
              }
            </p>
          </div>
          
          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              fullWidth
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              loading={loading} 
              fullWidth
            >
              Add {memberType === 'child' ? 'Child' : 'Spouse'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFamilyMember;