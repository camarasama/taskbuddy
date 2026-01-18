import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rewardAPI, redemptionAPI, pointsAPI } from '../../../services/api';
import { ArrowLeft, Star, Gift, AlertCircle, CheckCircle, Sparkles, Lock } from 'lucide-react';

const RewardDetails = () => {
  const { rewardId } = useParams();
  const navigate = useNavigate();
  const [reward, setReward] = useState(null);
  const [myPoints, setMyPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, [rewardId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rewardRes, pointsRes] = await Promise.all([
        rewardAPI.getById(rewardId),
        pointsAPI.getMyBalance()
      ]);
      
      setReward(rewardRes.data.reward);
      setMyPoints(pointsRes.data.balance);
    } catch (error) {
      console.error('Failed to fetch reward:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    try {
      setRedeeming(true);
      await redemptionAPI.create({ reward_id: rewardId });
      
      setSuccess(true);
      setShowConfirmModal(false);
      
      // Navigate after celebration
      setTimeout(() => {
        navigate('/child/redemptions', {
          state: { success: 'Reward requested successfully! 🎉' }
        });
      }, 2500);
    } catch (error) {
      console.error('Failed to redeem reward:', error);
      alert(error.response?.data?.message || 'Failed to redeem reward');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!reward) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reward Not Found</h2>
          <button
            onClick={() => navigate('/child/rewards')}
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Rewards
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center animate-bounce-in">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-16 h-16 text-white" />
          </div>
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Reward Requested!
          </h2>
          <p className="text-gray-600 mb-4">
            Your parent will review your request soon!
          </p>
          <div className="text-4xl">⭐</div>
        </div>
      </div>
    );
  }

  const canAfford = myPoints >= reward.points_required;
  const isAvailable = reward.quantity_available === null || reward.quantity_available > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/child/rewards')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Rewards
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Hero Section */}
          <div className={`h-64 bg-gradient-to-br ${
            canAfford 
              ? 'from-purple-400 to-pink-400' 
              : 'from-gray-300 to-gray-400'
          } flex items-center justify-center relative`}>
            <div className="text-8xl">{reward.icon || '🎁'}</div>
            
            {!canAfford && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-center text-white">
                  <Lock className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-lg font-semibold">Locked</p>
                </div>
              </div>
            )}

            {canAfford && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                You can afford this!
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {reward.reward_name}
            </h1>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              {reward.description}
            </p>

            {/* Points Comparison */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Points Required</p>
                  <p className="text-3xl font-bold text-yellow-600 flex items-center gap-2">
                    {reward.points_required}
                    <Star className="w-8 h-8" fill="currentColor" />
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Your Points</p>
                  <p className={`text-3xl font-bold flex items-center gap-2 ${
                    canAfford ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {myPoints}
                    <Star className="w-8 h-8" fill="currentColor" />
                  </p>
                </div>
              </div>

              {!canAfford && (
                <div className="mt-4 pt-4 border-t border-orange-200">
                  <p className="text-sm text-gray-600 mb-2">
                    You need {reward.points_required - myPoints} more points
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min((myPoints / reward.points_required) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Availability */}
            {reward.quantity_available !== null && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-900">
                  <strong>Availability:</strong>{' '}
                  {reward.quantity_available > 0 
                    ? `${reward.quantity_available} left` 
                    : 'Currently unavailable'}
                </p>
              </div>
            )}

            {/* Action Button */}
            {canAfford && isAvailable ? (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
              >
                Redeem This Reward 🎁
              </button>
            ) : (
              <button
                disabled
                className="w-full py-4 bg-gray-200 text-gray-500 rounded-xl font-bold text-lg cursor-not-allowed"
              >
                {!isAvailable ? 'Currently Unavailable' : 'Not Enough Points'}
              </button>
            )}

            {/* Info Box */}
            <div className="mt-6 p-4 bg-purple-50 rounded-xl">
              <h3 className="font-semibold text-purple-900 mb-2">
                📌 How Redemption Works:
              </h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Click "Redeem This Reward" to request it</li>
                <li>• Your parent will review your request</li>
                <li>• Points are held until approved</li>
                <li>• Once approved, you'll receive your reward!</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full animate-scale-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-10 h-10 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Confirm Redemption
                </h2>
                <p className="text-gray-600">
                  Are you sure you want to redeem "{reward.reward_name}"?
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-yellow-900">
                  <strong>{reward.points_required}</strong> points will be deducted from your balance.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={redeeming}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRedeem}
                  disabled={redeeming}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                >
                  {redeeming ? 'Redeeming...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardDetails;
