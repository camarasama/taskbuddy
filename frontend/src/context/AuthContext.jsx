import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import socketService from '../services/socket';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
          // ✅ FIX: Set user immediately from localStorage (optimistic)
          setUser(JSON.parse(savedUser));
          
          // ✅ FIX: Verify token is still valid by fetching profile
          try {
            const response = await authAPI.getProfile();
            
            // ✅ FIX: Handle different possible response structures
            const userData = response.data.user || response.data.data || response.data;
            
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Connect socket with valid token
            socketService.connect(token);
          } catch (err) {
            // ✅ FIX: Only logout if token is actually invalid, not on network errors
            const errorMessage = err.response?.data?.message?.toLowerCase() || '';
            const isTokenInvalid = err.response?.status === 401 && (
              errorMessage.includes('token expired') || 
              errorMessage.includes('invalid token') ||
              errorMessage.includes('jwt expired') ||
              errorMessage.includes('no token provided')
            );
            
            if (isTokenInvalid) {
              console.warn('⚠️ Token is invalid, logging out...');
              logout();
            } else {
              // Network error or other issue - keep user logged in with cached data
              console.warn('⚠️ Could not verify token (network issue?), using cached user data');
            }
          }
        }
      } catch (err) {
        console.error('Error loading user:', err);
        // ✅ FIX: Don't logout on general errors
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authAPI.login({ email, password });
      
      // ✅ FIX: Handle different response structures
      const { token, user: userData } = response.data.data || response.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setUser(userData);

      // Connect socket
      socketService.connect(token);

      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authAPI.register(userData);
      const { message } = response.data;

      return { success: true, message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Disconnect socket
    socketService.disconnect();

    // Clear state
    setUser(null);
    setError(null);
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const verifyEmail = async (token) => {
    try {
      setError(null);
      const response = await authAPI.verifyEmail(token);
      return { success: true, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Email verification failed.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      const response = await authAPI.forgotPassword(email);
      return { success: true, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset email.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setError(null);
      const response = await authAPI.resetPassword(token, password);
      return { success: true, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password reset failed.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resendVerification = async (email) => {
    try {
      setError(null);
      const response = await authAPI.resendVerification(email);
      return { success: true, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to resend verification email.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const response = await authAPI.changePassword({ currentPassword, newPassword });
      return { success: true, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password change failed.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerification,
    changePassword,
    isAuthenticated: !!user,
    isParent: user?.role === 'parent',
    isChild: user?.role === 'child',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
