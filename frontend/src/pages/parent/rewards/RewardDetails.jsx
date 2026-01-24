import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../../services/api';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Gift,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  FileText,
  RefreshCw,
  Hash,
  TrendingUp,
  XCircle
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const config = {
    available: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Available', icon: CheckCircle },
    unavailable: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Unavailable', icon: XCircle }
  };
  
  const { color, label, icon: Icon } = config[status] || config.available;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${color}`}>
      <Icon className="w-4 h-4 mr-1" />
      {label}
    </span>
  );
};

const RedemptionCard = ({ redemption }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-50 border-yellow-200 text-yellow-800', label: 'Pending', icon: Clock },
    approved: { color: 'bg-green-50 border-green-200 text-green-800', label: 'Approved', icon: CheckCircle },
    denied: { color: 'bg-red-50 border-red-200 text-red-800', label: 'Denied', icon: XCircle },
    cancelled: { color: 'bg-gray-50 border-gray-200 text-gray-800', label: 'Cancelled', icon: XCircle }
  };
  
  const status = statusConfig[redemption.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  
  return (
    <div className={`p-4 rounded-lg border-2 ${status.color}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span className="font-medium">{redemption.child_name || redemption.user_name || 'Unknown'}</span>
        </div>
        <div className="flex items-center space-x-1 text-sm">
          <StatusIcon className="w-4 h-4" />
          <span>{status.label}</span>
        </div>
      </div>
      
      {redemption.requested_at && (
        <p className="text-sm text-gray-600">
          Requested: {new Date(redemption.requested_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      )}
      
      {redemption.reviewed_at && (
        <p className="text-sm text-gray-600">
          Reviewed: {new Date(redemption.reviewed_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      )}
      
      {redemption.review_notes && (
        <p className="text-sm text-gray-700 mt-2 italic">
          Note: "{redemption.review_notes}"
        </p>
      )}
      
      <p className="text-sm font-medium text-gray-900 mt-2">
        {redemption.points_spent || 0} points spent
      </p>
    </div>
  );
};

export default function RewardDetails() {
  const { rewardId } = useParams();
  const navigate = useNavigate();
  
  const [reward, setReward] = useState(null);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchRewardDetails();
  }, [rewardId]);

  const fetchRewardDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📤 Fetching reward details:', rewardId);
      
      // Fetch reward details
      const rewardRes = await api.get(`/rewards/${rewardId}`);
      const rewardData = rewardRes.data.data?.reward || rewardRes.data.data || rewardRes.data;
      
      console.log('✅ Reward loaded:', rewardData);
      setReward(rewardData);
      
      // Fetch redemptions for this reward
      try {
        const redemptionsRes = await api.get(`/redemptions?reward_id=${rewardId}`);
        const redemptionsData = redemptionsRes.data.data?.redemptions || 
                                redemptionsRes.data.data || 
                                redemptionsRes.data.redemptions || 
                                [];
        
        console.log('✅ Redemptions loaded:', redemptionsData.length);
        setRedemptions(redemptionsData);
      } catch (err) {
        console.warn('No redemptions found or error fetching redemptions:', err);
        setRedemptions([]);
      }
      
    } catch (err) {
      console.error('❌ Error fetching reward details:', err);
      setError(err.response?.data?.message || 'Failed to load reward details');
    } finally {
      setLoading(false);
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
      alert(err.response?.data?.message || 'Failed to delete reward');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading reward details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">{error}</p>
            <button
              onClick={fetchRewardDetails}
              className="text-sm underline mt-1 hover:text-red-900"
            >
              Try again
            </button>
          </div>
        </div>
        <Link
          to="/parent/rewards"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Rewards
        </Link>
      </div>
    );
  }

  if (!reward) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          Reward not found
        </div>
        <Link
          to="/parent/rewards"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Rewards
        </Link>
      </div>
    );
  }

  // Calculate statistics
  const quantityRedeemed = reward.quantity_redeemed || 0;
  const quantityAvailable = reward.quantity_available || 0;
  const remaining = quantityAvailable - quantityRedeemed;
  const redemptionRate = quantityAvailable > 0 
    ? Math.round((quantityRedeemed / quantityAvailable) * 100) 
    : 0;

  const pendingRedemptions = redemptions.filter(r => r.status === 'pending').length;
  const approvedRedemptions = redemptions.filter(r => r.status === 'approved').length;
  const deniedRedemptions = redemptions.filter(r => r.status === 'denied').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/parent/rewards"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Rewards
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {reward.reward_name}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={reward.status} />
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 border border-primary-200">
                <Award className="w-4 h-4 mr-1" />
                {reward.points_required} points
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Link
              to={`/parent/rewards/edit/${rewardId}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Reward Details Card */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-4">
          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Description
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {reward.description || 'No description provided'}
            </p>
          </div>

          {/* Reward Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            {/* Points Required */}
            <div className="flex items-center text-gray-600">
              <Award className="w-5 h-5 mr-2 text-primary-500" />
              <div>
                <p className="text-sm text-gray-500">Points Required</p>
                <p className="font-medium text-primary-600 text-lg">{reward.points_required} points</p>
              </div>
            </div>

            {/* Quantity Available */}
            <div className="flex items-center text-gray-600">
              <Hash className="w-5 h-5 mr-2 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Quantity</p>
                <p className="font-medium text-gray-900">
                  {remaining} / {quantityAvailable} available
                </p>
              </div>
            </div>

            {/* Created Date */}
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-2 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium text-gray-900">
                  {new Date(reward.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Redemption Rate */}
            <div className="flex items-center text-gray-600">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Redemption Rate</p>
                <p className="font-medium text-blue-600">{redemptionRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{quantityRedeemed}</p>
          <p className="text-sm text-gray-600">Total Redeemed</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{pendingRedemptions}</p>
          <p className="text-sm text-gray-600">Pending</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{approvedRedemptions}</p>
          <p className="text-sm text-gray-600">Approved</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{deniedRedemptions}</p>
          <p className="text-sm text-gray-600">Denied</p>
        </div>
      </div>

      {/* Redemptions Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Gift className="w-5 h-5 mr-2" />
            Redemption History ({redemptions.length})
          </h2>
          {pendingRedemptions > 0 && (
            <Link
              to="/parent/rewards/redemptions"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Review Pending →
            </Link>
          )}
        </div>
        
        <div className="p-6">
          {redemptions.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No redemptions yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Children can redeem this reward when they have enough points
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {redemptions.map(redemption => (
                <RedemptionCard 
                  key={redemption.redemption_id} 
                  redemption={redemption}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Availability Progress Bar */}
      {quantityAvailable > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Availability</span>
            <span className="text-sm text-gray-600">
              {remaining} remaining out of {quantityAvailable}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                remaining > quantityAvailable * 0.5 ? 'bg-green-500' :
                remaining > quantityAvailable * 0.2 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${(remaining / quantityAvailable) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Reward</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "<strong>{reward.reward_name}</strong>"?
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This will permanently delete:
              </p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1 ml-4">
                <li>• The reward from the catalog</li>
                <li>• {redemptions.length} redemption record(s)</li>
                {pendingRedemptions > 0 && (
                  <li className="font-medium">• {pendingRedemptions} pending request(s) will be cancelled</li>
                )}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Reward'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
