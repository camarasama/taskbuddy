/**
 * Admin API Service
 * Handles all admin-related API calls
 */

import api from './api';

const adminApi = {
  // ==================== Dashboard Stats ====================
  
  /**
   * Get admin dashboard statistics
   * @returns {Promise} Dashboard stats (users, families, tasks, etc.)
   */
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  /**
   * Get recent activity log
   * @param {Object} params - Query parameters (limit, offset)
   * @returns {Promise} Activity log entries
   */
  getActivityLog: async (params = {}) => {
    const response = await api.get('/admin/activity', { params });
    return response.data;
  },

  // ==================== User Management ====================
  
  /**
   * Get all users with filters
   * @param {Object} params - Filter params (role, status, search)
   * @returns {Promise} List of users
   */
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise} User details
   */
  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise} Created user
   */
  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  /**
   * Update user
   * @param {number} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise} Updated user
   */
  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  /**
   * Delete user
   * @param {number} userId - User ID
   * @returns {Promise} Success response
   */
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Suspend user account
   * @param {number} userId - User ID
   * @param {string} reason - Suspension reason
   * @returns {Promise} Success response
   */
  suspendUser: async (userId, reason) => {
    const response = await api.post(`/admin/users/${userId}/suspend`, { reason });
    return response.data;
  },

  /**
   * Activate user account
   * @param {number} userId - User ID
   * @returns {Promise} Success response
   */
  activateUser: async (userId) => {
    const response = await api.post(`/admin/users/${userId}/activate`);
    return response.data;
  },

  // ==================== Family Management ====================
  
  /**
   * Get all families with filters
   * @param {Object} params - Filter params (search, status)
   * @returns {Promise} List of families
   */
  getFamilies: async (params = {}) => {
    const response = await api.get('/admin/families', { params });
    return response.data;
  },

  /**
   * Get family by ID
   * @param {number} familyId - Family ID
   * @returns {Promise} Family details
   */
  getFamilyById: async (familyId) => {
    const response = await api.get(`/admin/families/${familyId}`);
    return response.data;
  },

  /**
   * Get family members
   * @param {number} familyId - Family ID
   * @returns {Promise} List of family members
   */
  getFamilyMembers: async (familyId) => {
    const response = await api.get(`/admin/families/${familyId}/members`);
    return response.data;
  },

  /**
   * Delete family
   * @param {number} familyId - Family ID
   * @returns {Promise} Success response
   */
  deleteFamily: async (familyId) => {
    const response = await api.delete(`/admin/families/${familyId}`);
    return response.data;
  },

  // ==================== System Statistics ====================
  
  /**
   * Get system-wide statistics
   * @returns {Promise} System stats
   */
  getSystemStats: async () => {
    const response = await api.get('/admin/stats/system');
    return response.data;
  },

  /**
   * Get user growth statistics
   * @param {string} period - Time period (week, month, year)
   * @returns {Promise} Growth stats
   */
  getUserGrowth: async (period = 'month') => {
    const response = await api.get(`/admin/stats/users/growth`, { 
      params: { period } 
    });
    return response.data;
  },

  /**
   * Get task statistics
   * @returns {Promise} Task stats
   */
  getTaskStats: async () => {
    const response = await api.get('/admin/stats/tasks');
    return response.data;
  },

  /**
   * Get reward statistics
   * @returns {Promise} Reward stats
   */
  getRewardStats: async () => {
    const response = await api.get('/admin/stats/rewards');
    return response.data;
  }
};

export default adminApi;
