import { useState, useEffect } from 'react';
import { redemptionAPI } from '../../../services/api';
import { Gift, Clock, CheckCircle, XCircle, Star, Calendar, Filter, ChevronDown } from 'lucide-react';

const MyRedemptions = () => {
  const [redemptions, setRedemptions] = useState([]);
  const [filteredRedemptions, setFilteredRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRedemptions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [redemptions, statusFilter]);

  const fetchRedemptions = async () => {
    try {
      setLoading(true);
      const response = await redemptionAPI.getMyRedemptions();
      setRedemptions(response.data.redemptions || []);
    } catch (error) {
      console.error('Failed to fetch redemptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...redemptions];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.requested_at) - new Date(a.requested_at));

    setFilteredRedemptions(filtered);
  };

  const calculateStats = () => {
    const approved = redemptions.filter(r => r.status === 'approved');
    const pending = redemptions.filter(r => r.status === 'pending');
    const denied = redemptions.filter(r => r.status === 'denied');
    const totalSpent = approved.reduce((sum, r) => sum + (r.points_spent || 0), 0);

    return {
      total: redemptions.length,
      approved: approved.length,
      pending: pending.length,
      denied: denied.length,
      totalSpent
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Redemptions 🎁</h1>
          <p className="text-gray-600">Track your reward requests and history</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Gift}
            label="Total Requests"
            value={stats.total}
            color="purple"
          />
          <StatCard
            icon={CheckCircle}
            label="Approved"
            value={stats.approved}
            color="green"
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={stats.pending}
            color="yellow"
          />
          <StatCard
            icon={Star}
            label="Points Spent"
            value={stats.totalSpent}
            color="orange"
          />
        </div>

        {/* Motivational Message */}
        {stats.approved >= 3 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl text-white">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎉</div>
              <div>
                <p className="font-bold text-lg">You're on a roll!</p>
                <p className="text-sm opacity-90">
                  You've redeemed {stats.approved} rewards! Keep earning those points!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-between w-full md:w-auto gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter by Status
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {showFilters && (
            <div className="mt-4 flex gap-2 flex-wrap">
              <StatusButton label="All" active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
              <StatusButton label="Pending" active={statusFilter === 'pending'} onClick={() => setStatusFilter('pending')} />
              <StatusButton label="Approved" active={statusFilter === 'approved'} onClick={() => setStatusFilter('approved')} />
              <StatusButton label="Denied" active={statusFilter === 'denied'} onClick={() => setStatusFilter('denied')} />
            </div>
          )}
        </div>

        {/* Redemptions List */}
        {filteredRedemptions.length > 0 ? (
          <div className="space-y-4">
            {filteredRedemptions.map(redemption => (
              <RedemptionCard key={redemption.redemption_id} redemption={redemption} />
            ))}
          </div>
        ) : (
          <EmptyState statusFilter={statusFilter} />
        )}
      </div>
    </div>
  );
};

// Sub-components
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-orange-500',
    orange: 'from-orange-500 to-red-500'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 text-white`}>
      <Icon className="w-6 h-6 mb-2 opacity-80" />
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm opacity-90">{label}</p>
    </div>
  );
};

const StatusButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
      active
        ? 'bg-purple-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {label}
  </button>
);

const RedemptionCard = ({ redemption }) => {
  const getStatusInfo = () => {
    switch (redemption.status) {
      case 'approved':
        return {
          icon: CheckCircle,
          text: 'Approved',
          color: 'bg-green-100 text-green-700 border-green-500',
          bgColor: 'bg-green-50'
        };
      case 'denied':
        return {
          icon: XCircle,
          text: 'Denied',
          color: 'bg-red-100 text-red-700 border-red-500',
          bgColor: 'bg-red-50'
        };
      default:
        return {
          icon: Clock,
          text: 'Pending Review',
          color: 'bg-yellow-100 text-yellow-700 border-yellow-500',
          bgColor: 'bg-yellow-50'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${statusInfo.color.split(' ')[2]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-gray-900">
              {redemption.reward_name}
            </h3>
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color.split('border-')[0]}`}>
              <StatusIcon className="w-4 h-4" />
              {statusInfo.text}
            </span>
          </div>
          <p className="text-gray-600 text-sm">{redemption.reward_description}</p>
        </div>
        
        <div className="ml-4 text-right">
          <div className="flex items-center gap-1 text-yellow-500 font-bold text-xl">
            {redemption.points_spent}
            <Star className="w-5 h-5" fill="currentColor" />
          </div>
          <p className="text-xs text-gray-500">points</p>
        </div>
      </div>

      {/* Request Info */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          Requested: {new Date(redemption.requested_at).toLocaleDateString()}
        </span>
        {redemption.reviewed_at && (
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Reviewed: {new Date(redemption.reviewed_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Feedback */}
      {redemption.feedback && (
        <div className={`p-4 rounded-lg ${statusInfo.bgColor}`}>
          <p className={`font-medium mb-1 ${statusInfo.color.split(' ')[1]}`}>
            💬 Parent Feedback:
          </p>
          <p className={`text-sm ${statusInfo.color.split(' ')[1]}`}>
            {redemption.feedback}
          </p>
        </div>
      )}

      {/* Pending Message */}
      {redemption.status === 'pending' && !redemption.feedback && (
        <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          ⏳ Your parent is reviewing your request. Check back soon!
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ statusFilter }) => {
  let message = 'No redemptions yet';
  let subMessage = 'Start earning points to redeem rewards!';

  if (statusFilter === 'pending') {
    message = 'No pending requests';
    subMessage = 'Your requests have been reviewed';
  } else if (statusFilter === 'approved') {
    message = 'No approved rewards yet';
    subMessage = 'Keep completing tasks to earn rewards!';
  } else if (statusFilter === 'denied') {
    message = 'No denied requests';
    subMessage = "You're doing great! 🎉";
  }

  return (
    <div className="text-center py-16 bg-white rounded-xl">
      <Gift className="w-20 h-20 mx-auto text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{message}</h3>
      <p className="text-gray-500">{subMessage}</p>
    </div>
  );
};

export default MyRedemptions;
