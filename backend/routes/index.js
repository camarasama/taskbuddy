// ============================================================================
// Routes Index
// Central router that combines all route modules
// Author: Souleymane Camara - BIT1007326
// ============================================================================

const express = require('express');
const router = express.Router();

// Import all route modules
const reportRoutes = require('./report.routes');
const analyticsRoutes = require('./analytics.routes');
const exportRoutes = require('./export.routes');

// TODO: Import Phase 2 & 3 routes when they are created
// const authRoutes = require('./auth.routes');
// const familyRoutes = require('./family.routes');
// const userRoutes = require('./user.routes');
// const taskRoutes = require('./task.routes');
// const rewardRoutes = require('./reward.routes');
// const notificationRoutes = require('./notification.routes');

// ==========================================================================
// MOUNT ROUTES
// ==========================================================================

// Phase 4: Reports & Analytics Routes
router.use('/reports', reportRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/export', exportRoutes);

// Phase 2 & 3: Core Application Routes (TODO: Uncomment when created)
// router.use('/auth', authRoutes);
// router.use('/families', familyRoutes);
// router.use('/users', userRoutes);
// router.use('/tasks', taskRoutes);
// router.use('/rewards', rewardRoutes);
// router.use('/notifications', notificationRoutes);

// ==========================================================================
// API INFO ROUTE
// ==========================================================================

/**
 * @route   GET /api/
 * @desc    Get API information and available endpoints
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskBuddy API',
    version: '1.0.0',
    endpoints: {
      reports: {
        child_performance: 'GET /api/reports/child-performance',
        task_analytics: 'GET /api/reports/task-analytics',
        reward_analytics: 'GET /api/reports/reward-analytics',
        family_summary: 'GET /api/reports/family-summary',
        parent_activity: 'GET /api/reports/parent-activity',
        bulk_generate: 'POST /api/reports/bulk-generate'
      },
      analytics: {
        performance_score: 'GET /api/analytics/performance-score',
        family_engagement: 'GET /api/analytics/family-engagement',
        performance_trend: 'GET /api/analytics/performance-trend',
        category_performance: 'GET /api/analytics/category-performance',
        children_comparison: 'GET /api/analytics/children-comparison',
        task_types_comparison: 'GET /api/analytics/task-types-comparison',
        predict_completion: 'GET /api/analytics/predict-completion',
        forecast_activity: 'GET /api/analytics/forecast-activity'
      },
      export: {
        csv: {
          child_performance: 'POST /api/export/csv/child-performance',
          task_analytics: 'POST /api/export/csv/task-analytics',
          reward_analytics: 'POST /api/export/csv/reward-analytics',
          family_summary: 'POST /api/export/csv/family-summary'
        },
        pdf: {
          child_performance: 'POST /api/export/pdf/child-performance',
          task_analytics: 'POST /api/export/pdf/task-analytics',
          family_summary: 'POST /api/export/pdf/family-summary'
        },
        management: {
          download: 'GET /api/export/download/:filename',
          list: 'GET /api/export/files',
          delete: 'DELETE /api/export/files/:filename',
          cleanup: 'POST /api/export/cleanup'
        }
      },
      charts: {
        monthly_trend: 'GET /api/analytics/charts/monthly-trend',
        category_breakdown: 'GET /api/analytics/charts/category-breakdown',
        performance_radar: 'GET /api/analytics/charts/performance-radar'
      }
    },
    documentation: 'https://github.com/camarasama/taskbuddy',
    author: 'Souleymane Camara - BIT1007326',
    institution: 'Regional Maritime University'
  });
});

// ==========================================================================
// 404 HANDLER
// ==========================================================================

/**
 * Handle 404 - Route not found
 */
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    requested_url: req.originalUrl,
    method: req.method,
    tip: 'Check the API documentation at GET /api/'
  });
});

module.exports = router;
