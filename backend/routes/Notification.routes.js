// ============================================================================
// Notification Routes
// Handles in-app notifications and notification management
// ============================================================================

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

// ============================================================================
// NOTIFICATION RETRIEVAL ROUTES
// ============================================================================

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for current user
 * @access  Private
 * @query   type, isRead, limit, offset
 */
router.get('/', authenticate, notificationController.getNotifications);

/**
 * @route   GET /api/notifications/unread
 * @desc    Get all unread notifications for current user
 * @access  Private
 */
router.get('/unread', authenticate, notificationController.getUnreadNotifications);

/**
 * @route   GET /api/notifications/count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/count', authenticate, notificationController.getUnreadCount);

/**
 * @route   GET /api/notifications/:notificationId
 * @desc    Get notification details by ID
 * @access  Private
 */
router.get('/:notificationId', authenticate, notificationController.getNotificationById);

// ============================================================================
// NOTIFICATION MANAGEMENT ROUTES
// ============================================================================

/**
 * @route   PATCH /api/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch('/:notificationId/read', authenticate, notificationController.markAsRead);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch('/read-all', authenticate, notificationController.markAllAsRead);

/**
 * @route   DELETE /api/notifications/:notificationId
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:notificationId', authenticate, notificationController.deleteNotification);

/**
 * @route   DELETE /api/notifications
 * @desc    Delete all notifications for current user
 * @access  Private
 */
router.delete('/', authenticate, notificationController.deleteAllNotifications);

/**
 * @route   DELETE /api/notifications/read/clear
 * @desc    Delete all read notifications
 * @access  Private
 */
router.delete('/read/clear', authenticate, notificationController.deleteReadNotifications);

// ============================================================================
// NOTIFICATION SETTINGS ROUTES
// ============================================================================

/**
 * @route   GET /api/notifications/settings
 * @desc    Get user's notification preferences
 * @access  Private
 */
router.get('/settings/preferences', authenticate, notificationController.getNotificationSettings);

/**
 * @route   PUT /api/notifications/settings
 * @desc    Update user's notification preferences
 * @access  Private
 */
router.put('/settings/preferences', authenticate, notificationController.updateNotificationSettings);

// ============================================================================
// NOTIFICATION HISTORY ROUTES
// ============================================================================

/**
 * @route   GET /api/notifications/history
 * @desc    Get notification history with pagination
 * @access  Private
 * @query   page, limit, type, startDate, endDate
 */
router.get('/history/all', authenticate, notificationController.getNotificationHistory);

/**
 * @route   GET /api/notifications/by-type/:type
 * @desc    Get notifications by type
 * @access  Private
 */
router.get('/by-type/:type', authenticate, notificationController.getNotificationsByType);

module.exports = router;