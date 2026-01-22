import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  AlertCircle,
  CheckCircle,
  Copy,
  RefreshCw,
  User,
  Baby,
  UserCircle
} from 'lucide-react';

const RoleBadge = ({ role }) => {
  const config = {
    parent: { color: 'bg-blue-100 text-blue-800', icon: Shield, label: 'Parent' },
    spouse: { color: 'bg-purple-100 text-purple-800', icon: UserCircle, label: 'Spouse' },
    child: { color: 'bg-green-100 text-green-800', icon: Baby, label: 'Child' }
  };

  const { color, icon: Icon, label } = config[role] || config.child;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
};

const MemberCard = ({ member, onRemove, currentUserId }) => {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleRemove = async () => {
    setProcessing(true);
    await onRemove(member.user_id);
    setProcessing(false);
    setShowRemoveModal(false);
  };

  const isCurrentUser = member.user_id === currentUserId;

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
              member.role === 'parent' ? 'bg-blue-500' :
              member.role === 'spouse' ? 'bg-purple-500' :
              'bg-green-500'
            }`}>
              {member.first_name?.[0]}{member.last_name?.[0]}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                {member.first_name} {member.last_name}
                {isCurrentUser && (
                  <span className="ml-2 text-xs text-gray-500">(You)</span>
                )}
              </h3>
              <RoleBadge role={member.role} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2" />
            {member.email}
          </div>
          
          {member.role === 'child' && member.points_balance !== undefined && (
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              Points Balance: <span className="ml-1 font-medium text-primary-600">{member.points_balance}</span>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2" />
            Joined: {new Date(member.joined_at || member.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Stats for Children */}
        {member.role === 'child' && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 mb-4">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{member.tasks_completed || 0}</p>
              <p className="text-xs text-gray-600">Tasks Done</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{member.tasks_assigned || 0}</p>
              <p className="text-xs text-gray-600">Assigned</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{member.rewards_redeemed || 0}</p>
              <p className="text-xs text-gray-600">Rewards</p>
            </div>
          </div>
        )}

        {/* Actions */}
        {!isCurrentUser && member.role !== 'parent' && (
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowRemoveModal(true)}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Member
            </button>
          </div>
        )}

        {member.role === 'parent' && !isCurrentUser && (
          <div className="pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              Only parents can manage family members
            </div>
          </div>
        )}
      </div>

      {/* Remove Confirmation Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Remove Family Member</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to remove <strong>{member.first_name} {member.last_name}</strong> from the family?
            </p>

            {member.role === 'child' && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-lg text-sm mb-4">
                <p className="font-medium">⚠️ This will:</p>
                <ul className="mt-1 ml-4 list-disc text-xs space-y-1">
                  <li>Remove all their task assignments</li>
                  <li>Delete their points balance</li>
                  <li>Remove their account access</li>
                </ul>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleRemove}
                disabled={processing}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? 'Removing...' : 'Yes, Remove'}
              </button>
              <button
                onClick={() => setShowRemoveModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
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

export default function FamilyManagement() {
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [familyCode, setFamilyCode] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchFamilyData();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setCurrentUserId(response.data.data.user_id);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const fetchFamilyData = async () => {
    try {
      setLoading(true);
      
      // Fetch family info
      const familyRes = await api.get('/families');
      const families = familyRes.data.data || [];
      
      if (families.length === 0) {
        setError('No family found. Please create a family first.');
        setLoading(false);
        return;
      }

      const userFamily = families[0]; // Get first family (user's family)
      setFamily(userFamily);

      // Fetch family members
      const membersRes = await api.get(`/families/${userFamily.family_id}/members`);
      setMembers(membersRes.data.data || []);

      // Fetch family code
      try {
        const codeRes = await api.get(`/families/${userFamily.family_id}/code`);
        setFamilyCode(codeRes.data.data.invite_code);
      } catch (err) {
        console.log('Could not fetch family code:', err);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching family data:', err);
      setError('Failed to load family data');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!family) return;

    try {
      await api.delete(`/families/${family.family_id}/members/${userId}`);
      
      // Remove from state
      setMembers(prev => prev.filter(m => m.user_id !== userId));
      
      setSuccessMessage('Family member removed successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error removing member:', err);
      alert(err.response?.data?.message || 'Failed to remove family member');
    }
  };

  const handleRegenerateCode = async () => {
    if (!family) return;

    try {
      setRegenerating(true);
      const response = await api.post(`/families/${family.family_id}/code/regenerate`);
      setFamilyCode(response.data.data.invite_code);
      
      setSuccessMessage('Family code regenerated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error regenerating code:', err);
      alert('Failed to regenerate family code');
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(familyCode);
    setSuccessMessage('Family code copied to clipboard!');
    setTimeout(() => setSuccessMessage(''), 2000);
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

  const parents = members.filter(m => m.role === 'parent' || m.role === 'spouse');
  const children = members.filter(m => m.role === 'child');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Family Management</h1>
          <p className="text-gray-600 mt-2">Manage your family members and settings</p>
        </div>
        <Link
          to="/parent/family/add"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Add Member
        </Link>
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

      {/* Family Info Card */}
      {family && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {family.family_name || 'Our Family'}
            </h2>
            <button
              onClick={() => setShowCodeModal(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Copy className="w-4 h-4 mr-2" />
              Invite Code
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{members.length}</p>
              <p className="text-sm text-gray-600">Total Members</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{parents.length}</p>
              <p className="text-sm text-gray-600">Parents</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Baby className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{children.length}</p>
              <p className="text-sm text-gray-600">Children</p>
            </div>
          </div>
        </div>
      )}

      {/* Parents Section */}
      {parents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Parents & Spouses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parents.map(member => (
              <MemberCard
                key={member.user_id}
                member={member}
                onRemove={handleRemoveMember}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Children Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Children</h2>
        {children.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Baby className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No children added yet</h3>
            <p className="text-gray-600 mb-6">
              Add your first child to start assigning tasks and rewards
            </p>
            <Link
              to="/parent/family/add"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Add First Child
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map(member => (
              <MemberCard
                key={member.user_id}
                member={member}
                onRemove={handleRemoveMember}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Family Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Family Invite Code</h3>
            <p className="text-sm text-gray-600 mb-4">
              Share this code with family members so they can join your family.
            </p>

            {familyCode ? (
              <>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
                  <p className="text-3xl font-mono font-bold text-center text-primary-600">
                    {familyCode}
                  </p>
                </div>

                <div className="flex space-x-3 mb-4">
                  <button
                    onClick={handleCopyCode}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </button>
                  <button
                    onClick={handleRegenerateCode}
                    disabled={regenerating}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
                    Regenerate
                  </button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-lg text-xs mb-4">
                  <p className="font-medium">⚠️ Security Note:</p>
                  <p className="mt-1">Regenerating the code will invalidate the old code. Anyone with the old code won't be able to join.</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-600 mb-4">Loading family code...</p>
            )}

            <button
              onClick={() => setShowCodeModal(false)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Family Management Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use the invite code to add spouses or older children who can self-register</li>
          <li>• Add younger children directly through the "Add Member" button</li>
          <li>• Parents can manage all family members and settings</li>
          <li>• Spouses can create tasks and manage rewards but cannot remove other parents</li>
          <li>• Removing a child will delete all their data - use with caution!</li>
        </ul>
      </div>
    </div>
  );
}
