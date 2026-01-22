import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import {
  Home,
  Users,
  Search,
  Eye,
  Trash2,
  Calendar,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Baby,
  Shield,
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
};

const FamilyCard = ({ family, onViewDetails, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const handleViewDetails = async () => {
    if (!expanded && members.length === 0) {
      try {
        setLoadingMembers(true);
        const response = await adminApi.getFamilyMembers(family.family_id);
        setMembers(response.data || []);
      } catch (err) {
        console.error('Error loading members:', err);
      } finally {
        setLoadingMembers(false);
      }
    }
    setExpanded(!expanded);
  };

  const parents = members.filter(m => m.role === 'parent' || m.role === 'spouse');
  const children = members.filter(m => m.role === 'child');

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      {/* Family Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Home className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {family.family_name || `Family #${family.family_id}`}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {family.member_count || 0} members
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleViewDetails}
              className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
              title="View details"
            >
              {expanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => onDelete(family)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete family"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Family Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xl font-bold text-gray-900">{family.parent_count || 0}</p>
            <p className="text-xs text-gray-600">Parents</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xl font-bold text-gray-900">{family.child_count || 0}</p>
            <p className="text-xs text-gray-600">Children</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xl font-bold text-gray-900">{family.task_count || 0}</p>
            <p className="text-xs text-gray-600">Tasks</p>
          </div>
        </div>

        {/* Created Date */}
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-2" />
          Created: {new Date(family.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          {loadingMembers ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Parents Section */}
              {parents.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Parents & Spouses</h4>
                  <div className="space-y-2">
                    {parents.map(member => (
                      <MemberRow key={member.user_id} member={member} />
                    ))}
                  </div>
                </div>
              )}

              {/* Children Section */}
              {children.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Children</h4>
                  <div className="space-y-2">
                    {children.map(member => (
                      <MemberRow key={member.user_id} member={member} />
                    ))}
                  </div>
                </div>
              )}

              {members.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No members found</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const MemberRow = ({ member }) => (
  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
        {member.first_name?.[0]}{member.last_name?.[0]}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">
          {member.first_name} {member.last_name}
        </p>
        <p className="text-xs text-gray-500">{member.email}</p>
      </div>
    </div>
    <RoleBadge role={member.role} />
  </div>
);

export default function AdminFamilyManagement() {
  const [families, setFamilies] = useState([]);
  const [filteredFamilies, setFilteredFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [familyToDelete, setFamilyToDelete] = useState(null);

  useEffect(() => {
    fetchFamilies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [families, searchQuery]);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getFamilies();
      setFamilies(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching families:', err);
      setError('Failed to load families');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...families];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(family =>
        family.family_name?.toLowerCase().includes(query) ||
        family.family_id?.toString().includes(query)
      );
    }

    setFilteredFamilies(filtered);
  };

  const handleDeleteClick = (family) => {
    setFamilyToDelete(family);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!familyToDelete) return;

    try {
      await adminApi.deleteFamily(familyToDelete.family_id);
      
      setFamilies(prev => prev.filter(f => f.family_id !== familyToDelete.family_id));
      
      setSuccessMessage(`Family "${familyToDelete.family_name || familyToDelete.family_id}" deleted successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setShowDeleteModal(false);
      setFamilyToDelete(null);
    } catch (err) {
      console.error('Error deleting family:', err);
      alert(err.response?.data?.message || 'Failed to delete family');
    }
  };

  const handleViewDetails = (family) => {
    // Expand/collapse handled in FamilyCard
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading families...</p>
        </div>
      </div>
    );
  }

  const totalMembers = families.reduce((sum, f) => sum + (f.member_count || 0), 0);
  const totalChildren = families.reduce((sum, f) => sum + (f.child_count || 0), 0);
  const totalTasks = families.reduce((sum, f) => sum + (f.task_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Family Management</h1>
        <p className="text-gray-600 mt-2">Manage all families in the system</p>
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Families</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{families.length}</p>
            </div>
            <Home className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">{totalMembers}</p>
            </div>
            <Users className="w-10 h-10 text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Children</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{totalChildren}</p>
            </div>
            <Baby className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{totalTasks}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search families by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-600">
        Showing {filteredFamilies.length} of {families.length} families
      </p>

      {/* Families Grid */}
      {filteredFamilies.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {families.length === 0 ? 'No families yet' : 'No families match your search'}
          </h3>
          <p className="text-gray-600">
            {families.length === 0
              ? 'Families will appear here once users register'
              : 'Try adjusting your search query'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredFamilies.map(family => (
            <FamilyCard
              key={family.family_id}
              family={family}
              onViewDetails={handleViewDetails}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && familyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Family</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>"{familyToDelete.family_name || `Family #${familyToDelete.family_id}`}"</strong>?
            </p>

            <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-sm mb-4">
              <p className="font-medium">⚠️ Warning: This will permanently:</p>
              <ul className="mt-1 ml-4 list-disc text-xs space-y-1">
                <li>Delete all family members ({familyToDelete.member_count || 0} users)</li>
                <li>Delete all tasks ({familyToDelete.task_count || 0} tasks)</li>
                <li>Delete all rewards and redemptions</li>
                <li>Remove all user accounts in this family</li>
              </ul>
              <p className="mt-2 font-bold">This action cannot be undone!</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Yes, Delete Family
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setFamilyToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Family Management Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Click the arrow to expand and view family members</li>
          <li>• Family deletion is permanent and affects all members</li>
          <li>• Parents manage their own family members through the parent dashboard</li>
          <li>• Use search to quickly find specific families</li>
        </ul>
      </div>
    </div>
  );
}
