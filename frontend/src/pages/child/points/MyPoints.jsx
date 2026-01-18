import { useState, useEffect } from 'react';
import { pointsAPI } from '../../../services/api';
import { Star, TrendingUp, Award, Calendar, Gift, CheckCircle } from 'lucide-react';

const MyPoints = () => {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balanceRes, historyRes] = await Promise.all([
        pointsAPI.getMyBalance(),
        pointsAPI.getMyHistory()
      ]);
      
      setBalance(balanceRes.data.balance || 0);
      setHistory(historyRes.data.history || []);
    } catch (error) {
      console.error('Failed to fetch points data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredHistory = () => {
    if (timeFilter === 'all') return history;
    
    const now = new Date();
    let startDate = new Date();
    
    switch (timeFilter) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        return history;
    }
    
    return history.filter(item => new Date(item.created_at) >= startDate);
  };

  const calculateStats = () => {
    const earned = history.filter(h => h.points_change > 0);
    const spent = history.filter(h => h.points_change < 0);
    
    const totalEarned = earned.reduce((sum, h) => sum + h.points_change, 0);
    const totalSpent = Math.abs(spent.reduce((sum, h) => sum + h.points_change, 0));
    
    // Calculate average per week
    const oldestDate = history.length > 0 ? new Date(history[history.length - 1].created_at) : new Date();
    const weeksSinceStart = Math.max(1, Math.ceil((new Date() - oldestDate) / (1000 * 60 * 60 * 24 * 7)));
    const avgPerWeek = Math.round(totalEarned / weeksSinceStart);

    // Get best day
    const pointsByDate = {};
    earned.forEach(h => {
      const date = new Date(h.created_at).toLocaleDateString();
      pointsByDate[date] = (pointsByDate[date] || 0) + h.points_change;
    });
    const bestDay = Object.entries(pointsByDate).sort((a, b) => b[1] - a[1])[0];

    return {
      totalEarned,
      totalSpent,
      avgPerWeek,
      bestDay: bestDay ? { date: bestDay[0], points: bestDay[1] } : null,
      tasksCompleted: earned.length,
      rewardsRedeemed: spent.length
    };
  };

  const filteredHistory = getFilteredHistory();
  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Points 💰</h1>
          <p className="text-gray-600">Track your earnings and spending</p>
        </div>

        {/* Points Balance - Large Display */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-8 mb-8 shadow-2xl text-white">
          <div className="text-center">
            <p className="text-xl opacity-90 mb-2">Current Balance</p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <Star className="w-16 h-16 md:w-20 md:h-20" fill="white" />
              <h2 className="text-6xl md:text-7xl font-bold">{balance}</h2>
              <Star className="w-16 h-16 md:w-20 md:h-20" fill="white" />
            </div>
            <p className="text-lg opacity-90">
              {balance >= 100 ? "You're doing amazing! 🎉" : "Keep earning to unlock rewards! 💪"}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={TrendingUp}
            label="Total Earned"
            value={stats.totalEarned}
            color="green"
          />
          <StatCard
            icon={Gift}
            label="Total Spent"
            value={stats.totalSpent}
            color="purple"
          />
          <StatCard
            icon={Award}
            label="Avg/Week"
            value={stats.avgPerWeek}
            color="blue"
          />
          <StatCard
            icon={CheckCircle}
            label="Tasks Done"
            value={stats.tasksCompleted}
            color="orange"
          />
          <StatCard
            icon={Gift}
            label="Rewards"
            value={stats.rewardsRedeemed}
            color="pink"
          />
          {stats.bestDay && (
            <StatCard
              icon={Star}
              label="Best Day"
              value={stats.bestDay.points}
              subtitle={stats.bestDay.date}
              color="yellow"
            />
          )}
        </div>

        {/* Achievements */}
        {stats.totalEarned >= 500 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🏆</div>
              <div>
                <h3 className="text-xl font-bold mb-1">Points Master!</h3>
                <p className="opacity-90">You've earned over 500 points! You're a superstar!</p>
              </div>
            </div>
          </div>
        )}

        {/* History Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Points History</h2>
            
            {/* Time Filter */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* History Timeline */}
          {filteredHistory.length > 0 ? (
            <div className="space-y-4">
              {filteredHistory.map((item, index) => (
                <HistoryItem key={index} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No activity in this time period</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-components
const StatCard = ({ icon: Icon, label, value, subtitle, color }) => {
  const colorClasses = {
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600',
    yellow: 'from-yellow-500 to-orange-500'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 md:p-6 text-white shadow-lg`}>
      <Icon className="w-6 h-6 md:w-8 md:h-8 mb-2 opacity-80" />
      <p className="text-2xl md:text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm opacity-90">{label}</p>
      {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
    </div>
  );
};

const HistoryItem = ({ item }) => {
  const isPositive = item.points_change > 0;
  
  const getIcon = () => {
    if (item.activity_type === 'task_completed') return CheckCircle;
    if (item.activity_type === 'reward_redeemed') return Gift;
    return Star;
  };

  const Icon = getIcon();

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        isPositive ? 'bg-green-100' : 'bg-red-100'
      }`}>
        <Icon className={`w-5 h-5 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{item.description}</p>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              {new Date(item.created_at).toLocaleString()}
            </div>
          </div>
          
          <div className="text-right flex-shrink-0">
            <p className={`text-xl font-bold ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? '+' : ''}{item.points_change}
            </p>
            <p className="text-xs text-gray-500">
              Balance: {item.balance_after}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPoints;
