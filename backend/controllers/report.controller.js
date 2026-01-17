// ============================================================================
// Report Controller
// Handles all report generation requests with comprehensive analytics
// Author: Souleymane Camara - BIT1007326
// Project: TaskBuddy - Family Task Management System
// Phase: 4 - Reports & Analytics
// ============================================================================

const reportService = require('../services/report.service');
const { 
  formatChildPerformanceReport,
  formatTaskAnalyticsReport,
  formatRewardAnalyticsReport,
  formatFamilySummaryReport,
  formatParentActivityReport
} = require('../utils/reportFormatters');
const { getDateRange } = require('../utils/dateRangeHelper');

// ============================================================================
// CHILD PERFORMANCE REPORTS
// ============================================================================

/**
 * Get comprehensive performance report for a child
 * @route GET /api/reports/child-performance/:childId
 */
const getChildPerformanceReport = async (req, res) => {
  try {
    const { childId } = req.params;
    const { startDate, endDate, period } = req.query;

    // Get date range
    const dateRange = period 
      ? getDateRange(period)
      : { start_date: startDate, end_date: endDate };

    // Generate comprehensive report
    const reportData = await reportService.generateChildPerformanceReport({
      child_id: childId,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
      include_trends: true,
      include_comparison: true
    });

    res.status(200).json({
      success: true,
      message: 'Child performance report generated successfully',
      data: reportData
    });

  } catch (error) {
    console.error('Error generating child performance report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate child performance report',
      error: error.message
    });
  }
};

/**
 * Get quick performance summary for a child
 * @route GET /api/reports/child-performance/:childId/summary
 */
const getChildPerformanceSummary = async (req, res) => {
  try {
    const { childId } = req.params;

    // Get last 30 days summary
    const dateRange = getDateRange('last_30_days');

    const summary = await reportService.getChildPerformanceSummary({
      child_id: childId,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    res.status(200).json({
      success: true,
      message: 'Child performance summary retrieved successfully',
      data: summary
    });

  } catch (error) {
    console.error('Error getting child performance summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get child performance summary',
      error: error.message
    });
  }
};

/**
 * Get performance trends over time for a child
 * @route GET /api/reports/child-performance/:childId/trends
 */
const getChildPerformanceTrends = async (req, res) => {
  try {
    const { childId } = req.params;
    const { period = 'month' } = req.query;

    const trends = await reportService.getChildPerformanceTrends({
      child_id: childId,
      period
    });

    res.status(200).json({
      success: true,
      message: 'Child performance trends retrieved successfully',
      data: trends
    });

  } catch (error) {
    console.error('Error getting child performance trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get child performance trends',
      error: error.message
    });
  }
};

// ============================================================================
// TASK ANALYTICS REPORTS
// ============================================================================

/**
 * Get task analytics for a family
 * @route GET /api/reports/task-analytics/:familyId
 */
const getTaskAnalytics = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { startDate, endDate, category, priority } = req.query;

    const analytics = await reportService.generateTaskAnalyticsReport({
      family_id: familyId,
      start_date: startDate,
      end_date: endDate,
      category,
      priority
    });

    res.status(200).json({
      success: true,
      message: 'Task analytics report generated successfully',
      data: analytics
    });

  } catch (error) {
    console.error('Error generating task analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate task analytics',
      error: error.message
    });
  }
};

/**
 * Get task completion rate report
 * @route GET /api/reports/task-completion/:familyId
 */
const getTaskCompletionReport = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { startDate, endDate } = req.query;

    const completionData = await reportService.getTaskCompletionRate({
      family_id: familyId,
      start_date: startDate,
      end_date: endDate
    });

    res.status(200).json({
      success: true,
      message: 'Task completion report generated successfully',
      data: completionData
    });

  } catch (error) {
    console.error('Error generating task completion report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate task completion report',
      error: error.message
    });
  }
};

/**
 * Get task distribution by category
 * @route GET /api/reports/task-categories/:familyId
 */
const getTaskCategoryReport = async (req, res) => {
  try {
    const { familyId } = req.params;

    const categoryData = await reportService.getTaskCategoryDistribution({
      family_id: familyId
    });

    res.status(200).json({
      success: true,
      message: 'Task category report generated successfully',
      data: categoryData
    });

  } catch (error) {
    console.error('Error generating task category report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate task category report',
      error: error.message
    });
  }
};

