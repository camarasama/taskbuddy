// ============================================================================
// Report Routes
// Handles analytics, reports, and data visualization endpoints
// ============================================================================

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Import validators from Phase 4
const {
  validateChildPerformanceReport,
  validateTaskAnalyticsReport,
  validateRewardAnalyticsReport,
  validateFamilySummaryReport,
  validateParentActivityReport
} = require('../validators/report.validator');

// ============================================================================
// CHILD PERFORMANCE REPORTS
// ============================================================================

/**
 * @route   GET /api/reports/child-performance/:childId
 * @desc    Get comprehensive performance report for a child
 * @access  Private (Child can view own, Parent/Spouse can view any)
 * @query   startDate, endDate, period (week/month/year)
 */
router.get(
  '/child-performance/:childId',
  authenticate,
  validateChildPerformanceReport,
  reportController.getChildPerformanceReport
);

/**
 * @route   GET /api/reports/child-performance/:childId/summary
 * @desc    Get quick performance summary for a child
 * @access  Private (Child can view own, Parent/Spouse can view any)
 */
router.get('/child-performance/:childId/summary', authenticate, reportController.getChildPerformanceSummary);

/**
 * @route   GET /api/reports/child-performance/:childId/trends
 * @desc    Get performance trends over time for a child
 * @access  Private (Child can view own, Parent/Spouse can view any)
 * @query   period (week/month/quarter/year)
 */
router.get('/child-performance/:childId/trends', authenticate, reportController.getChildPerformanceTrends);

// ============================================================================
// TASK ANALYTICS REPORTS
// ============================================================================

/**
 * @route   GET /api/reports/task-analytics/:familyId
 * @desc    Get task analytics for a family
 * @access  Private/Parent/Spouse
 * @query   startDate, endDate, category, priority
 */
router.get(
  '/task-analytics/:familyId',
  authenticate,
  requireRole(['parent', 'spouse']),
  validateTaskAnalyticsReport,
  reportController.getTaskAnalytics
);

/**
 * @route   GET /api/reports/task-completion/:familyId
 * @desc    Get task completion rate report
 * @access  Private/Parent/Spouse
 * @query   startDate, endDate
 */
router.get('/task-completion/:familyId', authenticate, requireRole(['parent', 'spouse']), reportController.getTaskCompletionReport);

/**
 * @route   GET /api/reports/task-categories/:familyId
 * @desc    Get task distribution by category
 * @access  Private/Parent/Spouse
 */
router.get('/task-categories/:familyId', authenticate, requireRole(['parent', 'spouse']), reportController.getTaskCategoryReport);

/**
 * @route   GET /api/reports/overdue-tasks/:familyId
 * @desc    Get overdue tasks report
 * @access  Private/Parent/Spouse
 */
router.get('/overdue-tasks/:familyId', authenticate, requireRole(['parent', 'spouse']), reportController.getOverdueTasksReport);

// ============================================================================
// REWARD REDEMPTION REPORTS
// ============================================================================

/**
 * @route   GET /api/reports/reward-redemptions/:familyId
 * @desc    Get reward redemption report for a family
 * @access  Private/Parent/Spouse
 * @query   startDate, endDate
 */
router.get(
  '/reward-redemptions/:familyId',
  authenticate,
  requireRole(['parent', 'spouse']),
  validateRewardAnalyticsReport,
  reportController.getRewardRedemptionReport
);

/**
 * @route   GET /api/reports/popular-rewards/:familyId
 * @desc    Get most popular rewards report
 * @access  Private/Parent/Spouse
 * @query   limit
 */
router.get('/popular-rewards/:familyId', authenticate, requireRole(['parent', 'spouse']), reportController.getPopularRewardsReport);

/**
 * @route   GET /api/reports/reward-trends/:familyId
 * @desc    Get reward redemption trends over time
 * @access  Private/Parent/Spouse
 * @query   period (week/month/quarter/year)
 */
router.get('/reward-trends/:familyId', authenticate, requireRole(['parent', 'spouse']), reportController.getRewardTrends);

