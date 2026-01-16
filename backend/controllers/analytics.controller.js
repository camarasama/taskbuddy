// ============================================================================
// Analytics Controller
// Handles analytics and performance calculation requests
// Author: Souleymane Camara - BIT1007326
// ============================================================================

const analyticsService = require('../services/analytics.service');
const { 
  formatMonthlyTrendChart,
  formatCategoryBarChart,
  formatChildPerformanceRadar
} = require('../utils/chartDataFormatter');
const { getDateRange } = require('../utils/dateRangeHelper');

// Import query functions for chart data
const { getChildMonthlyTrends } = require('../database/queries/childPerformance.queries');
const { getTasksByCategory } = require('../database/queries/taskAnalytics.queries');

// ==========================================================================
// PERFORMANCE CALCULATIONS
// ==========================================================================

/**
 * Calculate child performance score
 */
const calculatePerformanceScore = async (req, res) => {
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

    const result = await analyticsService.calculatePerformanceScore({
      child_id,
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    res.status(200).json(result);

  } catch (error) {
    console.error('Error calculating performance score:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate performance score',
      error: error.message
    });
  }
};

/**
 * Calculate family engagement score
 */
const calculateFamilyEngagement = async (req, res) => {
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

    const result = await analyticsService.calculateFamilyEngagement({
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    res.status(200).json(result);

  } catch (error) {
    console.error('Error calculating family engagement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate family engagement',
      error: error.message
    });
  }
};

// ==========================================================================
// TREND ANALYSIS
// ==========================================================================

/**
 * Analyze performance trends over time
 */
const analyzePerformanceTrend = async (req, res) => {
  try {
    const { child_id, family_id, period = 'monthly' } = req.query;

    if (!child_id || !family_id) {
      return res.status(400).json({
        success: false,
        message: 'child_id and family_id are required'
      });
    }

    const result = await analyticsService.analyzePerformanceTrend({
      child_id,
      family_id,
      period
    });

    res.status(200).json(result);

  } catch (error) {
    console.error('Error analyzing performance trend:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze performance trend',
      error: error.message
    });
  }
};

/**
 * Analyze task category performance
 */
const analyzeCategoryPerformance = async (req, res) => {
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

    const result = await analyticsService.analyzeCategoryPerformance({
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    res.status(200).json(result);

  } catch (error) {
    console.error('Error analyzing category performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze category performance',
      error: error.message
    });
  }
};

// ==========================================================================
// COMPARATIVE ANALYSIS
// ==========================================================================

/**
 * Compare performance of children within family
 */
const compareChildrenPerformance = async (req, res) => {
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

    const result = await analyticsService.compareChildrenPerformance({
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    res.status(200).json(result);

  } catch (error) {
    console.error('Error comparing children performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare children performance',
      error: error.message
    });
  }
};

/**
 * Compare effectiveness of different task types
 */
const compareTaskTypes = async (req, res) => {
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

    const result = await analyticsService.compareTaskTypes({
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    res.status(200).json(result);

  } catch (error) {
    console.error('Error comparing task types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare task types',
      error: error.message
    });
  }
};

// ==========================================================================
// PREDICTIVE ANALYTICS
// ==========================================================================

/**
 * Predict task completion probability
 */
const predictTaskCompletion = async (req, res) => {
  try {
    const { assignment_id } = req.query;

    if (!assignment_id) {
      return res.status(400).json({
        success: false,
        message: 'assignment_id is required'
      });
    }

    const result = await analyticsService.predictTaskCompletion({
      assignment_id
    });

    res.status(200).json(result);

  } catch (error) {
    console.error('Error predicting task completion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to predict task completion',
      error: error.message
    });
  }
};

/**
 * Forecast family activity for next period
 */
const forecastFamilyActivity = async (req, res) => {
  try {
    const { family_id } = req.query;

    if (!family_id) {
      return res.status(400).json({
        success: false,
        message: 'family_id is required'
      });
    }

    const result = await analyticsService.forecastFamilyActivity({
      family_id
    });

    res.status(200).json(result);

  } catch (error) {
    console.error('Error forecasting family activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to forecast family activity',
      error: error.message
    });
  }
};

// ==========================================================================
// CHART DATA ENDPOINTS
// ==========================================================================

/**
 * Get formatted data for monthly trend chart
 */
const getMonthlyTrendChartData = async (req, res) => {
  try {
    const { child_id, family_id, months = 6 } = req.query;

    if (!child_id || !family_id) {
      return res.status(400).json({
        success: false,
        message: 'child_id and family_id are required'
      });
    }

    // Get monthly trends data
    const monthlyData = await getChildMonthlyTrends(child_id, family_id, parseInt(months));

    // Format for chart
    const chartData = formatMonthlyTrendChart(monthlyData);

    res.status(200).json({
      success: true,
      data: chartData
    });

  } catch (error) {
    console.error('Error getting monthly trend chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get monthly trend chart data',
      error: error.message
    });
  }
};

/**
 * Get formatted data for category breakdown chart
 */
const getCategoryBreakdownChartData = async (req, res) => {
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

    // Get category data
    const categoryData = await getTasksByCategory(
      family_id,
      dateRange.start_date,
      dateRange.end_date
    );

    // Format for chart
    const chartData = formatCategoryBarChart(categoryData);

    res.status(200).json({
      success: true,
      data: chartData
    });

  } catch (error) {
    console.error('Error getting category breakdown chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category breakdown chart data',
      error: error.message
    });
  }
};

/**
 * Get formatted data for child performance radar chart
 */
const getPerformanceRadarChartData = async (req, res) => {
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

    // Calculate performance score (which includes breakdown)
    const performanceResult = await analyticsService.calculatePerformanceScore({
      child_id,
      family_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    });

    // Extract scores for radar chart
    const performanceData = {
      completion_rate: performanceResult.data.breakdown.completion.score,
      punctuality_score: performanceResult.data.breakdown.punctuality.score,
      quality_score: performanceResult.data.breakdown.quality.score,
      consistency_score: performanceResult.data.breakdown.consistency.score
    };

    // Format for radar chart
    const chartData = formatChildPerformanceRadar(performanceData);

    res.status(200).json({
      success: true,
      data: chartData
    });

  } catch (error) {
    console.error('Error getting performance radar chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance radar chart data',
      error: error.message
    });
  }
};

// ==========================================================================
// EXPORTS
// ==========================================================================

module.exports = {
  calculatePerformanceScore,
  calculateFamilyEngagement,
  analyzePerformanceTrend,
  analyzeCategoryPerformance,
  compareChildrenPerformance,
  compareTaskTypes,
  predictTaskCompletion,
  forecastFamilyActivity,
  getMonthlyTrendChartData,
  getCategoryBreakdownChartData,
  getPerformanceRadarChartData
};
