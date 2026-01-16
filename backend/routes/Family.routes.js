// ============================================================================
// Family Routes
// Handles family creation, management, member operations
// ============================================================================

const express = require('express');
const router = express.Router();
const familyController = require('../controllers/family.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validateFamilyCreation, validateFamilyUpdate, validateMemberAdd } = require('../middleware/validator.middleware');

// ============================================================================
// PROTECTED ROUTES (Authentication required)
// ============================================================================

/**
 * @route   POST /api/families
 * @desc    Create a new family (Parent only)
 * @access  Private/Parent
 */
router.post('/', authenticate, requireRole(['parent']), validateFamilyCreation, familyController.createFamily);

/**
 * @route   GET /api/families
 * @desc    Get all families user belongs to
 * @access  Private
 */
router.get('/', authenticate, familyController.getUserFamilies);

/**
 * @route   GET /api/families/:familyId
 * @desc    Get family details by ID
 * @access  Private (Family members only)
 */
router.get('/:familyId', authenticate, familyController.getFamilyById);

/**
 * @route   PUT /api/families/:familyId
 * @desc    Update family information (Parent/Spouse only)
 * @access  Private/Parent/Spouse
 */
router.put('/:familyId', authenticate, requireRole(['parent', 'spouse']), validateFamilyUpdate, familyController.updateFamily);

/**
 * @route   DELETE /api/families/:familyId
 * @desc    Delete family (Parent only - creator)
 * @access  Private/Parent
 */
router.delete('/:familyId', authenticate, requireRole(['parent']), familyController.deleteFamily);

// ============================================================================
// FAMILY MEMBER MANAGEMENT ROUTES
// ============================================================================

/**
 * @route   POST /api/families/join
 * @desc    Join a family using family code
 * @access  Private
 */
router.post('/join', authenticate, familyController.joinFamily);

/**
 * @route   GET /api/families/:familyId/members
 * @desc    Get all members of a family
 * @access  Private (Family members only)
 */
router.get('/:familyId/members', authenticate, familyController.getFamilyMembers);

/**
 * @route   POST /api/families/:familyId/members
 * @desc    Add a new member to family (Parent/Spouse creates child account)
 * @access  Private/Parent/Spouse
 */
router.post('/:familyId/members', authenticate, requireRole(['parent', 'spouse']), validateMemberAdd, familyController.addFamilyMember);

/**
 * @route   GET /api/families/:familyId/members/:userId
 * @desc    Get specific family member details
 * @access  Private (Family members only)
 */
router.get('/:familyId/members/:userId', authenticate, familyController.getFamilyMemberById);

/**
 * @route   PUT /api/families/:familyId/members/:userId
 * @desc    Update family member details (Parent/Spouse only)
 * @access  Private/Parent/Spouse
 */
router.put('/:familyId/members/:userId', authenticate, requireRole(['parent', 'spouse']), familyController.updateFamilyMember);

/**
 * @route   DELETE /api/families/:familyId/members/:userId
 * @desc    Remove member from family (Parent/Spouse only)
 * @access  Private/Parent/Spouse
 */
router.delete('/:familyId/members/:userId', authenticate, requireRole(['parent', 'spouse']), familyController.removeFamilyMember);

/**
 * @route   POST /api/families/:familyId/leave
 * @desc    Leave a family (self-removal)
 * @access  Private
 */
router.post('/:familyId/leave', authenticate, familyController.leaveFamily);

/**
 * @route   GET /api/families/:familyId/code
 * @desc    Get or regenerate family code (Parent/Spouse only)
 * @access  Private/Parent/Spouse
 */
router.get('/:familyId/code', authenticate, requireRole(['parent', 'spouse']), familyController.getFamilyCode);

/**
 * @route   POST /api/families/:familyId/code/regenerate
 * @desc    Regenerate family code (Parent only)
 * @access  Private/Parent
 */
router.post('/:familyId/code/regenerate', authenticate, requireRole(['parent']), familyController.regenerateFamilyCode);

module.exports = router;