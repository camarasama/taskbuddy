import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  Shield,
  Edit,
  Key,
  Award,
  CheckCircle
} from 'lucide-react';

const RoleBadge = ({ role }) => {
  const config = {
    admin: { color: 'bg-red-100 text-red-800', icon: Shield, label: 'Admin' },
    parent: { color: 'bg-blue-100 text-blue-800', icon: Users, label: 'Parent' },
    spouse: { color: 'bg-purple-100 text-purple-800', icon: Users, label: 'Spouse' },
    child: { color: 'bg-green-100 text-green-800', icon: User, label: 'Child' }
  };

  const { color, icon: Icon, label } = config[role] || config.child;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </span>
  );
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // Fetch user profile
      const userRes = await api.get('/auth/me');
      setUser(userRes.data.data);

      // Fetch user stats (if child or parent)
      if (['child', 'parent', 'spouse'].includes(userRes.data.data.role)) {
        const statsRes = await api.get('/users/stats');
        setStats(statsRes.data.data);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">{error || 'Failed to load profile'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">View and manage your account information</p>
        </div>
        <Link
          to="/profile/edit"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={`${user.first_name} ${user.last_name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-primary-600">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </span>
              )}
            </div>

            {/* Name and Role */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">
                {user.first_name} {user.last_name}
              </h2>
              <div className="mt-2">
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900 mt-1">{user.email}</p>
                {user.is_email_verified ? (
                  <span className="inline-flex items-center text-xs text-green-600 mt-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs text-yellow-600 mt-1">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Not Verified
                  </span>
                )}
              </div>
            </div>

            {/* Phone */}
            {user.phone && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900 mt-1">{user.phone}</p>
                </div>
              </div>
            )}

            {/* Join Date */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Member Since</p>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Location */}
            {user.location && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-sm text-gray-900 mt-1">{user.location}</p>
                </div>
              </div>
            )}

            {/* Family */}
            {user.family_name && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Family</p>
                  <p className="text-sm text-gray-900 mt-1">{user.family_name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats (for children and parents) */}
      {stats && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {user.role === 'child' && (
                <>
                  <StatBox
                    icon={Award}
                    label="Points Balance"
                    value={stats.points_balance || 0}
                    color="text-yellow-600"
                  />
                  <StatBox
                    icon={CheckCircle}
                    label="Tasks Completed"
                    value={stats.tasks_completed || 0}
                    color="text-green-600"
                  />
                  <StatBox
                    icon={Gift}
                    label="Rewards Redeemed"
                    value={stats.rewards_redeemed || 0}
                    color="text-purple-600"
                  />
                  <StatBox
                    icon={TrendingUp}
                    label="Completion Rate"
                    value={`${stats.completion_rate || 0}%`}
                    color="text-blue-600"
                  />
                </>
              )}

              {(user.role === 'parent' || user.role === 'spouse') && (
                <>
                  <StatBox
                    icon={CheckCircle}
                    label="Tasks Created"
                    value={stats.tasks_created || 0}
                    color="text-blue-600"
                  />
                  <StatBox
                    icon={Gift}
                    label="Rewards Created"
                    value={stats.rewards_created || 0}
                    color="text-purple-600"
                  />
                  <StatBox
                    icon={Users}
                    label="Family Members"
                    value={stats.family_members || 0}
                    color="text-green-600"
                  />
                  <StatBox
                    icon={CheckCircle}
                    label="Reviews Done"
                    value={stats.reviews_done || 0}
                    color="text-yellow-600"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Security */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Security</h3>
        </div>
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Key className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Password</p>
                <p className="text-sm text-gray-600">Last changed {user.password_changed_at ? new Date(user.password_changed_at).toLocaleDateString() : 'Never'}</p>
              </div>
            </div>
            <Link
              to="/profile/change-password"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Change Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }) {
  return (
    <div className="text-center">
      <Icon className={`w-8 h-8 ${color} mx-auto mb-2`} />
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}
