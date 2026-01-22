import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import StatCard from '../../components/admin/StatCard';
import ActivityLog from '../../components/admin/ActivityLog';
import {
  Users,
  UserCheck,
  Home,
  CheckSquare,
  Gift,
  TrendingUp,
  AlertCircle,
  Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalFamilies: 0,
    totalTasks: 0,
    totalRewards: 0,
    systemHealth: 100
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const statsRes = await adminApi.getDashboardStats();
      setStats(statsRes.data || {});

      // Fetch activity log
      const activityRes = await adminApi.getActivityLog({ limit: 10 });
      setActivities(activityRes.data || []);

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">System overview and management</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats.totalUsers || 0}
          subtitle={`${stats.activeUsers || 0} active`}
          color="text-blue-600"
          bgColor="bg-blue-50"
          trend={stats.userGrowth}
          link="/admin/users"
        />

        <StatCard
          icon={Home}
          title="Total Families"
          value={stats.totalFamilies || 0}
          subtitle="Registered families"
          color="text-purple-600"
          bgColor="bg-purple-50"
          trend={stats.familyGrowth}
          link="/admin/families"
        />

        <StatCard
          icon={CheckSquare}
          title="Tasks Created"
          value={stats.totalTasks || 0}
          subtitle={`${stats.completedTasks || 0} completed`}
          color="text-green-600"
          bgColor="bg-green-50"
        />

        <StatCard
          icon={Gift}
          title="Rewards Available"
          value={stats.totalRewards || 0}
          subtitle={`${stats.redeemedRewards || 0} redeemed`}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users (24h)</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.activeUsersToday || 0}
              </p>
            </div>
            <UserCheck className="w-10 h-10 text-green-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">
              {stats.activeUsersTrend || 0}%
            </span>
            <span className="text-gray-500 ml-2">from yesterday</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasks Completed (7d)</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.tasksCompletedWeek || 0}
              </p>
            </div>
            <CheckSquare className="w-10 h-10 text-blue-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Activity className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-gray-500">
              {stats.avgTasksPerDay || 0} per day
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.systemHealth || 100}%
              </p>
            </div>
            <Activity className="w-10 h-10 text-green-600" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${stats.systemHealth || 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <ActivityLog
        activities={activities}
        loading={false}
        limit={10}
        showViewAll={true}
        onViewAll={() => {/* Navigate to full activity log */}}
      />

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/users"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <Users className="w-6 h-6 text-primary-600 mb-2" />
            <h3 className="font-medium text-gray-900">Manage Users</h3>
            <p className="text-sm text-gray-600 mt-1">
              View and manage all user accounts
            </p>
          </Link>

          <Link
            to="/admin/families"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <Home className="w-6 h-6 text-primary-600 mb-2" />
            <h3 className="font-medium text-gray-900">Manage Families</h3>
            <p className="text-sm text-gray-600 mt-1">
              View and manage family groups
            </p>
          </Link>

          <button
            onClick={fetchDashboardData}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
          >
            <Activity className="w-6 h-6 text-primary-600 mb-2" />
            <h3 className="font-medium text-gray-900">Refresh Data</h3>
            <p className="text-sm text-gray-600 mt-1">
              Update dashboard statistics
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