// ============================================================================
// FAMILY ACTIVITY REPORTS
// ============================================================================

/**
 * @route   GET /api/reports/family-summary/:familyId
 * @desc    Get comprehensive family activity summary
 * @access  Private/Parent/Spouse
 * @query   startDate, endDate
 */
router.get(
  '/family-summary/:familyId',
  authenticate,
  requireRole(['parent', 'spouse']),
  validateFamilySummaryReport,
  reportController.getFamilyActivitySummary
);

/**
 * @route   GET /api/reports/family-dashboard/:familyId
 * @desc    Get family dashboard data (overview metrics)
 * @access  Private (Family members only)
 */
router.get('/family-dashboard/:familyId', authenticate, reportController.getFamilyDashboard);

/**
 * @route   GET /api/reports/family-engagement/:familyId
 * @desc    Get family engagement metrics
 * @access  Private/Parent/Spouse
 * @query   period (week/month/year)
 */
router.get('/family-engagement/:familyId', authenticate, requireRole(['parent', 'spouse']), reportController.getFamilyEngagementReport);

// ============================================================================
// PARENT ACTIVITY REPORTS
// ============================================================================

/**
 * @route   GET /api/reports/parent-activity/:familyId
 * @desc    Get parent activity report (tasks created, reviews done, etc.)
 * @access  Private/Parent/Spouse
 * @query   startDate, endDate
 */
router.get(
  '/parent-activity/:familyId',
  authenticate,
  requireRole(['parent', 'spouse']),
  validateParentActivityReport,
  reportController.getParentActivityReport
);

/**
 * @route   GET /api/reports/parent-activity/:parentId/summary
 * @desc    Get individual parent activity summary
 * @access  Private/Parent/Spouse
 */
router.get('/parent-activity/:parentId/summary', authenticate, requireRole(['parent', 'spouse']), reportController.getParentActivitySummary);

// ============================================================================
// POINTS ANALYTICS REPORTS
// ============================================================================

/**
 * @route   GET /api/reports/points-distribution/:familyId
 * @desc    Get points distribution across children
 * @access  Private/Parent/Spouse
 */
router.get('/points-distribution/:familyId', authenticate, requireRole(['parent', 'spouse']), reportController.getPointsDistributionReport);

/**
 * @route   GET /api/reports/points-trends/:childId
 * @desc    Get points earning/spending trends for a child
 * @access  Private (Child can view own, Parent/Spouse can view any)
 * @query   period (week/month/quarter/year)
 */
router.get('/points-trends/:childId', authenticate, reportController.getPointsTrends);

// ============================================================================
// COMPARATIVE REPORTS
// ============================================================================

/**
 * @route   GET /api/reports/compare-children/:familyId
 * @desc    Compare performance across all children in family
 * @access  Private/Parent/Spouse
 * @query   metrics (completion_rate, points_earned, tasks_completed)
 */
router.get('/compare-children/:familyId', authenticate, requireRole(['parent', 'spouse']), reportController.compareChildren);

/**
 * @route   GET /api/reports/period-comparison/:familyId
 * @desc    Compare family activity across different time periods
 * @access  Private/Parent/Spouse
 * @query   period1Start, period1End, period2Start, period2End
 */
router.get('/period-comparison/:familyId', authenticate, requireRole(['parent', 'spouse']), reportController.comparePeriods);

// ============================================================================
// EXPORT ROUTES (Future Enhancement)
// ============================================================================

/**
 * @route   GET /api/reports/export/:familyId/pdf
 * @desc    Export family report as PDF
 * @access  Private/Parent/Spouse
 */
router.get('/export/:familyId/pdf', authenticate, requireRole(['parent', 'spouse']), reportController.exportReportPDF);

/**
 * @route   GET /api/reports/export/:familyId/csv
 * @desc    Export family data as CSV
 * @access  Private/Parent/Spouse
 */
router.get('/export/:familyId/csv', authenticate, requireRole(['parent', 'spouse']), reportController.exportReportCSV);

module.exports = router;