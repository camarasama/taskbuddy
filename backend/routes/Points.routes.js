// ============================================================================
// Points Routes
// Handles points balance, transaction history, and manual adjustments
// ============================================================================

const express = require('express');
const router = express.Router();
const pointsController = require('../controllers/points.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validatePointsAdjustment } = require('../middleware/validator.middleware');

// ============================================================================
// POINTS BALANCE ROUTES
// ============================================================================

/**
 * @route   GET /api/points/balance
 * @desc    Get current user's points balance (for children)
 * @access  Private/Child
 */
router.get('/balance', authenticate, requireRole(['child']), pointsController.getMyBalance);

/**
 * @route   GET /api/points/balance/:childId
 * @desc    Get specific child's points balance
 * @access  Private (Child can view own, Parent/Spouse can view any)
 */
router.get('/balance/:childId', authenticate, pointsController.getChildBalance);

/**
 * @route   GET /api/points/family/:familyId/balances
 * @desc    Get points balances for all children in a family
 * @access  Private/Parent/Spouse
 */
router.get('/family/:familyId/balances', authenticate, requireRole(['parent', 'spouse']), pointsController.getFamilyBalances);

// ============================================================================
// POINTS HISTORY ROUTES
// ============================================================================

/**
 * @route   GET /api/points/history
 * @desc    Get current user's points transaction history (for children)
 * @access  Private/Child
 */
router.get('/history', authenticate, requireRole(['child']), pointsController.getMyHistory);

/**
 * @route   GET /api/points/history/:childId
 * @desc    Get specific child's points transaction history
 * @access  Private (Child can view own, Parent/Spouse can view any)
 */
router.get('/history/:childId', authenticate, pointsController.getChildHistory);

/**
 * @route   GET /api/points/family/:familyId/history
 * @desc    Get complete points transaction history for a family
 * @access  Private/Parent/Spouse
 */
router.get('/family/:familyId/history', authenticate, requireRole(['parent', 'spouse']), pointsController.getFamilyHistory);

/**
 * @route   GET /api/points/transaction/:logId
 * @desc    Get specific transaction details
 * @access  Private
 */
router.get('/transaction/:logId', authenticate, pointsController.getTransactionById);

// ============================================================================
// MANUAL POINTS ADJUSTMENT ROUTES (Parent/Spouse only)
// ============================================================================

/**
 * @route   POST /api/points/adjust
 * @desc    Manually adjust child's points (Parent/Spouse only)
 * @access  Private/Parent/Spouse
 */
router.post('/adjust', authenticate, requireRole(['parent', 'spouse']), validatePointsAdjustment, pointsController.adjustPoints);

/**
 * @route   POST /api/points/bonus
 * @desc    Award bonus points to child (Parent/Spouse only)
 * @access  Private/Parent/Spouse
 */
router.post('/bonus', authenticate, requireRole(['parent', 'spouse']), validatePointsAdjustment, pointsController.awardBonus);

/**
 * @route   POST /api/points/penalty
 * @desc    Deduct penalty points from child (Parent/Spouse only)
 * @access  Private/Parent/Spouse
 */
router.post('/penalty', authenticate, requireRole(['parent', 'spouse']), validatePointsAdjustment, pointsController.deductPenalty);

// ============================================================================
// POINTS STATISTICS ROUTES
// ============================================================================

/**
 * @route   GET /api/points/statistics/:childId
 * @desc    Get points statistics for a child
 * @access  Private (Child can view own, Parent/Spouse can view any)
 */
router.get('/statistics/:childId', authenticate, pointsController.getChildPointsStats);

/**
 * @route   GET /api/points/statistics/family/:familyId
 * @desc    Get points statistics for entire family
 * @access  Private/Parent/Spouse
 */
router.get('/statistics/family/:familyId', authenticate, requireRole(['parent', 'spouse']), pointsController.getFamilyPointsStats);

/**
 * @route   GET /api/points/leaderboard/:familyId
 * @desc    Get family points leaderboard
 * @access  Private (Family members only)
 */
router.get('/leaderboard/:familyId', authenticate, pointsController.getFamilyLeaderboard);

/**
 * @route   GET /api/points/earned/:childId
 * @desc    Get total points earned by a child
 * @access  Private (Child can view own, Parent/Spouse can view any)
 */
router.get('/earned/:childId', authenticate, pointsController.getTotalPointsEarned);

/**
 * @route   GET /api/points/spent/:childId
 * @desc    Get total points spent by a child
 * @access  Private (Child can view own, Parent/Spouse can view any)
 */
router.get('/spent/:childId', authenticate, pointsController.getTotalPointsSpent);

module.exports = router;