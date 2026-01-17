import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import { ArrowLeft, Save, Copy, Check, Settings, AlertCircle } from 'lucide-react';

export default function FamilySettings() {
  const [family, setFamily] = useState(null);
  const [formData, setFormData] = useState({
    family_name: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/families/my-family');
      const familyData = response.data.data;
      
      setFamily(familyData);
      setFormData({
        family_name: familyData.family_name
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching family data:', err);
      setError('Failed to load family settings');
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.family_name.trim()) {
      setError('Family name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await api.put('/families/update', {
        family_name: formData.family_name
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Refresh family data
      await fetchFamilyData();
    } catch (err) {
      console.error('Error updating family:', err);
      setError(err.response?.data?.message || 'Failed to update family settings');
    } finally {
      setSaving(false);
    }
  };

  const copyFamilyCode = () => {
    navigator.clipboard.writeText(family.family_code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-gray-900">Family Settings</h1>
        <p className="text-gray-600 mt-2">Manage your family configuration</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <Check className="w-5 h-5 mr-2" />
          Settings updated successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Family Information Card */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Family Information
          </h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Family Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Family Code
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={family?.family_code || ''}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-lg"
              />
              <button
                onClick={copyFamilyCode}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                {codeCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Share this code with family members to invite them to join
            </p>
          </div>

          {/* Created Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Family Created
            </label>
            <input
              type="text"
              value={family ? new Date(family.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : ''}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Family Name Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Family Details</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Family Name */}
            <div>
              <label htmlFor="family_name" className="block text-sm font-medium text-gray-700">
                Family Name *
              </label>
              <input
                type="text"
                id="family_name"
                name="family_name"
                value={formData.family_name}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter family name"
                required
              />
            </div>

            {/* Save Button */}
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <Link
                to="/parent/family"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow border-2 border-red-200">
        <div className="p-6 border-b border-red-200 bg-red-50">
          <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Delete Family</h3>
              <p className="text-sm text-gray-600 mt-1">
                Permanently delete your family and all associated data. This action cannot be undone.
              </p>
            </div>
            <button
              disabled
              className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Family
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            * Family deletion is currently disabled. Contact support for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
