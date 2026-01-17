// ============================================================================
// Analytics Routes
// API endpoints for analytics and performance calculations
// Author: Souleymane Camara - BIT1007326
// ============================================================================

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Import validators from Phase 4
const {
  validatePerformanceScore,
  validateFamilyEngagement,
  validatePerformanceTrend,
  validateMonthlyTrendChart
} = require('../validators/report.validator');

// ==========================================================================
// PERFORMANCE CALCULATIONS
// ==========================================================================

/**
 * @route   GET /api/analytics/performance-score
 * @desc    Calculate child performance score
 * @access  Private (Parent, Spouse, Admin)
 * @query   child_id, family_id, start_date, end_date
 */
router.get(
  '/performance-score',
  authenticate,
  requireRole(['parent', 'spouse', 'admin']),
  validatePerformanceScore,
  analyticsController.calculatePerformanceScore
);

/**
 * @route   GET /api/analytics/family-engagement
 * @desc    Calculate family engagement score
 * @access  Private (Parent, Spouse, Admin)
 * @query   family_id, start_date, end_date
 */
router.get(
  '/family-engagement',
  authenticate,
  requireRole(['parent', 'spouse', 'admin']),
  validateFamilyEngagement,
  analyticsController.calculateFamilyEngagement
);

// ==========================================================================
// TREND ANALYSIS
// ==========================================================================

/**
 * @route   GET /api/analytics/performance-trend
 * @desc    Analyze performance trends over time
 * @access  Private (Parent, Spouse, Admin)
 * @query   child_id, family_id, period (monthly/weekly)
 */
router.get(
  '/performance-trend',
  authenticate,
  requireRole(['parent', 'spouse', 'admin']),
  validatePerformanceTrend,
  analyticsController.analyzePerformanceTrend
);

/**
 * @route   GET /api/analytics/category-performance
 * @desc    Analyze task category performance
 * @access  Private (Parent, Spouse, Admin)
 * @query   family_id, start_date, end_date
 */
router.get(
  '/category-performance',
  authenticate,
  requireRole(['parent', 'spouse', 'admin']),
  analyticsController.analyzeCategoryPerformance
);

// ==========================================================================
// COMPARATIVE ANALYSIS
// ==========================================================================

/**
 * @route   GET /api/analytics/children-comparison
 * @desc    Compare performance of children within family
 * @access  Private (Parent, Spouse, Admin)
 * @query   family_id, start_date, end_date
 */
router.get(
  '/children-comparison',
  authenticate,
  requireRole(['parent', 'spouse', 'admin']),
  analyticsController.compareChildrenPerformance
);

/**
 * @route   GET /api/analytics/task-types-comparison
 * @desc    Compare effectiveness of different task types
 * @access  Private (Parent, Spouse, Admin)
 * @query   family_id, start_date, end_date
 */
router.get(
  '/task-types-comparison',
  authenticate,
  requireRole(['parent', 'spouse', 'admin']),
  analyticsController.compareTaskTypes
);

// ==========================================================================
// PREDICTIVE ANALYTICS
// ==========================================================================

/**
 * @route   GET /api/analytics/predict-completion
 * @desc    Predict task completion probability
 * @access  Private (Parent, Spouse, Admin)
 * @query   assignment_id
 */
router.get(
  '/predict-completion',
  authenticate,
  requireRole(['parent', 'spouse', 'admin']),
  analyticsController.predictTaskCompletion
);

/**
 * @route   GET /api/analytics/forecast-activity
 * @desc    Forecast family activity for next period
 * @access  Private (Parent, Spouse, Admin)
 * @query   family_id
 */
router.get(
  '/forecast-activity',
  authenticate,
  requireRole(['parent', 'spouse', 'admin']),
  analyticsController.forecastFamilyActivity
);

// ==========================================================================
// CHART DATA ENDPOINTS
// ==========================================================================

/**
 * @route   GET /api/analytics/charts/monthly-trend
 * @desc    Get formatted data for monthly trend chart
 * @access  Private (Parent, Spouse, Admin, Child)
 * @query   child_id, family_id, months
 */
router.get(
  '/charts/monthly-trend',
  authenticate,
  validateMonthlyTrendChart,
  analyticsController.getMonthlyTrendChartData
);

/**
 * @route   GET /api/analytics/charts/category-breakdown
 * @desc    Get formatted data for category breakdown chart
 * @access  Private (Parent, Spouse, Admin)
 * @query   family_id, start_date, end_date
 */
router.get(
  '/charts/category-breakdown',
  authenticate,
  requireRole(['parent', 'spouse', 'admin']),
  analyticsController.getCategoryBreakdownChartData
);

/**
 * @route   GET /api/analytics/charts/performance-radar
 * @desc    Get formatted data for child performance radar chart
 * @access  Private (Parent, Spouse, Admin, Child)
 * @query   child_id, family_id, start_date, end_date
 */
router.get(
  '/charts/performance-radar',
  authenticate,
  analyticsController.getPerformanceRadarChartData
);

module.exports = router;