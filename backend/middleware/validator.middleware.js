// ============================================================================
// Validator Middleware
// Request validation using express-validator
// ============================================================================

const { body, validationResult } = require('express-validator');

// ============================================================================
// VALIDATION ERROR HANDLER
// ============================================================================
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

// ============================================================================
// AUTHENTICATION VALIDATORS
// ============================================================================

exports.validateRegistration = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter'),
  body('full_name')
    .trim()
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Full name should only contain letters'),
  body('date_of_birth')
    .optional()
    .isISO8601().withMessage('Valid date of birth is required'),
  body('phone_number')
    .optional()
    .isMobilePhone().withMessage('Valid phone number is required'),
  handleValidationErrors
];

exports.validateLogin = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

exports.validateEmail = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  handleValidationErrors
];

exports.validatePasswordReset = [
  body('token')
    .notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter'),
  handleValidationErrors
];

// ============================================================================
// USER VALIDATORS
// ============================================================================

exports.validateProfileUpdate = [
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('date_of_birth')
    .optional()
    .isISO8601().withMessage('Valid date of birth is required'),
  body('phone_number')
    .optional()
    .isMobilePhone().withMessage('Valid phone number is required'),
  handleValidationErrors
];

// ============================================================================
// FAMILY VALIDATORS
// ============================================================================

exports.validateFamilyCreation = [
  body('family_name')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Family name must be between 2 and 100 characters'),
  handleValidationErrors
];

exports.validateFamilyUpdate = [
  body('family_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Family name must be between 2 and 100 characters'),
  handleValidationErrors
];

exports.validateMemberAdd = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('full_name')
    .trim()
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('date_of_birth')
    .isISO8601().withMessage('Valid date of birth is required'),
  handleValidationErrors
];

// ============================================================================
// TASK VALIDATORS
// ============================================================================

exports.validateTaskCreation = [
  body('family_id')
    .isInt({ min: 1 }).withMessage('Valid family ID is required'),
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
    .isBoolean().withMessage('Is recurring must be a boolean'),
  handleValidationErrors
];

exports.validateTaskUpdate = [
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
    .isInt({ min: 1 }).withMessage('Points reward must be a positive number'),
  handleValidationErrors
];

// ============================================================================
// ASSIGNMENT VALIDATORS
// ============================================================================

exports.validateAssignment = [
  body('task_id')
    .isInt({ min: 1 }).withMessage('Valid task ID is required'),
  body('child_ids')
    .isArray({ min: 1 }).withMessage('At least one child must be assigned'),
  body('child_ids.*')
    .isInt({ min: 1 }).withMessage('Valid child ID is required'),
  body('due_date')
    .optional()
    .isISO8601().withMessage('Valid due date is required'),
  handleValidationErrors
];

exports.validateSubmission = [
  body('submission_notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
  handleValidationErrors
];

exports.validateReview = [
  body('status')
    .isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
  body('review_comments')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Comments must be less than 500 characters'),
  handleValidationErrors
];

// ============================================================================
// REWARD VALIDATORS
// ============================================================================

exports.validateRewardCreation = [
  body('family_id')
    .isInt({ min: 1 }).withMessage('Valid family ID is required'),
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
    .isInt({ min: 1 }).withMessage('Quantity must be a positive number'),
  handleValidationErrors
];

exports.validateRewardUpdate = [
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
    .isInt({ min: 1 }).withMessage('Points required must be a positive number'),
  handleValidationErrors
];

// ============================================================================
// REDEMPTION VALIDATORS
// ============================================================================

exports.validateRedemptionRequest = [
  body('reward_id')
    .isInt({ min: 1 }).withMessage('Valid reward ID is required'),
  handleValidationErrors
];

exports.validateRedemptionReview = [
  body('status')
    .isIn(['approved', 'denied']).withMessage('Status must be approved or denied'),
  body('review_notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
  handleValidationErrors
];

// ============================================================================
// POINTS VALIDATORS
// ============================================================================

exports.validatePointsAdjustment = [
  body('child_id')
    .isInt({ min: 1 }).withMessage('Valid child ID is required'),
  body('family_id')
    .isInt({ min: 1 }).withMessage('Valid family ID is required'),
  body('points_amount')
    .isInt().withMessage('Points amount must be a number'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Description must be less than 255 characters'),
  handleValidationErrors
];
