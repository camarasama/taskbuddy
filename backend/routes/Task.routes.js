// ============================================================================
// Task Routes - UPDATED WITH ASSIGN FUNCTIONALITY
// Handles task creation, updates, deletion, and retrieval
// Author: Souleymane Camara - BIT1007326
// ============================================================================

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validateTaskCreation, validateTaskUpdate } = require('../middleware/validator.middleware');

// ============================================================================
// PROTECTED ROUTES (Authentication required)
// ============================================================================

/**
 * @route   POST /api/tasks
 * @desc    Create a new task (Parent/Spouse only)
 * @access  Private/Parent/Spouse
 */
router.post('/', authenticate, requireRole(['parent', 'spouse']), validateTaskCreation, taskController.createTask);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks with filters (family, status, category, assigned child)
 * @access  Private
 * @query   familyId, status, category, assignedTo, priority
 */
router.get('/', authenticate, taskController.getTasks);

// ============================================================================
// TASK ASSIGNMENT ROUTES - ✅ ADDED
// IMPORTANT: These must come BEFORE the generic /:taskId route!
// ============================================================================

/**
 * @route   POST /api/tasks/:taskId/assign
 * @desc    Assign task to one or more children
 * @access  Private/Parent/Spouse
 * @body    { child_ids: [1, 2, 3] }
 */
router.post('/:taskId/assign', 
  authenticate, 
  requireRole(['parent', 'spouse']), 
  taskController.assignTaskToChildren
);

/**
 * @route   GET /api/tasks/:taskId/assignments
 * @desc    Get all assignments for a specific task
 * @access  Private (Family members only)
 */
router.get('/:taskId/assignments', authenticate, taskController.getTaskAssignments);

// ============================================================================
// TASK DETAIL ROUTES
// ============================================================================

/**
 * @route   GET /api/tasks/:taskId
 * @desc    Get task by ID with details
 * @access  Private (Family members only)
 */
router.get('/:taskId', authenticate, taskController.getTaskById);

/**
 * @route   PUT /api/tasks/:taskId
 * @desc    Update task (Parent/Spouse only)
 * @access  Private/Parent/Spouse
 */
router.put('/:taskId', authenticate, requireRole(['parent', 'spouse']), validateTaskUpdate, taskController.updateTask);

/**
 * @route   DELETE /api/tasks/:taskId
 * @desc    Delete task (Parent/Spouse only)
 * @access  Private/Parent/Spouse
 */
router.delete('/:taskId', authenticate, requireRole(['parent', 'spouse']), taskController.deleteTask);

/**
 * @route   PATCH /api/tasks/:taskId/status
 * @desc    Change task status (active/inactive/archived)
 * @access  Private/Parent/Spouse
 */
router.patch('/:taskId/status', authenticate, requireRole(['parent', 'spouse']), taskController.updateTaskStatus);

/**
 * @route   POST /api/tasks/:taskId/duplicate
 * @desc    Duplicate a task (Parent/Spouse only)
 * @access  Private/Parent/Spouse
 */
router.post('/:taskId/duplicate', authenticate, requireRole(['parent', 'spouse']), taskController.duplicateTask);

// ============================================================================
// FAMILY TASK ROUTES
// ============================================================================

/**
 * @route   GET /api/tasks/family/:familyId
 * @desc    Get all tasks for a specific family
 * @access  Private (Family members only)
 */
router.get('/family/:familyId', authenticate, taskController.getFamilyTasks);

/**
 * @route   GET /api/tasks/family/:familyId/active
 * @desc    Get all active tasks for a family
 * @access  Private (Family members only)
 */
router.get('/family/:familyId/active', authenticate, taskController.getActiveFamilyTasks);

/**
 * @route   GET /api/tasks/family/:familyId/recurring
 * @desc    Get all recurring tasks for a family
 * @access  Private (Family members only)
 */
router.get('/family/:familyId/recurring', authenticate, taskController.getRecurringTasks);

// ============================================================================
// STATISTICS ROUTES
// ============================================================================

/**
 * @route   GET /api/tasks/statistics/:familyId
 * @desc    Get task statistics for a family
 * @access  Private/Parent/Spouse
 */
router.get('/statistics/:familyId', authenticate, requireRole(['parent', 'spouse']), taskController.getTaskStatistics);

module.exports = router;