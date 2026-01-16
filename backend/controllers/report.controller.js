// ============================================================================
// Report Controller
// Handles report generation requests
// Author: Souleymane Camara - BIT1007326
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

// ==========================================================================
// CHILD PERFORMANCE REPORT
// ==========================================================================

/**
 * Generate child performance report
 */
const generateChildPerformanceReport = async (req, res) => {
  try {
    const { child_id, family_id, date_preset, start_date, end_date } = req.query;

    // Validate required parameters
    if (!child_id || !family_id) {
      return res.status(400).json({
        success: false,
        message: 'child_id and family_id are required'
      });
    }

    // Get date range
    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    // Generate report
    const result = await reportService.generateChildPerformanceReport({
      child_id,
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    // Format report for response
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

// ==========================================================================
// TASK ANALYTICS REPORT
// ==========================================================================

/**
 * Generate task analytics report
 */
const generateTaskAnalyticsReport = async (req, res) => {
  try {
    const { family_id, category, date_preset, start_date, end_date } = req.query;

    // Validate required parameters
    if (!family_id) {
      return res.status(400).json({
        success: false,
        message: 'family_id is required'
      });
    }

    // Get date range
    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    // Generate report
    const result = await reportService.generateTaskAnalyticsReport({
      family_id,
      category: category || null,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    // Format report for response
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

// ==========================================================================
// REWARD ANALYTICS REPORT
// ==========================================================================

/**
 * Generate reward analytics report
 */
const generateRewardAnalyticsReport = async (req, res) => {
  try {
    const { family_id, date_preset, start_date, end_date } = req.query;

    // Validate required parameters
    if (!family_id) {
      return res.status(400).json({
        success: false,
        message: 'family_id is required'
      });
    }

    // Get date range
    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    // Generate report
    const result = await reportService.generateRewardAnalyticsReport({
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    // Format report for response
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

// ==========================================================================
// FAMILY SUMMARY REPORT
// ==========================================================================

/**
 * Generate family summary report
 */
const generateFamilySummaryReport = async (req, res) => {
  try {
    const { family_id, date_preset, start_date, end_date } = req.query;

    // Validate required parameters
    if (!family_id) {
      return res.status(400).json({
        success: false,
        message: 'family_id is required'
      });
    }

    // Get date range
    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    // Generate report
    const result = await reportService.generateFamilySummaryReport({
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    // Format report for response
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

// ==========================================================================
// PARENT ACTIVITY REPORT
// ==========================================================================

/**
 * Generate parent activity report
 */
const generateParentActivityReport = async (req, res) => {
  try {
    const { parent_id, family_id, date_preset, start_date, end_date } = req.query;

    // Validate required parameters
    if (!parent_id || !family_id) {
      return res.status(400).json({
        success: false,
        message: 'parent_id and family_id are required'
      });
    }

    // Get date range
    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    // Generate report
    const result = await reportService.generateParentActivityReport({
      parent_id,
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    // Format report for response
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

// ==========================================================================
// BULK REPORT GENERATION
// ==========================================================================

/**
 * Generate multiple reports at once
 */
const generateBulkReports = async (req, res) => {
  try {
    const { family_id, report_types, child_id, parent_id, date_preset, start_date, end_date } = req.body;

    // Validate required parameters
    if (!family_id || !report_types || !Array.isArray(report_types)) {
      return res.status(400).json({
        success: false,
        message: 'family_id and report_types (array) are required'
      });
    }

    // Get date range
    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    const reports = {};
    const errors = [];

    // Generate each requested report
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

// ==========================================================================
// EXPORTS
// ==========================================================================

module.exports = {
  generateChildPerformanceReport,
  generateTaskAnalyticsReport,
  generateRewardAnalyticsReport,
  generateFamilySummaryReport,
  generateParentActivityReport,
  generateBulkReports
};
