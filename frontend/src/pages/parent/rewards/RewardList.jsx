import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import {
  Plus,
  Search,
  Gift,
  Award,
  CheckCircle,
  XCircle,
  Users,
  Filter
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const config = {
    available: { color: 'bg-green-100 text-green-800', label: 'Available' },
    unavailable: { color: 'bg-gray-100 text-gray-800', label: 'Unavailable' }
  };

  const { color, label } = config[status] || config.available;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

const RewardCard = ({ reward }) => {
  const quantityPercent = reward.quantity_available > 0
    ? ((reward.quantity_available - reward.quantity_redeemed) / reward.quantity_available) * 100
    : 0;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Gift className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">{reward.reward_name}</h3>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{reward.description}</p>
        </div>
        <StatusBadge status={reward.status} />
      </div>

      {/* Points Required */}
      <div className="mb-4 p-3 bg-primary-50 rounded-lg">
        <div className="flex items-center justify-center">
          <Award className="w-5 h-5 text-primary-600 mr-2" />
          <span className="text-2xl font-bold text-primary-600">
            {reward.points_required}
          </span>
          <span className="text-sm text-primary-600 ml-1">points</span>
        </div>
      </div>

      {/* Quantity */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Quantity Available</span>
          <span className="font-medium text-gray-900">
            {reward.quantity_available - reward.quantity_redeemed} / {reward.quantity_available}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              quantityPercent > 50 ? 'bg-green-500' :
              quantityPercent > 20 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${quantityPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{reward.total_redemptions || 0}</p>
          <p className="text-xs text-gray-600">Total Redeemed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{reward.pending_redemptions || 0}</p>
          <p className="text-xs text-gray-600">Pending Requests</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          to={`/parent/rewards/edit/${reward.reward_id}`}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-primary-600 rounded-md shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-primary-50"
        >
          Edit Reward
        </Link>
      </div>
    </div>
  );
};

export default function RewardList() {
  const [rewards, setRewards] = useState([]);
  const [filteredRewards, setFilteredRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRewards();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rewards, searchQuery, statusFilter]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rewards');
      const rewardsData = response.data.data || [];
      
      setRewards(rewardsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching rewards:', err);
      setError('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rewards];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(reward =>
        reward.reward_name.toLowerCase().includes(query) ||
        reward.description?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(reward => reward.status === statusFilter);
    }

    setFilteredRewards(filtered);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading rewards...</p>
        </div>
      </div>
    );
  }

  const availableRewards = rewards.filter(r => r.status === 'available').length;
  const totalPoints = rewards.reduce((sum, r) => sum + r.points_required, 0);
  const totalRedemptions = rewards.reduce((sum, r) => sum + (r.total_redemptions || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reward Catalog</h1>
          <p className="text-gray-600 mt-2">Create and manage rewards for your children</p>
        </div>
        <Link
          to="/parent/rewards/create"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Reward
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rewards</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{rewards.length}</p>
            </div>
            <Gift className="w-10 h-10 text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{availableRewards}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Points</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">{totalPoints}</p>
            </div>
            <Award className="w-10 h-10 text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Redeemed</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{totalRedemptions}</p>
            </div>
            <Users className="w-10 h-10 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </h2>
          <button
            onClick={resetFilters}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search rewards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredRewards.length} of {rewards.length} rewards
        </p>
        <Link
          to="/parent/rewards/redemptions"
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          View Pending Redemptions →
        </Link>
      </div>

      {/* Rewards Grid */}
      {filteredRewards.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {rewards.length === 0 ? 'No rewards yet' : 'No rewards match your filters'}
          </h3>
          <p className="text-gray-600 mb-6">
            {rewards.length === 0 
              ? 'Create your first reward to motivate your children'
              : 'Try adjusting your filters to see more rewards'
            }
          </p>
          {rewards.length === 0 && (
            <Link
              to="/parent/rewards/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Reward
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map(reward => (
            <RewardCard key={reward.reward_id} reward={reward} />
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Reward Management Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Set point values based on reward desirability</li>
          <li>• Keep some rewards always available, make others limited</li>
          <li>• Update quantities regularly to maintain excitement</li>
          <li>• Use unavailable status for seasonal or special rewards</li>
        </ul>
      </div>
    </div>
  );
}
