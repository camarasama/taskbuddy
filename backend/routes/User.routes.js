// ============================================================================
// User Routes
// Handles user profile management and user-related operations
// ============================================================================

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { upload } = require('../middleware/upload.middleware');
const { validateProfileUpdate } = require('../middleware/validator.middleware');

// ============================================================================
// PROTECTED ROUTES (Authentication required)
// ============================================================================

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/profile', authenticate, userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put('/profile', authenticate, validateProfileUpdate, userController.updateProfile);

/**
 * @route   POST /api/users/profile/avatar
 * @desc    Upload/update profile picture
 * @access  Private
 */
router.post('/profile/avatar', authenticate, upload.single('avatar'), userController.uploadAvatar);

/**
 * @route   DELETE /api/users/profile/avatar
 * @desc    Delete profile picture
 * @access  Private
 */
router.delete('/profile/avatar', authenticate, userController.deleteAvatar);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID (family members only)
 * @access  Private
 */
router.get('/:userId', authenticate, userController.getUserById);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account (soft delete)
 * @access  Private
 */
router.delete('/account', authenticate, userController.deleteAccount);

// ============================================================================
// ADMIN ONLY ROUTES
// ============================================================================

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get('/', authenticate, requireRole(['admin']), userController.getAllUsers);

/**
 * @route   PUT /api/users/:userId/status
 * @desc    Activate/deactivate user account (Admin only)
 * @access  Private/Admin
 */
router.put('/:userId/status', authenticate, requireRole(['admin']), userController.toggleUserStatus);

/**
 * @route   DELETE /api/users/:userId
 * @desc    Permanently delete user (Admin only)
 * @access  Private/Admin
 */
router.delete('/:userId', authenticate, requireRole(['admin']), userController.permanentlyDeleteUser);

module.exports = router;