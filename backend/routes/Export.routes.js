// ============================================================================
// Export Routes
// API endpoints for exporting reports to CSV and PDF
// Author: Souleymane Camara - BIT1007326
// ============================================================================

const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Import validators from Phase 4
const {
  validateExportCSV,
  validateExportPDF,
  validateDownloadFile
} = require('../validators/report.validator');

// ==========================================================================
// CSV EXPORT ROUTES
// ==========================================================================

/**
 * @route   POST /api/export/csv/child-performance
 * @desc    Export child performance report to CSV
 * @access  Private (Parent, Spouse, Admin)
 * @body    { child_id, family_id, start_date, end_date, filename }
 */
router.post(
  '/csv/child-performance',
  authenticate,
  requireRole(['parent', 'spouse', 'admin']),
  validateExportCSV,
  exportController.exportChildPerformanceToCSV
);

/**
 * @route   POST /api/export/csv/task-analytics
 * @desc    Export task analytics report to CSV
 * @access  Private (Parent, Spouse, Admin)
 * @body    { family_id, start_date, end_date, filename }
 */
router.post(
  '/csv/task-analytics',
  authenticate,
  requireRole(['parent', 'spouse', 'admin']),
  validateExportCSV,
  exportController.exportTaskAnalyticsToCSV
);

/**
 * @route   POST /api/export/csv/reward-analytics
 * @desc    Export reward analytics report to CSV
 * @access  Private (Parent, Spouse, Admin)
 * @body    { family_id, start_date, end_date, filename }
 */
router.post(
  '/csv/reward-analytics',
  authenticate,
  requireRole(['parent', 'spouse', 'admin']),
  validateExportCSV,
  exportController.exportRewardAnalyticsToCSV
);

/**
 * @route   POST /api/export/csv/family-summary
 * @desc    Export family summary report to CSV
 * @access  Private (Parent, Spouse, Admin)
 * @body    { family_id, start_date, end_date, filename }
 */
router.post(
  '/csv/family-summary',
  authenticate,
  requireRole(['parent', 'spouse', 'admin']),
  validateExportCSV,
  exportController.exportFamilySummaryToCSV
);

// ==========================================================================
// PDF EXPORT ROUTES
// ==========================================================================

/**
 * @route   POST /api/export/pdf/child-performance
 * @desc    Export child performance report to PDF
 * @access  Private (Parent, Spouse, Admin)
 * @body    { child_id, family_id, start_date, end_date, filename }
 */
router.post(
  '/pdf/child-performance',
  authenticate,
  requireRole(['parent', 'spouse', 'admin']),
  validateExportPDF,
  exportController.exportChildPerformanceToPDF
);

/**
 * @route   POST /api/export/pdf/task-analytics
 * @desc    Export task analytics report to PDF
 * @access  Private (Parent, Spouse, Admin)
 * @body    { family_id, start_date, end_date, filename }
 */
router.post(
  '/pdf/task-analytics',
  authenticate,
  requireRole(['parent', 'spouse', 'admin']),
  validateExportPDF,
  exportController.exportTaskAnalyticsToPDF
);

/**
 * @route   POST /api/export/pdf/family-summary
 * @desc    Export family summary report to PDF
 * @access  Private (Parent, Spouse, Admin)
 * @body    { family_id, start_date, end_date, filename }
 */
router.post(
  '/pdf/family-summary',
  authenticate,
  requireRole(['parent', 'spouse', 'admin']),
  validateExportPDF,
  exportController.exportFamilySummaryToPDF
);

// ==========================================================================
// FILE DOWNLOAD ROUTE
// ==========================================================================

/**
 * @route   GET /api/export/download/:filename
 * @desc    Download exported file
 * @access  Private (Parent, Spouse, Admin)
 */
router.get(
  '/download/:filename',
  authenticate,
  requireRole(['parent', 'spouse', 'admin']),
  validateDownloadFile,
  exportController.downloadFile
);

// ==========================================================================
// FILE MANAGEMENT ROUTES
// ==========================================================================

/**
 * @route   GET /api/export/files
 * @desc    List all exported files
 * @access  Private (Parent, Spouse, Admin)
 */
router.get(
  '/files',
  authenticate,
  requireRole(['parent', 'spouse', 'admin']),
  exportController.listExportedFiles
);

/**
 * @route   DELETE /api/export/files/:filename
 * @desc    Delete exported file
 * @access  Private (Parent, Spouse, Admin)
 */
router.delete(
  '/files/:filename',
  authenticate,
  requireRole(['parent', 'spouse', 'admin']),
  exportController.deleteFile
);

/**
 * @route   POST /api/export/cleanup
 * @desc    Clean up old exported files (>24 hours)
 * @access  Private (Admin only)
 */
router.post(
  '/cleanup',
  authenticate,
  requireRole(['admin']),
  exportController.cleanupOldFiles
);

module.exports = router;