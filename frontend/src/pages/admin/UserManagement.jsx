import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit2,
  Trash2,
  Ban,
  CheckCircle,
  Mail,
  Calendar,
  Shield
} from 'lucide-react';

const RoleBadge = ({ role }) => {
  const config = {
    admin: { color: 'bg-red-100 text-red-800', label: 'Admin' },
    parent: { color: 'bg-blue-100 text-blue-800', label: 'Parent' },
    spouse: { color: 'bg-purple-100 text-purple-800', label: 'Spouse' },
    child: { color: 'bg-green-100 text-green-800', label: 'Child' }
  };

  const { color, label } = config[role] || config.child;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    active: { color: 'bg-green-100 text-green-800', label: 'Active' },
    suspended: { color: 'bg-red-100 text-red-800', label: 'Suspended' },
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' }
  };

  const { color, label } = config[status] || config.active;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

const UserRow = ({ user, onEdit, onDelete, onSuspend, onActivate }) => {
  const [showActions, setShowActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {user.first_name} {user.last_name}
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <Mail className="w-3 h-3 mr-1" />
                {user.email}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <RoleBadge role={user.role} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusBadge status={user.account_status || 'active'} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(user.created_at).toLocaleDateString()}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onEdit(user);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit User
                  </button>
                  
                  {user.account_status === 'active' ? (
                    <button
                      onClick={() => {
                        setShowSuspendModal(true);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 flex items-center"
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Suspend User
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onActivate(user.user_id);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Activate User
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowDeleteModal(true);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete User
                  </button>
                </div>
              </div>
            )}
          </div>
        </td>
      </tr>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <tr>
          <td colSpan="6">
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete User</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete <strong>{user.first_name} {user.last_name}</strong>? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      onDelete(user.user_id);
                      setShowDeleteModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <tr>
          <td colSpan="6">
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Suspend User</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Provide a reason for suspending {user.first_name} {user.last_name}:
                </p>
                <textarea
                  id={`suspend-reason-${user.user_id}`}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                  placeholder="Reason for suspension..."
                />
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      const reason = document.getElementById(`suspend-reason-${user.user_id}`).value;
                      if (reason.trim()) {
                        onSuspend(user.user_id, reason);
                        setShowSuspendModal(false);
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() => setShowSuspendModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers();
      setUsers(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.first_name?.toLowerCase().includes(query) ||
        user.last_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.account_status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleEdit = (user) => {
    // TODO: Implement edit modal or navigate to edit page
    console.log('Edit user:', user);
  };

  const handleDelete = async (userId) => {
    try {
      await adminApi.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.user_id !== userId));
      setSuccessMessage('User deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const handleSuspend = async (userId, reason) => {
    try {
      await adminApi.suspendUser(userId, reason);
      setUsers(prev => prev.map(u =>
        u.user_id === userId ? { ...u, account_status: 'suspended' } : u
      ));
      setSuccessMessage('User suspended successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error suspending user:', err);
      alert('Failed to suspend user');
    }
  };

  const handleActivate = async (userId) => {
    try {
      await adminApi.activateUser(userId);
      setUsers(prev => prev.map(u =>
        u.user_id === userId ? { ...u, account_status: 'active' } : u
      ));
      setSuccessMessage('User activated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error activating user:', err);
      alert('Failed to activate user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all user accounts</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
          <UserPlus className="w-5 h-5 mr-2" />
          Add User
        </button>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter(u => u.account_status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Suspended</p>
          <p className="text-2xl font-bold text-red-600">
            {users.filter(u => u.account_status === 'suspended').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Admins</p>
          <p className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.role === 'admin').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="parent">Parent</option>
            <option value="spouse">Spouse</option>
            <option value="child">Child</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-600">
        Showing {filteredUsers.length} of {users.length} users
      </p>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <UserRow
                key={user.user_id}
                user={user}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSuspend={handleSuspend}
                onActivate={handleActivate}
              />
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
