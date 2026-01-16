// ============================================================================
// Reward Routes
// Handles reward creation, updates, and management
// ============================================================================

const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/reward.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { upload } = require('../middleware/upload.middleware');
const { validateRewardCreation, validateRewardUpdate } = require('../middleware/validator.middleware');

// ============================================================================
// REWARD MANAGEMENT ROUTES (Parent/Spouse only)
// ============================================================================

/**
 * @route   POST /api/rewards
 * @desc    Create a new reward (Parent/Spouse only)
 * @access  Private/Parent/Spouse
 */
router.post('/', authenticate, requireRole(['parent', 'spouse']), validateRewardCreation, rewardController.createReward);

/**
 * @route   GET /api/rewards
 * @desc    Get all rewards with filters
 * @access  Private
 * @query   familyId, status
 */
router.get('/', authenticate, rewardController.getRewards);

/**
 * @route   GET /api/rewards/:rewardId
 * @desc    Get reward details by ID
 * @access  Private
 */
router.get('/:rewardId', authenticate, rewardController.getRewardById);

/**
 * @route   PUT /api/rewards/:rewardId
 * @desc    Update reward (Parent/Spouse only)
 * @access  Private/Parent/Spouse
 */
router.put('/:rewardId', authenticate, requireRole(['parent', 'spouse']), validateRewardUpdate, rewardController.updateReward);

/**
 * @route   DELETE /api/rewards/:rewardId
 * @desc    Delete reward (Parent/Spouse only)
 * @access  Private/Parent/Spouse
 */
router.delete('/:rewardId', authenticate, requireRole(['parent', 'spouse']), rewardController.deleteReward);

/**
 * @route   PATCH /api/rewards/:rewardId/status
 * @desc    Change reward status (available/unavailable/archived)
 * @access  Private/Parent/Spouse
 */
router.patch('/:rewardId/status', authenticate, requireRole(['parent', 'spouse']), rewardController.updateRewardStatus);

/**
 * @route   POST /api/rewards/:rewardId/image
 * @desc    Upload reward image (Parent/Spouse only)
 * @access  Private/Parent/Spouse
 */
router.post('/:rewardId/image', authenticate, requireRole(['parent', 'spouse']), upload.single('image'), rewardController.uploadRewardImage);

/**
 * @route   DELETE /api/rewards/:rewardId/image
 * @desc    Delete reward image (Parent/Spouse only)
 * @access  Private/Parent/Spouse
 */
router.delete('/:rewardId/image', authenticate, requireRole(['parent', 'spouse']), rewardController.deleteRewardImage);

// ============================================================================
// REWARD CATALOG ROUTES (For Children)
// ============================================================================

/**
 * @route   GET /api/rewards/family/:familyId
 * @desc    Get all rewards for a family
 * @access  Private (Family members only)
 */
router.get('/family/:familyId', authenticate, rewardController.getFamilyRewards);

/**
 * @route   GET /api/rewards/family/:familyId/available
 * @desc    Get all available rewards for a family (for children to browse)
 * @access  Private (Family members only)
 */
router.get('/family/:familyId/available', authenticate, rewardController.getAvailableRewards);

/**
 * @route   GET /api/rewards/family/:familyId/child/:childId
 * @desc    Get rewards a child can afford
 * @access  Private (Child can view own, Parent/Spouse can view any)
 */
router.get('/family/:familyId/child/:childId', authenticate, rewardController.getAffordableRewards);

// ============================================================================
// REWARD STATISTICS ROUTES
// ============================================================================

/**
 * @route   GET /api/rewards/statistics/:familyId
 * @desc    Get reward statistics for a family
 * @access  Private/Parent/Spouse
 */
router.get('/statistics/:familyId', authenticate, requireRole(['parent', 'spouse']), rewardController.getRewardStatistics);

module.exports = router;