/**
 * Get overdue tasks report
 * @route GET /api/reports/overdue-tasks/:familyId
 */
const getOverdueTasksReport = async (req, res) => {
  try {
    const { familyId } = req.params;

    const overdueData = await reportService.getOverdueTasks({
      family_id: familyId
    });

    res.status(200).json({
      success: true,
      message: 'Overdue tasks report generated successfully',
      data: overdueData
    });

  } catch (error) {
    console.error('Error generating overdue tasks report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate overdue tasks report',
      error: error.message
    });
  }
};

// ============================================================================
// REWARD REDEMPTION REPORTS
// ============================================================================

/**
 * Get reward redemption report for a family
 * @route GET /api/reports/reward-redemptions/:familyId
 */
const getRewardRedemptionReport = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { startDate, endDate } = req.query;

    const redemptionData = await reportService.generateRewardAnalyticsReport({
      family_id: familyId,
      start_date: startDate,
      end_date: endDate
    });

    res.status(200).json({
      success: true,
      message: 'Reward redemption report generated successfully',
      data: redemptionData
    });

  } catch (error) {
    console.error('Error generating reward redemption report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate reward redemption report',
      error: error.message
    });
  }
};

/**
 * Get most popular rewards report
 * @route GET /api/reports/popular-rewards/:familyId
 */
const getPopularRewardsReport = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { limit = 10 } = req.query;

    const popularRewards = await reportService.getPopularRewards({
      family_id: familyId,
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      message: 'Popular rewards report generated successfully',
      data: popularRewards
    });

  } catch (error) {
    console.error('Error generating popular rewards report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate popular rewards report',
      error: error.message
    });
  }
};

/**
 * Get reward redemption trends over time
 * @route GET /api/reports/reward-trends/:familyId
 */
const getRewardTrends = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { period = 'month' } = req.query;

    const trends = await reportService.getRewardRedemptionTrends({
      family_id: familyId,
      period
    });

    res.status(200).json({
      success: true,
      message: 'Reward trends retrieved successfully',
      data: trends
    });

  } catch (error) {
    console.error('Error getting reward trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reward trends',
      error: error.message
    });
  }
};

// ============================================================================
// FAMILY ACTIVITY REPORTS
// ============================================================================

/**
 * Get comprehensive family activity summary
 * @route GET /api/reports/family-summary/:familyId
 */
const getFamilyActivitySummary = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { startDate, endDate } = req.query;

    const summary = await reportService.generateFamilySummaryReport({
      family_id: familyId,
      start_date: startDate,
      end_date: endDate
    });

    res.status(200).json({
      success: true,
      message: 'Family activity summary generated successfully',
      data: summary
    });

  } catch (error) {
    console.error('Error generating family activity summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate family activity summary',
      error: error.message
    });
  }
};

/**
 * Get family dashboard data (overview metrics)
 * @route GET /api/reports/family-dashboard/:familyId
 */
const getFamilyDashboard = async (req, res) => {
  try {
    const { familyId } = req.params;

    // Get current week data for dashboard
    const dateRange = getDateRange('this_week');

    const dashboardData = await reportService.getFamilyDashboardMetrics({
      family_id: familyId,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    res.status(200).json({
      success: true,
      message: 'Family dashboard data retrieved successfully',
      data: dashboardData
    });

  } catch (error) {
    console.error('Error getting family dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get family dashboard data',
      error: error.message
    });
  }
};

/**
 * Get family engagement metrics
 * @route GET /api/reports/family-engagement/:familyId
 */
const getFamilyEngagementReport = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { period = 'month' } = req.query;

    const engagement = await reportService.getFamilyEngagement({
      family_id: familyId,
      period
    });

    res.status(200).json({
      success: true,
      message: 'Family engagement report generated successfully',
      data: engagement
    });

  } catch (error) {
    console.error('Error generating family engagement report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate family engagement report',
      error: error.message
    });
  }
};

// ============================================================================
// PARENT ACTIVITY REPORTS
// ============================================================================

