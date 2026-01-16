// ============================================================================
// Redemption Routes
// Handles reward redemption requests, approvals, and history
// ============================================================================

const express = require('express');
const router = express.Router();
const redemptionController = require('../controllers/redemption.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validateRedemptionRequest, validateRedemptionReview } = require('../middleware/validator.middleware');

// ============================================================================
// CHILD REDEMPTION ROUTES
// ============================================================================

/**
 * @route   POST /api/redemptions
 * @desc    Request reward redemption (Child only)
 * @access  Private/Child
 */
router.post('/', authenticate, requireRole(['child']), validateRedemptionRequest, redemptionController.requestRedemption);

/**
 * @route   GET /api/redemptions/my-requests
 * @desc    Get child's own redemption requests
 * @access  Private/Child
 */
router.get('/my-requests', authenticate, requireRole(['child']), redemptionController.getMyRedemptions);

/**
 * @route   PATCH /api/redemptions/:redemptionId/cancel
 * @desc    Cancel redemption request (Child only - before approval)
 * @access  Private/Child
 */
router.patch('/:redemptionId/cancel', authenticate, requireRole(['child']), redemptionController.cancelRedemption);

// ============================================================================
// PARENT/SPOUSE REVIEW ROUTES
// ============================================================================

/**
 * @route   GET /api/redemptions
 * @desc    Get all redemptions with filters
 * @access  Private/Parent/Spouse
 * @query   familyId, status, childId
 */
router.get('/', authenticate, requireRole(['parent', 'spouse']), redemptionController.getRedemptions);

/**
 * @route   GET /api/redemptions/:redemptionId
 * @desc    Get redemption details by ID
 * @access  Private
 */
router.get('/:redemptionId', authenticate, redemptionController.getRedemptionById);

/**
 * @route   POST /api/redemptions/:redemptionId/review
 * @desc    Approve or deny redemption request (Parent/Spouse only)
 * @access  Private/Parent/Spouse
 */
router.post('/:redemptionId/review', authenticate, requireRole(['parent', 'spouse']), validateRedemptionReview, redemptionController.reviewRedemption);

/**
 * @route   GET /api/redemptions/pending/:familyId
 * @desc    Get all pending redemption requests for a family
 * @access  Private/Parent/Spouse
 */
router.get('/pending/:familyId', authenticate, requireRole(['parent', 'spouse']), redemptionController.getPendingRedemptions);

// ============================================================================
// REDEMPTION HISTORY ROUTES
// ============================================================================

/**
 * @route   GET /api/redemptions/family/:familyId
 * @desc    Get all redemptions for a family
 * @access  Private/Parent/Spouse
 */
router.get('/family/:familyId', authenticate, requireRole(['parent', 'spouse']), redemptionController.getFamilyRedemptions);

/**
 * @route   GET /api/redemptions/child/:childId
 * @desc    Get redemption history for a specific child
 * @access  Private (Child can view own, Parent/Spouse can view any)
 */
router.get('/child/:childId', authenticate, redemptionController.getChildRedemptions);

/**
 * @route   GET /api/redemptions/reward/:rewardId
 * @desc    Get redemption history for a specific reward
 * @access  Private/Parent/Spouse
 */
router.get('/reward/:rewardId', authenticate, requireRole(['parent', 'spouse']), redemptionController.getRewardRedemptions);

// ============================================================================
// REDEMPTION STATISTICS ROUTES
// ============================================================================

/**
 * @route   GET /api/redemptions/statistics/child/:childId
 * @desc    Get redemption statistics for a child
 * @access  Private (Child can view own, Parent/Spouse can view any)
 */
router.get('/statistics/child/:childId', authenticate, redemptionController.getChildRedemptionStats);

/**
 * @route   GET /api/redemptions/statistics/family/:familyId
 * @desc    Get redemption statistics for a family
 * @access  Private/Parent/Spouse
 */
router.get('/statistics/family/:familyId', authenticate, requireRole(['parent', 'spouse']), redemptionController.getFamilyRedemptionStats);

module.exports = router;