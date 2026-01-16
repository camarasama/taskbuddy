// ============================================================================
// Assignment Routes
// Handles task assignments to children, submissions, and reviews
// ============================================================================

const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { upload } = require('../middleware/upload.middleware');
const { validateAssignment, validateSubmission, validateReview } = require('../middleware/validator.middleware');

// ============================================================================
// ASSIGNMENT MANAGEMENT ROUTES
// ============================================================================

/**
 * @route   POST /api/assignments
 * @desc    Assign task to child(ren) (Parent/Spouse only)
 * @access  Private/Parent/Spouse
 */
router.post('/', authenticate, requireRole(['parent', 'spouse']), validateAssignment, assignmentController.assignTask);

/**
 * @route   GET /api/assignments
 * @desc    Get all assignments with filters
 * @access  Private
 * @query   familyId, status, childId, taskId
 */
router.get('/', authenticate, assignmentController.getAssignments);

/**
 * @route   GET /api/assignments/:assignmentId
 * @desc    Get assignment details by ID
 * @access  Private
 */
router.get('/:assignmentId', authenticate, assignmentController.getAssignmentById);

/**
 * @route   GET /api/assignments/child/:childId
 * @desc    Get all assignments for a specific child
 * @access  Private (Child can view own, Parent/Spouse can view any)
 */
router.get('/child/:childId', authenticate, assignmentController.getChildAssignments);

/**
 * @route   GET /api/assignments/task/:taskId
 * @desc    Get all assignments for a specific task
 * @access  Private/Parent/Spouse
 */
router.get('/task/:taskId', authenticate, requireRole(['parent', 'spouse']), assignmentController.getTaskAssignments);

/**
 * @route   DELETE /api/assignments/:assignmentId
 * @desc    Delete/cancel assignment (Parent/Spouse only)
 * @access  Private/Parent/Spouse
 */
router.delete('/:assignmentId', authenticate, requireRole(['parent', 'spouse']), assignmentController.deleteAssignment);

// ============================================================================
// CHILD ACTION ROUTES
// ============================================================================

/**
 * @route   PATCH /api/assignments/:assignmentId/start
 * @desc    Mark assignment as "in progress" (Child only)
 * @access  Private/Child
 */
router.patch('/:assignmentId/start', authenticate, requireRole(['child']), assignmentController.startAssignment);

/**
 * @route   POST /api/assignments/:assignmentId/submit
 * @desc    Submit task with optional photo (Child only)
 * @access  Private/Child
 */
router.post('/:assignmentId/submit', authenticate, requireRole(['child']), upload.single('photo'), validateSubmission, assignmentController.submitAssignment);

/**
 * @route   GET /api/assignments/:assignmentId/submissions
 * @desc    Get all submissions for an assignment
 * @access  Private
 */
router.get('/:assignmentId/submissions', authenticate, assignmentController.getSubmissions);

/**
 * @route   POST /api/assignments/:assignmentId/resubmit
 * @desc    Resubmit rejected task (Child only)
 * @access  Private/Child
 */
router.post('/:assignmentId/resubmit', authenticate, requireRole(['child']), upload.single('photo'), validateSubmission, assignmentController.resubmitAssignment);

// ============================================================================
// PARENT/SPOUSE REVIEW ROUTES
// ============================================================================

/**
 * @route   POST /api/assignments/:assignmentId/review
 * @desc    Review and approve/reject submission (Parent/Spouse only)
 * @access  Private/Parent/Spouse
 */
router.post('/:assignmentId/review', authenticate, requireRole(['parent', 'spouse']), validateReview, assignmentController.reviewAssignment);

/**
 * @route   GET /api/assignments/pending-review/:familyId
 * @desc    Get all assignments pending review for a family
 * @access  Private/Parent/Spouse
 */
router.get('/pending-review/:familyId', authenticate, requireRole(['parent', 'spouse']), assignmentController.getPendingReviews);

/**
 * @route   GET /api/assignments/overdue/:familyId
 * @desc    Get all overdue assignments for a family
 * @access  Private/Parent/Spouse
 */
router.get('/overdue/:familyId', authenticate, requireRole(['parent', 'spouse']), assignmentController.getOverdueAssignments);

/**
 * @route   PATCH /api/assignments/:assignmentId/extend-deadline
 * @desc    Extend assignment deadline (Parent/Spouse only)
 * @access  Private/Parent/Spouse
 */
router.patch('/:assignmentId/extend-deadline', authenticate, requireRole(['parent', 'spouse']), assignmentController.extendDeadline);

// ============================================================================
// STATISTICS ROUTES
// ============================================================================

/**
 * @route   GET /api/assignments/statistics/child/:childId
 * @desc    Get assignment statistics for a child
 * @access  Private (Child can view own, Parent/Spouse can view any)
 */
router.get('/statistics/child/:childId', authenticate, assignmentController.getChildStatistics);

/**
 * @route   GET /api/assignments/statistics/family/:familyId
 * @desc    Get assignment statistics for a family
 * @access  Private/Parent/Spouse
 */
router.get('/statistics/family/:familyId', authenticate, requireRole(['parent', 'spouse']), assignmentController.getFamilyStatistics);

module.exports = router;