/**
 * Get parent activity report (tasks created, reviews done, etc.)
 * @route GET /api/reports/parent-activity/:familyId
 */
const getParentActivityReport = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { startDate, endDate } = req.query;

    const activity = await reportService.generateParentActivityReport({
      family_id: familyId,
      start_date: startDate,
      end_date: endDate
    });

    res.status(200).json({
      success: true,
      message: 'Parent activity report generated successfully',
      data: activity
    });

  } catch (error) {
    console.error('Error generating parent activity report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate parent activity report',
      error: error.message
    });
  }
};

/**
 * Get individual parent activity summary
 * @route GET /api/reports/parent-activity/:parentId/summary
 */
const getParentActivitySummary = async (req, res) => {
  try {
    const { parentId } = req.params;

    // Get last 30 days activity
    const dateRange = getDateRange('last_30_days');

    const summary = await reportService.getParentActivitySummary({
      parent_id: parentId,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    res.status(200).json({
      success: true,
      message: 'Parent activity summary retrieved successfully',
      data: summary
    });

  } catch (error) {
    console.error('Error getting parent activity summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get parent activity summary',
      error: error.message
    });
  }
};

// ============================================================================
// POINTS ANALYTICS REPORTS
// ============================================================================

/**
 * Get points distribution across children
 * @route GET /api/reports/points-distribution/:familyId
 */
const getPointsDistributionReport = async (req, res) => {
  try {
    const { familyId } = req.params;

    const distribution = await reportService.getPointsDistribution({
      family_id: familyId
    });

    res.status(200).json({
      success: true,
      message: 'Points distribution report generated successfully',
      data: distribution
    });

  } catch (error) {
    console.error('Error generating points distribution report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate points distribution report',
      error: error.message
    });
  }
};

/**
 * Get points earning/spending trends for a child
 * @route GET /api/reports/points-trends/:childId
 */
const getPointsTrends = async (req, res) => {
  try {
    const { childId } = req.params;
    const { period = 'month' } = req.query;

    const trends = await reportService.getPointsTrends({
      child_id: childId,
      period
    });

    res.status(200).json({
      success: true,
      message: 'Points trends retrieved successfully',
      data: trends
    });

  } catch (error) {
    console.error('Error getting points trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get points trends',
      error: error.message
    });
  }
};

// ============================================================================
// COMPARATIVE REPORTS
// ============================================================================

/**
 * Compare performance across all children in family
 * @route GET /api/reports/compare-children/:familyId
 */
const compareChildren = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { metrics = 'completion_rate,points_earned,tasks_completed' } = req.query;

    const metricsArray = metrics.split(',');

    const comparison = await reportService.compareChildrenPerformance({
      family_id: familyId,
      metrics: metricsArray
    });

    res.status(200).json({
      success: true,
      message: 'Children comparison generated successfully',
      data: comparison
    });

  } catch (error) {
    console.error('Error comparing children:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare children',
      error: error.message
    });
  }
};

/**
 * Compare family activity across different time periods
 * @route GET /api/reports/period-comparison/:familyId
 */
const comparePeriods = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { period1Start, period1End, period2Start, period2End } = req.query;

    if (!period1Start || !period1End || !period2Start || !period2End) {
      return res.status(400).json({
        success: false,
        message: 'All period dates are required (period1Start, period1End, period2Start, period2End)'
      });
    }

    const comparison = await reportService.comparePeriods({
      family_id: familyId,
      period1: { start: period1Start, end: period1End },
      period2: { start: period2Start, end: period2End }
    });

    res.status(200).json({
      success: true,
      message: 'Period comparison generated successfully',
      data: comparison
    });

  } catch (error) {
    console.error('Error comparing periods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare periods',
      error: error.message
    });
  }
};

// ============================================================================
// EXPORT ROUTES (PDF & CSV)
// ============================================================================

/**
 * Export family report as PDF
 * @route GET /api/reports/export/:familyId/pdf
 */
