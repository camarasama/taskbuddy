// ============================================================================
// Report Validator
// Request validation for report endpoints
// Author: Souleymane Camara - BIT1007326
// ============================================================================

const { body, query, param, validationResult } = require('express-validator');

// ==========================================================================
// VALIDATION HELPER
// ==========================================================================

/**
 * Check for validation errors and return formatted response
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// ==========================================================================
// COMMON VALIDATORS
// ==========================================================================

/**
 * Validate family ID
 */
const validateFamilyId = () => [
  query('family_id')
    .notEmpty().withMessage('family_id is required')
    .isInt({ min: 1 }).withMessage('family_id must be a positive integer')
];

/**
 * Validate child ID
 */
const validateChildId = () => [
  query('child_id')
    .notEmpty().withMessage('child_id is required')
    .isInt({ min: 1 }).withMessage('child_id must be a positive integer')
];

/**
 * Validate parent ID
 */
const validateParentId = () => [
  query('parent_id')
    .notEmpty().withMessage('parent_id is required')
    .isInt({ min: 1 }).withMessage('parent_id must be a positive integer')
];

/**
 * Validate date preset
 */
const validateDatePreset = () => [
  query('date_preset')
    .optional()
    .isIn([
      'today', 'yesterday', 'this_week', 'last_week',
      'this_month', 'last_month', 'last_7_days', 'last_30_days',
      'last_90_days', 'this_year', 'last_year', 'all_time', 'custom'
    ])
    .withMessage('Invalid date preset. Must be one of: today, yesterday, this_week, last_week, this_month, last_month, last_7_days, last_30_days, last_90_days, this_year, last_year, all_time, custom')
];

/**
 * Validate custom date range
 */
const validateDateRange = () => [
  query('start_date')
    .optional()
    .isISO8601().withMessage('start_date must be a valid ISO 8601 date'),
  query('end_date')
    .optional()
    .isISO8601().withMessage('end_date must be a valid ISO 8601 date')
    .custom((endDate, { req }) => {
      if (endDate && req.query.start_date) {
        const start = new Date(req.query.start_date);
        const end = new Date(endDate);
        if (end < start) {
          throw new Error('end_date must be after start_date');
        }
      }
      return true;
    })
];

/**
 * Validate custom date range requires both dates
 */
const validateCustomDateRange = () => [
  query('date_preset')
    .custom((preset, { req }) => {
      if (preset === 'custom') {
        if (!req.query.start_date || !req.query.end_date) {
          throw new Error('start_date and end_date are required when date_preset is "custom"');
        }
      }
      return true;
    })
];

// ==========================================================================
// REPORT-SPECIFIC VALIDATORS
// ==========================================================================

/**
 * Validate child performance report request
 */
const validateChildPerformanceReport = [
  ...validateChildId(),
  ...validateFamilyId(),
  ...validateDatePreset(),
  ...validateDateRange(),
  ...validateCustomDateRange(),
  handleValidationErrors
];

/**
 * Validate task analytics report request
 */
const validateTaskAnalyticsReport = [
  ...validateFamilyId(),
  query('category')
    .optional()
    .isString().withMessage('category must be a string')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('category must be between 1 and 100 characters'),
  ...validateDatePreset(),
  ...validateDateRange(),
  ...validateCustomDateRange(),
  handleValidationErrors
];

/**
 * Validate reward analytics report request
 */
const validateRewardAnalyticsReport = [
  ...validateFamilyId(),
  ...validateDatePreset(),
  ...validateDateRange(),
  ...validateCustomDateRange(),
  handleValidationErrors
];

/**
 * Validate family summary report request
 */
const validateFamilySummaryReport = [
  ...validateFamilyId(),
  ...validateDatePreset(),
  ...validateDateRange(),
  ...validateCustomDateRange(),
  handleValidationErrors
];

/**
 * Validate parent activity report request
 */
const validateParentActivityReport = [
  ...validateParentId(),
  ...validateFamilyId(),
  ...validateDatePreset(),
  ...validateDateRange(),
  ...validateCustomDateRange(),
  handleValidationErrors
];

/**
 * Validate bulk report generation request
 */
const validateBulkReportRequest = [
  body('family_id')
    .notEmpty().withMessage('family_id is required')
    .isInt({ min: 1 }).withMessage('family_id must be a positive integer'),
  body('report_types')
    .notEmpty().withMessage('report_types is required')
    .isArray({ min: 1 }).withMessage('report_types must be a non-empty array')
    .custom((types) => {
      const validTypes = [
        'child_performance',
        'task_analytics',
        'reward_analytics',
        'family_summary',
        'parent_activity'
      ];
      const invalidTypes = types.filter(type => !validTypes.includes(type));
      if (invalidTypes.length > 0) {
        throw new Error(`Invalid report types: ${invalidTypes.join(', ')}. Valid types are: ${validTypes.join(', ')}`);
      }
      return true;
    }),
  body('child_id')
    .optional()
    .isInt({ min: 1 }).withMessage('child_id must be a positive integer'),
  body('parent_id')
    .optional()
    .isInt({ min: 1 }).withMessage('parent_id must be a positive integer'),
  body('date_preset')
    .optional()
    .isIn([
      'today', 'yesterday', 'this_week', 'last_week',
      'this_month', 'last_month', 'last_7_days', 'last_30_days',
      'last_90_days', 'this_year', 'last_year', 'all_time', 'custom'
    ])
    .withMessage('Invalid date preset'),
  body('start_date')
    .optional()
    .isISO8601().withMessage('start_date must be a valid ISO 8601 date'),
  body('end_date')
    .optional()
    .isISO8601().withMessage('end_date must be a valid ISO 8601 date'),
  handleValidationErrors
];

