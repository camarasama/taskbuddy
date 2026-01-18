import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rewardAPI, pointsAPI } from '../../../services/api';
import { Gift, Star, Search, Lock, Sparkles, TrendingUp } from 'lucide-react';

const RewardCatalog = () => {
  const [rewards, setRewards] = useState([]);
  const [filteredRewards, setFilteredRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myPoints, setMyPoints] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rewards, searchTerm, filter, myPoints]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rewardsRes, pointsRes] = await Promise.all([
        rewardAPI.getAll({ status: 'available' }),
        pointsAPI.getMyBalance()
      ]);
      
      setRewards(rewardsRes.data.rewards || []);
      setMyPoints(pointsRes.data.balance || 0);
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rewards];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(reward =>
        reward.reward_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Affordability filter
    if (filter === 'affordable') {
      filtered = filtered.filter(reward => myPoints >= reward.points_required);
    } else if (filter === 'locked') {
      filtered = filtered.filter(reward => myPoints < reward.points_required);
    }

    // Sort by points (low to high)
    filtered.sort((a, b) => a.points_required - b.points_required);
    
    setFilteredRewards(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reward Catalog 🎁</h1>
          <p className="text-gray-600">Spend your points on awesome rewards!</p>
        </div>

        {/* Points Balance Card */}
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl p-6 mb-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Your Points</p>
              <p className="text-4xl md:text-5xl font-bold flex items-center gap-2">
                {myPoints}
                <Star className="w-10 h-10" fill="white" />
              </p>
              <p className="text-sm opacity-90 mt-2">
                {filteredRewards.filter(r => myPoints >= r.points_required).length} rewards available!
              </p>
            </div>
            <Sparkles className="w-16 h-16 opacity-30" />
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search rewards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <FilterButton 
                label="All" 
                active={filter === 'all'} 
                onClick={() => setFilter('all')} 
              />
              <FilterButton 
                label="Can Afford" 
                active={filter === 'affordable'} 
                onClick={() => setFilter('affordable')} 
              />
              <FilterButton 
                label="Locked" 
                active={filter === 'locked'} 
                onClick={() => setFilter('locked')} 
              />
            </div>
          </div>
        </div>

        {/* Rewards Grid */}
        {filteredRewards.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map(reward => (
              <RewardCard 
                key={reward.reward_id} 
                reward={reward} 
                myPoints={myPoints} 
              />
            ))}
          </div>
        ) : (
          <EmptyState searchTerm={searchTerm} filter={filter} />
        )}
      </div>
    </div>
  );
};

// Sub-components
const FilterButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
      active
        ? 'bg-purple-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {label}
  </button>
);

const RewardCard = ({ reward, myPoints }) => {
  const canAfford = myPoints >= reward.points_required;
  const progressPercentage = Math.min((myPoints / reward.points_required) * 100, 100);

  return (
    <Link
      to={`/child/rewards/${reward.reward_id}`}
      className={`block bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl hover:scale-105 ${
        !canAfford ? 'opacity-75' : ''
      }`}
    >
      {/* Reward Image/Icon */}
      <div className={`h-48 bg-gradient-to-br ${
        canAfford 
          ? 'from-purple-400 to-pink-400' 
          : 'from-gray-300 to-gray-400'
      } flex items-center justify-center relative overflow-hidden`}>
        <div className="text-6xl">
          {reward.icon || '🎁'}
        </div>
        
        {!canAfford && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Lock className="w-12 h-12 text-white" />
          </div>
        )}
        
        {canAfford && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            You can get this!
          </div>
        )}
      </div>
      
      {/* Reward Details */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {reward.reward_name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {reward.description}
        </p>
        
        {/* Points and Availability */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-yellow-500 font-bold text-xl">
            {reward.points_required}
            <Star className="w-5 h-5" fill="currentColor" />
          </div>
          {reward.quantity_available !== null && reward.quantity_available > 0 && (
            <span className="text-sm text-gray-500">
              {reward.quantity_available} left
            </span>
          )}
        </div>

        {/* Progress Bar (if locked) */}
        {!canAfford && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Your progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {reward.points_required - myPoints} more points needed
            </p>
          </div>
        )}

        {/* Action Button */}
        <button className={`w-full py-3 rounded-lg font-bold transition-colors ${
          canAfford
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}>
          {canAfford ? 'View Details' : 'Locked'}
        </button>
      </div>
    </Link>
  );
};

const EmptyState = ({ searchTerm, filter }) => {
  let message = 'No rewards found';
  let subMessage = 'Check back later for new rewards!';

  if (searchTerm) {
    message = 'No rewards match your search';
    subMessage = 'Try different keywords';
  } else if (filter === 'affordable') {
    message = 'No affordable rewards yet';
    subMessage = 'Keep earning points to unlock rewards! 💪';
  } else if (filter === 'locked') {
    message = 'All rewards are affordable!';
    subMessage = 'Great job! You can get any reward! 🎉';
  }

  return (
    <div className="text-center py-16 bg-white rounded-xl">
      <Gift className="w-20 h-20 mx-auto text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{message}</h3>
      <p className="text-gray-500">{subMessage}</p>
    </div>
  );
};

export default RewardCatalog;
