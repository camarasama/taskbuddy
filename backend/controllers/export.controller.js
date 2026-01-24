// ============================================================================
// Export Controller - COMPLETE VERSION
// Handles file export requests (CSV and PDF) - 7 Reports
// Author: Souleymane Camara - BIT1007326
// ============================================================================

const path = require('path');
const reportService = require('../services/report.service');
const exportService = require('../services/export.service');
const { getDateRange } = require('../utils/dateRangeHelper');

// ==========================================================================
// PDF EXPORT CONTROLLERS - ALL 7 REPORTS
// ==========================================================================

/**
 * 1. Export child performance report to PDF
 */
const exportChildPerformanceToPDF = async (req, res) => {
  try {
    const { child_id, family_id, date_preset, start_date, end_date, filename } = req.body;

    if (!child_id || !family_id) {
      return res.status(400).json({
        success: false,
        message: 'child_id and family_id are required'
      });
    }

    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    const report = await reportService.generateChildPerformanceReport({
      child_id,
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    const exportResult = await exportService.exportChildPerformanceToPDF(
      report.data,
      filename || `child_performance_${Date.now()}.pdf`
    );

    res.status(200).json({
      success: true,
      message: 'Report exported to PDF successfully',
      data: exportResult
    });

  } catch (error) {
    console.error('Error exporting child performance to PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report to PDF',
      error: error.message
    });
  }
};

/**
 * 2. Export task analytics report to PDF
 */
const exportTaskAnalyticsToPDF = async (req, res) => {
  try {
    const { family_id, date_preset, start_date, end_date, filename } = req.body;

    if (!family_id) {
      return res.status(400).json({
        success: false,
        message: 'family_id is required'
      });
    }

    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    const report = await reportService.generateTaskAnalyticsReport({
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    const exportResult = await exportService.exportTaskAnalyticsToPDF(
      report.data,
      filename || `task_analytics_${Date.now()}.pdf`
    );

    res.status(200).json({
      success: true,
      message: 'Report exported to PDF successfully',
      data: exportResult
    });

  } catch (error) {
    console.error('Error exporting task analytics to PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report to PDF',
      error: error.message
    });
  }
};

/**
 * 3. Export family summary report to PDF
 */
const exportFamilySummaryToPDF = async (req, res) => {
  try {
    const { family_id, date_preset, start_date, end_date, filename } = req.body;

    if (!family_id) {
      return res.status(400).json({
        success: false,
        message: 'family_id is required'
      });
    }

    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    const report = await reportService.generateFamilySummaryReport({
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    const exportResult = await exportService.exportFamilySummaryToPDF(
      report.data,
      filename || `family_summary_${Date.now()}.pdf`
    );

    res.status(200).json({
      success: true,
      message: 'Report exported to PDF successfully',
      data: exportResult
    });

  } catch (error) {
    console.error('Error exporting family summary to PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report to PDF',
      error: error.message
    });
  }
};

/**
 * 4. Export reward analytics report to PDF
 */
const exportRewardAnalyticsToPDF = async (req, res) => {
  try {
    const { family_id, date_preset, start_date, end_date, filename } = req.body;

    if (!family_id) {
      return res.status(400).json({
        success: false,
        message: 'family_id is required'
      });
    }

    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    const report = await reportService.generateRewardAnalyticsReport({
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    const exportResult = await exportService.exportRewardAnalyticsToPDF(
      report.data,
      filename || `reward_analytics_${Date.now()}.pdf`
    );

    res.status(200).json({
      success: true,
      message: 'Report exported to PDF successfully',
      data: exportResult
    });

  } catch (error) {
    console.error('Error exporting reward analytics to PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report to PDF',
      error: error.message
    });
  }
};

/**
 * 5. Export parent activity report to PDF
 */
const exportParentActivityToPDF = async (req, res) => {
  try {
    const { parent_id, family_id, date_preset, start_date, end_date, filename } = req.body;

    if (!parent_id || !family_id) {
      return res.status(400).json({
        success: false,
        message: 'parent_id and family_id are required'
      });
    }

    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    const report = await reportService.generateParentActivityReport({
      parent_id,
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    const exportResult = await exportService.exportParentActivityToPDF(
      report.data,
      filename || `parent_activity_${Date.now()}.pdf`
    );

    res.status(200).json({
      success: true,
      message: 'Report exported to PDF successfully',
      data: exportResult
    });

  } catch (error) {
    console.error('Error exporting parent activity to PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report to PDF',
      error: error.message
    });
  }
};

/**
 * 6. Export points distribution report to PDF
 */
const exportPointsDistributionToPDF = async (req, res) => {
  try {
    const { family_id, filename } = req.body;

    if (!family_id) {
      return res.status(400).json({
        success: false,
        message: 'family_id is required'
      });
    }

    const report = await reportService.getPointsDistribution({
      family_id
    });

    const exportResult = await exportService.exportPointsDistributionToPDF(
      report.data || report,
      filename || `points_distribution_${Date.now()}.pdf`
    );

    res.status(200).json({
      success: true,
      message: 'Report exported to PDF successfully',
      data: exportResult
    });

  } catch (error) {
    console.error('Error exporting points distribution to PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report to PDF',
      error: error.message
    });
  }
};

/**
 * 7. Export children comparison report to PDF
 */
const exportChildrenComparisonToPDF = async (req, res) => {
  try {
    const { family_id, date_preset, start_date, end_date, filename } = req.body;

    if (!family_id) {
      return res.status(400).json({
        success: false,
        message: 'family_id is required'
      });
    }

    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    const report = await reportService.compareChildrenPerformance({
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
      metrics: ['completion_rate', 'points_earned', 'tasks_completed']
    });

    const exportResult = await exportService.exportChildrenComparisonToPDF(
      report.data || report,
      filename || `children_comparison_${Date.now()}.pdf`
    );

    res.status(200).json({
      success: true,
      message: 'Report exported to PDF successfully',
      data: exportResult
    });

  } catch (error) {
    console.error('Error exporting children comparison to PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report to PDF',
      error: error.message
    });
  }
};

// ==========================================================================
// CSV EXPORT CONTROLLERS (Existing - from original file)
// ==========================================================================

const exportChildPerformanceToCSV = async (req, res) => {
  try {
    const { child_id, family_id, date_preset, start_date, end_date, filename } = req.body;

    if (!child_id || !family_id) {
      return res.status(400).json({
        success: false,
        message: 'child_id and family_id are required'
      });
    }

    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    const report = await reportService.generateChildPerformanceReport({
      child_id,
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    const exportResult = await exportService.exportChildPerformanceToCSV(
      report.data,
      filename || `child_performance_${Date.now()}.csv`
    );

    res.status(200).json({
      success: true,
      message: 'Report exported to CSV successfully',
      data: exportResult
    });

  } catch (error) {
    console.error('Error exporting child performance to CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report to CSV',
      error: error.message
    });
  }
};

const exportTaskAnalyticsToCSV = async (req, res) => {
  try {
    const { family_id, date_preset, start_date, end_date, filename } = req.body;

    if (!family_id) {
      return res.status(400).json({
        success: false,
        message: 'family_id is required'
      });
    }

    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    const report = await reportService.generateTaskAnalyticsReport({
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    const exportResult = await exportService.exportTaskAnalyticsToCSV(
      report.data,
      filename || `task_analytics_${Date.now()}.csv`
    );

    res.status(200).json({
      success: true,
      message: 'Report exported to CSV successfully',
      data: exportResult
    });

  } catch (error) {
    console.error('Error exporting task analytics to CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report to CSV',
      error: error.message
    });
  }
};

const exportRewardAnalyticsToCSV = async (req, res) => {
  try {
    const { family_id, date_preset, start_date, end_date, filename } = req.body;

    if (!family_id) {
      return res.status(400).json({
        success: false,
        message: 'family_id is required'
      });
    }

    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    const report = await reportService.generateRewardAnalyticsReport({
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    const exportResult = await exportService.exportRewardAnalyticsToCSV(
      report.data,
      filename || `reward_analytics_${Date.now()}.csv`
    );

    res.status(200).json({
      success: true,
      message: 'Report exported to CSV successfully',
      data: exportResult
    });

  } catch (error) {
    console.error('Error exporting reward analytics to CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report to CSV',
      error: error.message
    });
  }
};

const exportFamilySummaryToCSV = async (req, res) => {
  try {
    const { family_id, date_preset, start_date, end_date, filename } = req.body;

    if (!family_id) {
      return res.status(400).json({
        success: false,
        message: 'family_id is required'
      });
    }

    const dateRange = date_preset 
      ? getDateRange(date_preset, start_date, end_date)
      : { start_date: start_date || null, end_date: end_date || null };

    const report = await reportService.generateFamilySummaryReport({
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    const exportResult = await exportService.exportFamilySummaryToCSV(
      report.data,
      filename || `family_summary_${Date.now()}.csv`
    );

    res.status(200).json({
      success: true,
      message: 'Report exported to CSV successfully',
      data: exportResult
    });

  } catch (error) {
    console.error('Error exporting family summary to CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report to CSV',
      error: error.message
    });
  }
};

// ==========================================================================
// FILE MANAGEMENT CONTROLLERS
// ==========================================================================

const downloadFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../exports', filename);

    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({
          success: false,
          message: 'Failed to download file',
          error: err.message
        });
      }
    });

  } catch (error) {
    console.error('Error in download file controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file',
      error: error.message
    });
  }
};

const listExportedFiles = async (req, res) => {
  try {
    const result = await exportService.listExportedFiles();

    res.status(200).json({
      success: true,
      message: 'Exported files retrieved successfully',
      data: result.files
    });

  } catch (error) {
    console.error('Error listing exported files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list exported files',
      error: error.message
    });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../exports', filename);

    const result = await exportService.deleteExportedFile(filePath);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }

  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    });
  }
};

const cleanupOldFiles = async (req, res) => {
  try {
    const result = await exportService.cleanupOldExports();

    res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Error cleaning up old files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup old files',
      error: error.message
    });
  }
};

// ==========================================================================
// EXPORTS - ALL 7 PDF + 4 CSV + File Management
// ==========================================================================

module.exports = {
  // PDF Exports (7 Reports)
  exportChildPerformanceToPDF,
  exportTaskAnalyticsToPDF,
  exportFamilySummaryToPDF,
  exportRewardAnalyticsToPDF,
  exportParentActivityToPDF,
  exportPointsDistributionToPDF,
  exportChildrenComparisonToPDF,
  
  // CSV Exports
  exportChildPerformanceToCSV,
  exportTaskAnalyticsToCSV,
  exportRewardAnalyticsToCSV,
  exportFamilySummaryToCSV,
  
  // File Management
  downloadFile,
  listExportedFiles,
  deleteFile,
  cleanupOldFiles
};