// ==========================================================================
// ANALYTICS VALIDATORS
// ==========================================================================

/**
 * Validate performance score request
 */
const validatePerformanceScore = [
  ...validateChildId(),
  ...validateFamilyId(),
  ...validateDatePreset(),
  ...validateDateRange(),
  handleValidationErrors
];

/**
 * Validate family engagement request
 */
const validateFamilyEngagement = [
  ...validateFamilyId(),
  ...validateDatePreset(),
  ...validateDateRange(),
  handleValidationErrors
];

/**
 * Validate performance trend request
 */
const validatePerformanceTrend = [
  ...validateChildId(),
  ...validateFamilyId(),
  query('period')
    .optional()
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('period must be one of: daily, weekly, monthly'),
  handleValidationErrors
];

/**
 * Validate task completion prediction request
 */
const validateTaskCompletionPrediction = [
  query('assignment_id')
    .notEmpty().withMessage('assignment_id is required')
    .isInt({ min: 1 }).withMessage('assignment_id must be a positive integer'),
  handleValidationErrors
];

// ==========================================================================
// EXPORT VALIDATORS
// ==========================================================================

/**
 * Validate export request (CSV/PDF)
 */
const validateExportRequest = [
  body('family_id')
    .notEmpty().withMessage('family_id is required')
    .isInt({ min: 1 }).withMessage('family_id must be a positive integer'),
  body('filename')
    .optional()
    .isString().withMessage('filename must be a string')
    .trim()
    .isLength({ min: 1, max: 255 }).withMessage('filename must be between 1 and 255 characters')
    .matches(/^[a-zA-Z0-9_-]+\.(csv|pdf)$/).withMessage('filename must end with .csv or .pdf and contain only alphanumeric characters, underscores, and hyphens'),
  body('date_preset')
    .optional()
    .isIn([
      'today', 'yesterday', 'this_week', 'last_week',
      'this_month', 'last_month', 'last_7_days', 'last_30_days',
      'last_90_days', 'this_year', 'last_year', 'all_time', 'custom'
    ])
    .withMessage('Invalid date preset'),
  body('start_date')
    .optional()
    .isISO8601().withMessage('start_date must be a valid ISO 8601 date'),
  body('end_date')
    .optional()
    .isISO8601().withMessage('end_date must be a valid ISO 8601 date'),
  handleValidationErrors
];

/**
 * Validate child export request (requires child_id)
 */
const validateChildExportRequest = [
  body('child_id')
    .notEmpty().withMessage('child_id is required')
    .isInt({ min: 1 }).withMessage('child_id must be a positive integer'),
  ...validateExportRequest
];

/**
 * Validate download filename parameter
 */
const validateDownloadFilename = [
  param('filename')
    .notEmpty().withMessage('filename is required')
    .isString().withMessage('filename must be a string')
    .matches(/^[a-zA-Z0-9_-]+\.(csv|pdf)$/).withMessage('Invalid filename format')
    .isLength({ max: 255 }).withMessage('filename too long'),
  handleValidationErrors
];

// ==========================================================================
// CHART DATA VALIDATORS
// ==========================================================================

/**
 * Validate monthly trend chart request
 */
const validateMonthlyTrendChart = [
  ...validateChildId(),
  ...validateFamilyId(),
  query('months')
    .optional()
    .isInt({ min: 1, max: 24 }).withMessage('months must be between 1 and 24'),
  handleValidationErrors
];

/**
 * Validate category breakdown chart request
 */
const validateCategoryBreakdownChart = [
  ...validateFamilyId(),
  ...validateDatePreset(),
  ...validateDateRange(),
  handleValidationErrors
];

// ==========================================================================
// EXPORTS
// ==========================================================================

module.exports = {
  // Report validators
  validateChildPerformanceReport,
  validateTaskAnalyticsReport,
  validateRewardAnalyticsReport,
  validateFamilySummaryReport,
  validateParentActivityReport,
  validateBulkReportRequest,
  
  // Analytics validators
  validatePerformanceScore,
  validateFamilyEngagement,
  validatePerformanceTrend,
  validateTaskCompletionPrediction,
  
  // Export validators (with aliases for backward compatibility)
  validateExportRequest,
  validateChildExportRequest,
  validateDownloadFilename,
  validateExportCSV: validateExportRequest,           // Alias
  validateExportPDF: validateExportRequest,           // Alias
  validateDownloadFile: validateDownloadFilename,     // Alias
  
  // Chart validators
  validateMonthlyTrendChart,
  validateCategoryBreakdownChart,
  
  // Common validators (for reuse)
  validateFamilyId,
  validateChildId,
  validateParentId,
  validateDatePreset,
  validateDateRange,
  
  // Helper
  handleValidationErrors
};