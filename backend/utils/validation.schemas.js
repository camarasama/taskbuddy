// ============================================================================
// Validation Schemas
// Centralized validation schemas for request validation
// ============================================================================

/**
 * This file contains validation schemas that can be used with
 * express-validator or other validation libraries.
 * 
 * These schemas ensure consistent validation across the application.
 */

const { body, param, query } = require('express-validator');

// ============================================================================
// COMMON VALIDATIONS
// ============================================================================

exports.commonValidations = {
  id: param('id').isInt({ min: 1 }).withMessage('Invalid ID'),
  
  email: body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  
  password: body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter'),
  
  name: body('full_name')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name should only contain letters'),
  
  phoneNumber: body('phone_number')
    .optional()
    .isMobilePhone().withMessage('Valid phone number is required'),
  
  date: body('date_of_birth')
    .optional()
    .isISO8601().withMessage('Valid date is required'),
  
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ]
};

// ============================================================================
// USER SCHEMAS
// ============================================================================

exports.userSchemas = {
  registration: [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/\d/).withMessage('Password must contain at least one number')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter'),
    body('full_name')
      .trim()
      .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('date_of_birth').optional().isISO8601().withMessage('Valid date of birth is required'),
    body('phone_number').optional().isMobilePhone().withMessage('Valid phone number is required')
  ],
  
  login: [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  
  profileUpdate: [
    body('full_name').optional().trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('date_of_birth').optional().isISO8601().withMessage('Valid date of birth is required'),
    body('phone_number').optional().isMobilePhone().withMessage('Valid phone number is required')
  ]
};

// ============================================================================
// FAMILY SCHEMAS
// ============================================================================

exports.familySchemas = {
  create: [
    body('family_name')
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Family name must be between 2 and 100 characters')
  ],
  
  update: [
    body('family_name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Family name must be between 2 and 100 characters')
  ],
  
  addMember: [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('full_name').trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('date_of_birth').isISO8601().withMessage('Valid date of birth is required')
  ]
};

// ============================================================================
// TASK SCHEMAS
// ============================================================================

exports.taskSchemas = {
  create: [
    body('family_id').isInt({ min: 1 }).withMessage('Valid family ID is required'),
    body('title')
      .trim()
      .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('category')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Category must be less than 100 characters'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority level'),
    body('points_reward')
      .isInt({ min: 1 }).withMessage('Points reward must be a positive number'),
    body('photo_required')
      .optional()
      .isBoolean().withMessage('Photo required must be a boolean'),
    body('deadline')
      .optional()
      .isISO8601().withMessage('Valid deadline date is required'),
    body('is_recurring')
      .optional()
      .isBoolean().withMessage('Is recurring must be a boolean')
  ],
  
  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority level'),
    body('points_reward')
      .optional()
      .isInt({ min: 1 }).withMessage('Points reward must be a positive number')
  ]
};

// ============================================================================
// ASSIGNMENT SCHEMAS
// ============================================================================

exports.assignmentSchemas = {
  create: [
    body('task_id').isInt({ min: 1 }).withMessage('Valid task ID is required'),
    body('child_ids').isArray({ min: 1 }).withMessage('At least one child must be assigned'),
    body('child_ids.*').isInt({ min: 1 }).withMessage('Valid child ID is required'),
    body('due_date').optional().isISO8601().withMessage('Valid due date is required')
  ],
  
  submit: [
    body('submission_notes')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
  ],
  
  review: [
    body('status')
      .isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
    body('review_comments')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Comments must be less than 500 characters')
  ]
};

// ============================================================================
// REWARD SCHEMAS
// ============================================================================

exports.rewardSchemas = {
  create: [
    body('family_id').isInt({ min: 1 }).withMessage('Valid family ID is required'),
    body('reward_name')
      .trim()
      .isLength({ min: 2, max: 255 }).withMessage('Reward name must be between 2 and 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
    body('points_required')
      .isInt({ min: 1 }).withMessage('Points required must be a positive number'),
    body('quantity_available')
      .optional()
      .isInt({ min: 1 }).withMessage('Quantity must be a positive number')
  ],
  
  update: [
    body('reward_name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 255 }).withMessage('Reward name must be between 2 and 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
    body('points_required')
      .optional()
      .isInt({ min: 1 }).withMessage('Points required must be a positive number')
  ]
};

// ============================================================================
// REDEMPTION SCHEMAS
// ============================================================================

exports.redemptionSchemas = {
  request: [
    body('reward_id').isInt({ min: 1 }).withMessage('Valid reward ID is required')
  ],
  
  review: [
    body('status')
      .isIn(['approved', 'denied']).withMessage('Status must be approved or denied'),
    body('review_notes')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
  ]
};

// ============================================================================
// POINTS SCHEMAS
// ============================================================================

exports.pointsSchemas = {
  adjust: [
    body('child_id').isInt({ min: 1 }).withMessage('Valid child ID is required'),
    body('family_id').isInt({ min: 1 }).withMessage('Valid family ID is required'),
    body('points_amount').isInt().withMessage('Points amount must be a number'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 255 }).withMessage('Description must be less than 255 characters')
  ]
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Custom validator: Check if value is a future date
 */
exports.isFutureDate = (value) => {
  const date = new Date(value);
  const now = new Date();
  return date > now;
};

/**
 * Custom validator: Check if array contains unique values
 */
exports.hasUniqueValues = (arr) => {
  return new Set(arr).size === arr.length;
};

/**
 * Custom validator: Check if string contains only alphanumeric characters
 */
exports.isAlphanumeric = (value) => {
  return /^[a-zA-Z0-9]+$/.test(value);
};

/**
 * Custom validator: Check if age is within range
 */
exports.isValidAge = (dateOfBirth, minAge, maxAge) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= minAge && age <= maxAge;
};
