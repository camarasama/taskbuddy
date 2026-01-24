import axios from 'axios';

// Create axios instance with CORS credentials support
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Track if we're already redirecting to prevent multiple redirects
let isRedirecting = false;

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`🔵 API Request: ${config.method.toUpperCase()} ${config.url}`, config.data || '');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('❌ Server Error:', {
        status: error.response.status,
        message: error.response.data?.message || 'Unknown error',
        url: error.config?.url
      });
      
      switch (error.response.status) {
        case 401:
          // ✅ FIX: More robust token validation check
          const errorMessage = error.response.data?.message?.toLowerCase() || '';
          const isTokenInvalid = errorMessage.includes('token expired') || 
                                 errorMessage.includes('invalid token') ||
                                 errorMessage.includes('jwt expired') ||
                                 errorMessage.includes('no token provided');
          
          // ✅ FIX: Only logout if token is actually invalid AND not already redirecting
          if (isTokenInvalid && 
              !isRedirecting && 
              window.location.pathname !== '/login' && 
              window.location.pathname !== '/register') {
            
            isRedirecting = true;
            console.warn('⚠️ Session expired. Logging out...');
            
            // Clear authentication data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirect to login after a small delay
            setTimeout(() => {
              window.location.href = '/login';
              // Reset the flag after redirect
              setTimeout(() => {
                isRedirecting = false;
              }, 1000);
            }, 500);
          }
          break;
          
        case 403:
          // Forbidden - but don't logout, just log
          console.error('Access forbidden - insufficient permissions');
          break;
          
        case 404:
          // Not found - don't logout
          console.error('Resource not found');
          break;
          
        case 500:
          // Server error - don't logout
          console.error('Server error');
          break;
          
        default:
          console.error('An error occurred:', error.response.data.message);
      }
    } else if (error.request) {
      // ✅ FIX: Request made but no response - DON'T logout
      console.error('❌ No response from server - Backend may not be running');
      console.error('Check that backend is running on http://localhost:5000');
      
      // Don't alert on every failed request, just log it
      if (import.meta.env.DEV) {
        console.warn('💡 Tip: Make sure backend server is running (npm start in backend folder)');
      }
    } else {
      // Something else happened
      console.error('❌ Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  registerAdmin: (data) => api.post('/auth/admin-register', data),
  login: (data) => api.post('/auth/login', data),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  uploadAvatar: (formData) => api.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Family API endpoints
export const familyAPI = {
  create: (data) => api.post('/families', data),
  getAll: () => api.get('/families'),
  getById: (familyId) => api.get(`/families/${familyId}`),
  update: (familyId, data) => api.put(`/families/${familyId}`, data),
  delete: (familyId) => api.delete(`/families/${familyId}`),
  
  // Member Management
  getMembers: (familyId) => api.get(`/families/${familyId}/members`),
  addMember: (familyId, data) => api.post(`/families/${familyId}/members`, data),
  addChild: (familyId, data) => api.post(`/families/${familyId}/add-child`, data),
  addSpouse: (familyId, data) => api.post(`/families/${familyId}/add-spouse`, data),
  getMemberById: (familyId, userId) => api.get(`/families/${familyId}/members/${userId}`),
  updateMember: (familyId, userId, data) => api.put(`/families/${familyId}/members/${userId}`, data),
  removeMember: (familyId, userId) => api.delete(`/families/${familyId}/members/${userId}`),
  
  // Family Operations
  joinFamily: (data) => api.post('/families/join', data),
  leaveFamily: (familyId) => api.post(`/families/${familyId}/leave`),
  
  // Family Code
  getFamilyCode: (familyId) => api.get(`/families/${familyId}/code`),
  regenerateFamilyCode: (familyId) => api.post(`/families/${familyId}/code/regenerate`),
};

// Task API endpoints
export const taskAPI = {
  create: (data) => api.post('/tasks', data),
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  assign: (id, data) => api.post(`/tasks/${id}/assign`, data),
  submit: (id, formData) => api.post(`/tasks/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  approve: (id, data) => api.put(`/assignments/${id}/approve`, data),
  reject: (id, data) => api.put(`/assignments/${id}/reject`, data),
  getAssignments: (taskId) => api.get(`/tasks/${taskId}/assignments`),
  getMyTasks: () => api.get('/tasks/my-tasks'),
  getTasksByFamily: (familyId) => api.get(`/tasks/family/${familyId}`),
};

// Assignment API endpoints
export const assignmentAPI = {
  create: (data) => api.post('/assignments', data),
  getAll: (params) => api.get('/assignments', { params }),
  getById: (id) => api.get(`/assignments/${id}`),
  getPending: () => api.get('/assignments/pending'),
  approve: (id, data) => api.put(`/assignments/${id}/approve`, data),
  reject: (id, data) => api.put(`/assignments/${id}/reject`, data),
  submit: (id, formData) => api.put(`/assignments/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Reward API endpoints
export const rewardAPI = {
  create: (data) => api.post('/rewards', data),
  getAll: (params) => api.get('/rewards', { params }),
  getById: (id) => api.get(`/rewards/${id}`),
  update: (id, data) => api.put(`/rewards/${id}`, data),
  delete: (id) => api.delete(`/rewards/${id}`),
  request: (id, data) => api.post(`/rewards/${id}/redeem`, data),
  getRequests: (params) => api.get('/redemptions/pending', { params }),
  getMyRedemptions: () => api.get('/redemptions/my-redemptions'),
  getByFamily: (familyId) => api.get(`/rewards/family/${familyId}`),
};

// Redemption API endpoints
export const redemptionAPI = {
  create: (data) => api.post('/redemptions', data),
  getAll: (params) => api.get('/redemptions', { params }),
  getPending: () => api.get('/redemptions/pending'),
  approve: (id, data) => api.put(`/redemptions/${id}/approve`, data),
  deny: (id, data) => api.put(`/redemptions/${id}/deny`, data),
  getMyRedemptions: () => api.get('/redemptions/my'),
};

// Points API endpoints
export const pointsAPI = {
  getBalance: (userId) => api.get(`/points/${userId}/balance`),
  getMyBalance: () => api.get('/points/balance'),
  getHistory: (userId, params) => api.get(`/points/${userId}/history`, { params }),
  getMyHistory: (params) => api.get('/points/history', { params }),
  award: (data) => api.post('/points/award', data),
  deduct: (data) => api.post('/points/deduct', data),
  transfer: (data) => api.post('/points/transfer', data),
};

// Notification API endpoints
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getById: (id) => api.get(`/notifications/${id}`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/count'),
};

// Report API endpoints
export const reportAPI = {
  getTaskStats: (familyId, params) => api.get(`/reports/tasks/${familyId}`, { params }),
  getUserPerformance: (userId, params) => api.get(`/reports/performance/${userId}`, { params }),
  getFamilyActivity: (familyId, params) => api.get(`/reports/activity/${familyId}`, { params }),
  getPointsSummary: (familyId, params) => api.get(`/reports/points/${familyId}`, { params }),
};

// Admin API endpoints
export const adminAPI = {
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getSystemStats: () => api.get('/admin/stats'),
  getAllFamilies: (params) => api.get('/admin/families', { params }),
  getFamilyById: (id) => api.get(`/admin/families/${id}`),
};

export default api;
