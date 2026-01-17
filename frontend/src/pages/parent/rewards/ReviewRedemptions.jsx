import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import {
  CheckCircle,
  XCircle,
  Gift,
  User,
  Award,
  Calendar,
  AlertCircle,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';

const RedemptionCard = ({ redemption, onApprove, onDeny }) => {
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleApprove = async () => {
    setProcessing(true);
    await onApprove(redemption.redemption_id);
    setProcessing(false);
  };

  const handleDeny = async () => {
    if (!feedback.trim()) {
      alert('Please provide a reason for denying this redemption');
      return;
    }
    setProcessing(true);
    await onDeny(redemption.redemption_id, feedback);
    setProcessing(false);
    setShowDenyModal(false);
    setFeedback('');
  };

  const hasEnoughPoints = redemption.child_points >= redemption.points_required;

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Gift className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {redemption.reward_name}
              </h3>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <User className="w-4 h-4 mr-1" />
                {redemption.child_name}
              </div>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        </div>

        {/* Reward Description */}
        {redemption.reward_description && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">{redemption.reward_description}</p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <Award className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-blue-900">
              {redemption.points_required} pts
            </p>
            <p className="text-xs text-blue-600">Required</p>
          </div>
          <div className={`p-3 rounded-lg text-center ${
            hasEnoughPoints ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <Award className={`w-5 h-5 mx-auto mb-1 ${
              hasEnoughPoints ? 'text-green-600' : 'text-red-600'
            }`} />
            <p className={`text-sm font-medium ${
              hasEnoughPoints ? 'text-green-900' : 'text-red-900'
            }`}>
              {redemption.child_points} pts
            </p>
            <p className={`text-xs ${
              hasEnoughPoints ? 'text-green-600' : 'text-red-600'
            }`}>
              Available
            </p>
          </div>
        </div>

        {/* Request Date */}
        <div className="mb-4 flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          Requested: {new Date(redemption.redeemed_at).toLocaleString()}
        </div>

        {/* Warning if insufficient points */}
        {!hasEnoughPoints && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm flex items-start">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
            <span>
              Child does not have enough points. They need {redemption.points_required - redemption.child_points} more points.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleApprove}
            disabled={processing || !hasEnoughPoints}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve
          </button>
          <button
            onClick={() => setShowDenyModal(true)}
            disabled={processing}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Deny
          </button>
        </div>
      </div>

      {/* Deny Modal */}
      {showDenyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Deny Redemption Request</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please explain why this redemption request is being denied:
            </p>
            
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="E.g., Not enough points available, reward is temporarily out of stock..."
            />

            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleDeny}
                disabled={processing || !feedback.trim()}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? 'Denying...' : 'Deny & Send Feedback'}
              </button>
              <button
                onClick={() => {
                  setShowDenyModal(false);
                  setFeedback('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default function ReviewRedemptions() {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPendingRedemptions();
  }, []);

  const fetchPendingRedemptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/redemptions/pending');
      setRedemptions(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching pending redemptions:', err);
      setError('Failed to load pending redemptions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (redemptionId) => {
    try {
      await api.put(`/redemptions/${redemptionId}/approve`);
      
      // Remove from list
      setRedemptions(prev => prev.filter(r => r.redemption_id !== redemptionId));
      
      setSuccessMessage('Redemption approved! Points deducted from child.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error approving redemption:', err);
      alert(err.response?.data?.message || 'Failed to approve redemption');
    }
  };

  const handleDeny = async (redemptionId, feedback) => {
    try {
      await api.put(`/redemptions/${redemptionId}/deny`, {
        denial_reason: feedback
      });
      
      // Remove from list
      setRedemptions(prev => prev.filter(r => r.redemption_id !== redemptionId));
      
      setSuccessMessage('Redemption denied. Feedback sent to child.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error denying redemption:', err);
      alert(err.response?.data?.message || 'Failed to deny redemption');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading redemption requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/parent/rewards"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Rewards
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Review Redemption Requests</h1>
        <p className="text-gray-600 mt-2">
          Approve or deny reward redemption requests from your children
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{redemptions.length}</p>
            <p className="text-sm text-gray-600">Pending Requests</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">
              {redemptions.reduce((sum, r) => sum + (r.points_required || 0), 0)}
            </p>
            <p className="text-sm text-gray-600">Total Points Requested</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {new Set(redemptions.map(r => r.child_id)).size}
            </p>
            <p className="text-sm text-gray-600">Children Waiting</p>
          </div>
        </div>
      </div>

      {/* Redemptions List */}
      {redemptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600 mb-6">
            No pending redemption requests to review at the moment.
          </p>
          <Link
            to="/parent/rewards"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Back to Rewards
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {redemptions.map(redemption => (
            <RedemptionCard
              key={redemption.redemption_id}
              redemption={redemption}
              onApprove={handleApprove}
              onDeny={handleDeny}
            />
          ))}
        </div>
      )}

      {/* Quick Tips */}
      {redemptions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 Review Tips</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Verify the child has enough points before approving</li>
            <li>• Provide clear feedback when denying to help children understand</li>
            <li>• Approved redemptions immediately deduct points</li>
            <li>• Consider reward availability before approving multiple requests</li>
            <li>• Denied requests return points to the child</li>
          </ul>
        </div>
      )}
    </div>
  );
}
