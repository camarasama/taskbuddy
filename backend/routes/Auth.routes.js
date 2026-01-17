// ============================================================================
// Authentication Routes - UPDATED
// Handles user registration, login, email verification, password reset
// Changes: Added admin registration route with secret verification
// ============================================================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { verifyAdminSecret } = require('../middleware/adminSecret.middleware');
const { 
  validateParentRegistration, 
  validateAdminRegistration 
} = require('../validators/auth.validator');

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new parent user (Public self-registration)
 * @access  Public
 */
router.post('/register', validateParentRegistration, authController.register);

/**
 * @route   POST /api/auth/admin-register
 * @desc    Register a new admin user (Restricted with secret key)
 * @access  Public (but requires admin secret)
 */
router.post('/admin-register', 
  validateAdminRegistration, 
  verifyAdminSecret, 
  authController.registerAdmin
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify user email with verification token
 * @access  Public
 */
router.post('/verify-email', authController.verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification link
 * @access  Public
 */
router.post('/resend-verification', authController.resendVerification);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with reset token
 * @access  Public
 */
router.post('/reset-password', authController.resetPassword);

// ============================================================================
// PROTECTED ROUTES (Authentication required)
// ============================================================================

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user information
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (update last_login)
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password for logged-in user
 * @access  Private
 */
router.post('/change-password', authenticate, authController.changePassword);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh JWT access token
 * @access  Private
 */
router.post('/refresh-token', authenticate, authController.refreshToken);

module.exports = router;