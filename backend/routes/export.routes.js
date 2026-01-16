// ============================================================================
// Export Routes
// API endpoints for exporting reports to CSV and PDF
// Author: Souleymane Camara - BIT1007326
// ============================================================================

const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

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
  authenticateToken,
  authorizeRoles('parent', 'spouse', 'admin'),
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
  authenticateToken,
  authorizeRoles('parent', 'spouse', 'admin'),
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
  authenticateToken,
  authorizeRoles('parent', 'spouse', 'admin'),
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
  authenticateToken,
  authorizeRoles('parent', 'spouse', 'admin'),
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
  authenticateToken,
  authorizeRoles('parent', 'spouse', 'admin'),
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
  authenticateToken,
  authorizeRoles('parent', 'spouse', 'admin'),
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
  authenticateToken,
  authorizeRoles('parent', 'spouse', 'admin'),
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
  authenticateToken,
  authorizeRoles('parent', 'spouse', 'admin'),
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
  authenticateToken,
  authorizeRoles('parent', 'spouse', 'admin'),
  exportController.listExportedFiles
);

/**
 * @route   DELETE /api/export/files/:filename
 * @desc    Delete exported file
 * @access  Private (Parent, Spouse, Admin)
 */
router.delete(
  '/files/:filename',
  authenticateToken,
  authorizeRoles('parent', 'spouse', 'admin'),
  exportController.deleteFile
);

/**
 * @route   POST /api/export/cleanup
 * @desc    Clean up old exported files (>24 hours)
 * @access  Private (Admin only)
 */
router.post(
  '/cleanup',
  authenticateToken,
  authorizeRoles('admin'),
  exportController.cleanupOldFiles
);

module.exports = router;