const exportReportPDF = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { reportType = 'family_summary', startDate, endDate } = req.query;

    // Generate the requested report
    let reportData;
    switch (reportType) {
      case 'family_summary':
        reportData = await reportService.generateFamilySummaryReport({
          family_id: familyId,
          start_date: startDate,
          end_date: endDate
        });
        break;
      case 'task_analytics':
        reportData = await reportService.generateTaskAnalyticsReport({
          family_id: familyId,
          start_date: startDate,
          end_date: endDate
        });
        break;
      default:
        reportData = await reportService.generateFamilySummaryReport({
          family_id: familyId,
          start_date: startDate,
          end_date: endDate
        });
    }

    // For now, return JSON (PDF generation can be implemented later with libraries like PDFKit)
    res.status(200).json({
      success: true,
      message: 'PDF export prepared (implementation pending)',
      data: reportData,
      note: 'PDF generation will be implemented in future enhancement'
    });

  } catch (error) {
    console.error('Error exporting report as PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report as PDF',
      error: error.message
    });
  }
};

/**
 * Export family data as CSV
 * @route GET /api/reports/export/:familyId/csv
 */
const exportReportCSV = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { reportType = 'tasks', startDate, endDate } = req.query;

    // Generate CSV data based on report type
    const csvData = await reportService.generateCSVExport({
      family_id: familyId,
      report_type: reportType,
      start_date: startDate,
      end_date: endDate
    });

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="taskbuddy_${reportType}_${familyId}.csv"`);

    res.status(200).send(csvData);

  } catch (error) {
    console.error('Error exporting report as CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report as CSV',
      error: error.message
    });
  }
};

// ============================================================================
// LEGACY FUNCTIONS (Backward Compatibility)
// ============================================================================

/**
 * Generate child performance report (legacy)
 */
const generateChildPerformanceReport = async (req, res) => {
  try {
    const { child_id, family_id, date_preset, start_date, end_date } = req.query;

    if (!child_id || !family_id) {
      return res.status(400).json({
        success: false,
        message: 'child_id and family_id are required'
      });
    }

    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    const result = await reportService.generateChildPerformanceReport({
      child_id,
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    const formattedReport = formatChildPerformanceReport(result.data);

    res.status(200).json({
      success: true,
      message: 'Child performance report generated successfully',
      data: formattedReport
    });

  } catch (error) {
    console.error('Error generating child performance report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate child performance report',
      error: error.message
    });
  }
};

/**
 * Generate task analytics report (legacy)
 */
const generateTaskAnalyticsReport = async (req, res) => {
  try {
    const { family_id, category, date_preset, start_date, end_date } = req.query;

    if (!family_id) {
      return res.status(400).json({
        success: false,
        message: 'family_id is required'
      });
    }

    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    const result = await reportService.generateTaskAnalyticsReport({
      family_id,
      category: category || null,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    const formattedReport = formatTaskAnalyticsReport(result.data);

    res.status(200).json({
      success: true,
      message: 'Task analytics report generated successfully',
      data: formattedReport
    });

  } catch (error) {
    console.error('Error generating task analytics report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate task analytics report',
      error: error.message
    });
  }
};

/**
 * Generate reward analytics report (legacy)
 */
const generateRewardAnalyticsReport = async (req, res) => {
  try {
    const { family_id, date_preset, start_date, end_date } = req.query;

    if (!family_id) {
      return res.status(400).json({
        success: false,
        message: 'family_id is required'
      });
    }

    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    const result = await reportService.generateRewardAnalyticsReport({
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    const formattedReport = formatRewardAnalyticsReport(result.data);

    res.status(200).json({
      success: true,
      message: 'Reward analytics report generated successfully',
      data: formattedReport
    });

  } catch (error) {
    console.error('Error generating reward analytics report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate reward analytics report',
      error: error.message
    });
  }
};

/**
 * Generate family summary report (legacy)
 */
const generateFamilySummaryReport = async (req, res) => {
  try {
    const { family_id, date_preset, start_date, end_date } = req.query;

    if (!family_id) {
      return res.status(400).json({
        success: false,
        message: 'family_id is required'
      });
    }

    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    const result = await reportService.generateFamilySummaryReport({
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    const formattedReport = formatFamilySummaryReport(result.data);

    res.status(200).json({
      success: true,
      message: 'Family summary report generated successfully',
      data: formattedReport
    });

  } catch (error) {
    console.error('Error generating family summary report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate family summary report',
      error: error.message
    });
  }
};

/**
 * Generate parent activity report (legacy)
 */
const generateParentActivityReport = async (req, res) => {
  try {
    const { parent_id, family_id, date_preset, start_date, end_date } = req.query;

    if (!parent_id || !family_id) {
      return res.status(400).json({
        success: false,
        message: 'parent_id and family_id are required'
      });
    }

    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    const result = await reportService.generateParentActivityReport({
      parent_id,
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    const formattedReport = formatParentActivityReport(result.data);

    res.status(200).json({
      success: true,
      message: 'Parent activity report generated successfully',
      data: formattedReport
    });

  } catch (error) {
    console.error('Error generating parent activity report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate parent activity report',
      error: error.message
    });
  }
};

/**
 * Generate multiple reports at once (legacy)
 */
const generateBulkReports = async (req, res) => {
  try {
    const { family_id, report_types, child_id, parent_id, date_preset, start_date, end_date } = req.body;

    if (!family_id || !report_types || !Array.isArray(report_types)) {
      return res.status(400).json({
        success: false,
        message: 'family_id and report_types (array) are required'
      });
    }

    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    const reports = {};
    const errors = [];

    for (const reportType of report_types) {
      try {
        switch (reportType) {
          case 'child_performance':
            if (!child_id) {
              errors.push({ report: reportType, error: 'child_id required' });
              continue;
            }
            const childReport = await reportService.generateChildPerformanceReport({
              child_id,
              family_id,
              start_date: dateRange.start_date,
              end_date: dateRange.end_date
            });
            reports.child_performance = formatChildPerformanceReport(childReport.data);
            break;

          case 'task_analytics':
            const taskReport = await reportService.generateTaskAnalyticsReport({
              family_id,
              start_date: dateRange.start_date,
              end_date: dateRange.end_date
            });
            reports.task_analytics = formatTaskAnalyticsReport(taskReport.data);
            break;

          case 'reward_analytics':
            const rewardReport = await reportService.generateRewardAnalyticsReport({
              family_id,
              start_date: dateRange.start_date,
              end_date: dateRange.end_date
            });
            reports.reward_analytics = formatRewardAnalyticsReport(rewardReport.data);
            break;

          case 'family_summary':
            const familyReport = await reportService.generateFamilySummaryReport({
              family_id,
              start_date: dateRange.start_date,
              end_date: dateRange.end_date
            });
            reports.family_summary = formatFamilySummaryReport(familyReport.data);
            break;

          case 'parent_activity':
            if (!parent_id) {
              errors.push({ report: reportType, error: 'parent_id required' });
              continue;
            }
            const parentReport = await reportService.generateParentActivityReport({
              parent_id,
              family_id,
              start_date: dateRange.start_date,
              end_date: dateRange.end_date
            });
            reports.parent_activity = formatParentActivityReport(parentReport.data);
            break;

          default:
            errors.push({ report: reportType, error: 'Unknown report type' });
        }
      } catch (error) {
        errors.push({ report: reportType, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bulk reports generated',
      data: {
        reports,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Error generating bulk reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate bulk reports',
      error: error.message
    });
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Child Performance Reports
  getChildPerformanceReport,
  getChildPerformanceSummary,
  getChildPerformanceTrends,
  
  // Task Analytics Reports
  getTaskAnalytics,
  getTaskCompletionReport,
  getTaskCategoryReport,
  getOverdueTasksReport,
  
  // Reward Redemption Reports
  getRewardRedemptionReport,
  getPopularRewardsReport,
  getRewardTrends,
  
  // Family Activity Reports
  getFamilyActivitySummary,
  getFamilyDashboard,
  getFamilyEngagementReport,
  
  // Parent Activity Reports
  getParentActivityReport,
  getParentActivitySummary,
  
  // Points Analytics Reports
  getPointsDistributionReport,
  getPointsTrends,
  
  // Comparative Reports
  compareChildren,
  comparePeriods,
  
  // Export Routes
  exportReportPDF,
  exportReportCSV,
  
  // Legacy Functions (Backward Compatibility)
  generateChildPerformanceReport,
  generateTaskAnalyticsReport,
  generateRewardAnalyticsReport,
  generateFamilySummaryReport,
  generateParentActivityReport,
  generateBulkReports
};