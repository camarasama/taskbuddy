import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import { Users, Plus, Settings, Mail, Calendar, Award, Crown, User } from 'lucide-react';

const RoleBadge = ({ role }) => {
  const roleConfig = {
    parent: { color: 'bg-blue-100 text-blue-800', icon: Crown, label: 'Parent' },
    spouse: { color: 'bg-purple-100 text-purple-800', icon: User, label: 'Spouse' },
    child: { color: 'bg-green-100 text-green-800', icon: User, label: 'Child' }
  };

  const config = roleConfig[role] || roleConfig.child;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

const FamilyMemberCard = ({ member }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {member.profile_picture ? (
            <img
              src={member.profile_picture}
              alt={member.full_name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-xl font-semibold text-primary-600">
                {getInitials(member.full_name)}
              </span>
            </div>
          )}
        </div>

        {/* Member Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {member.full_name}
            </h3>
            <RoleBadge role={member.role} />
          </div>

          <div className="mt-2 space-y-1">
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              {member.email}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              Joined {new Date(member.joined_at).toLocaleDateString()}
            </div>
            {member.role === 'child' && member.total_points !== undefined && (
              <div className="flex items-center text-sm text-gray-600">
                <Award className="w-4 h-4 mr-2" />
                {member.total_points} points
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="mt-3">
            {member.email_verified ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending Verification
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats for Children */}
      {member.role === 'child' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{member.tasks_completed || 0}</p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{member.active_tasks || 0}</p>
              <p className="text-xs text-gray-600">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{member.rewards_redeemed || 0}</p>
              <p className="text-xs text-gray-600">Rewards</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function FamilyOverview() {
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    try {
      setLoading(true);

      // Fetch family details
      const familyRes = await api.get('/families/my-family');
      setFamily(familyRes.data.data);

      // Fetch family members
      const membersRes = await api.get('/families/members');
      setMembers(membersRes.data.data || []);

      setError(null);
    } catch (err) {
      console.error('Error fetching family data:', err);
      setError(err.response?.data?.message || 'Failed to load family data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading family...</p>
        </div>
      </div>
    );
  }

  const children = members.filter(m => m.role === 'child');
  const parents = members.filter(m => m.role === 'parent' || m.role === 'spouse');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Family Management</h1>
          <p className="text-gray-600 mt-2">Manage your family members and settings</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/parent/family/add"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Member
          </Link>
          <Link
            to="/parent/family/settings"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Settings className="w-5 h-5 mr-2" />
            Settings
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Family Info Card */}
      {family && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{family.family_name}</h2>
              <p className="mt-2 text-primary-100">
                Family Code: <span className="font-mono font-bold">{family.family_code}</span>
              </p>
              <p className="mt-1 text-sm text-primary-100">
                Created on {new Date(family.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{members.length}</p>
              <p className="text-primary-100">Total Members</p>
            </div>
          </div>
        </div>
      )}

      {/* Parents & Spouse Section */}
      {parents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Crown className="w-5 h-5 mr-2 text-primary-600" />
            Parents & Guardians
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {parents.map(member => (
              <FamilyMemberCard key={member.user_id} member={member} />
            ))}
          </div>
        </div>
      )}

      {/* Children Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-green-600" />
          Children ({children.length})
        </h2>
        {children.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No children added yet</h3>
            <p className="text-gray-600 mb-6">
              Start by adding your first child to begin managing tasks and rewards
            </p>
            <Link
              to="/parent/family/add"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Child
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map(member => (
              <FamilyMemberCard key={member.user_id} member={member} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
