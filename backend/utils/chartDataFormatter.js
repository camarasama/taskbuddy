// ============================================================================
// Chart Data Formatter
// Utility functions for formatting data for frontend charts
// Author: Souleymane Camara - BIT1007326
// ============================================================================

/**
 * Format data for line chart (time-based trends)
 */
const formatLineChartData = (data, xKey, yKeys, labels) => {
  if (!data || data.length === 0) {
    return {
      labels: [],
      datasets: []
    };
  }

  const chartLabels = data.map(item => item[xKey]);
  
  const datasets = yKeys.map((yKey, index) => ({
    label: labels[index] || yKey,
    data: data.map(item => parseFloat(item[yKey]) || 0),
    borderColor: getChartColor(index),
    backgroundColor: getChartColor(index, 0.1),
    tension: 0.4
  }));

  return {
    labels: chartLabels,
    datasets: datasets
  };
};

/**
 * Format data for bar chart
 */
const formatBarChartData = (data, xKey, yKey, label) => {
  if (!data || data.length === 0) {
    return {
      labels: [],
      datasets: []
    };
  }

  return {
    labels: data.map(item => item[xKey]),
    datasets: [{
      label: label || yKey,
      data: data.map(item => parseFloat(item[yKey]) || 0),
      backgroundColor: data.map((_, index) => getChartColor(index, 0.6)),
      borderColor: data.map((_, index) => getChartColor(index)),
      borderWidth: 1
    }]
  };
};

/**
 * Format data for pie/doughnut chart
 */
const formatPieChartData = (data, labelKey, valueKey) => {
  if (!data || data.length === 0) {
    return {
      labels: [],
      datasets: []
    };
  }

  return {
    labels: data.map(item => item[labelKey]),
    datasets: [{
      data: data.map(item => parseFloat(item[valueKey]) || 0),
      backgroundColor: data.map((_, index) => getChartColor(index, 0.6)),
      borderColor: data.map((_, index) => getChartColor(index)),
      borderWidth: 1
    }]
  };
};

/**
 * Format data for stacked bar chart
 */
const formatStackedBarChartData = (data, xKey, yKeys, labels) => {
  if (!data || data.length === 0) {
    return {
      labels: [],
      datasets: []
    };
  }

  const chartLabels = data.map(item => item[xKey]);
  
  const datasets = yKeys.map((yKey, index) => ({
    label: labels[index] || yKey,
    data: data.map(item => parseFloat(item[yKey]) || 0),
    backgroundColor: getChartColor(index, 0.6),
    borderColor: getChartColor(index),
    borderWidth: 1
  }));

  return {
    labels: chartLabels,
    datasets: datasets
  };
};

/**
 * Format monthly trend data for line chart
 */
const formatMonthlyTrendChart = (monthlyData) => {
  return formatLineChartData(
    monthlyData,
    'month',
    ['tasks_assigned', 'tasks_completed', 'points_earned'],
    ['Tasks Assigned', 'Tasks Completed', 'Points Earned']
  );
};

/**
 * Format weekly trend data for line chart
 */
const formatWeeklyTrendChart = (weeklyData) => {
  return formatLineChartData(
    weeklyData,
    'week',
    ['tasks_assigned', 'tasks_completed'],
    ['Tasks Assigned', 'Tasks Completed']
  );
};

/**
 * Format category distribution for bar chart
 */
const formatCategoryBarChart = (categoryData) => {
  return formatBarChartData(
    categoryData,
    'category',
    'total_tasks',
    'Tasks by Category'
  );
};

/**
 * Format priority distribution for pie chart
 */
const formatPriorityPieChart = (priorityData) => {
  return formatPieChartData(
    priorityData,
    'priority',
    'count'
  );
};

/**
 * Format status distribution for doughnut chart
 */
const formatStatusDoughnutChart = (statusData) => {
  return formatPieChartData(
    statusData,
    'status',
    'count'
  );
};

/**
 * Format completion rate comparison (multiple children)
 */
const formatChildComparisonChart = (childrenData) => {
  return formatBarChartData(
    childrenData,
    'child_name',
    'completion_rate',
    'Completion Rate (%)'
  );
};

/**
 * Format points distribution chart
 */
const formatPointsDistributionChart = (pointsData) => {
  return formatBarChartData(
    pointsData,
    'child_name',
    'points_balance',
    'Current Points'
  );
};

/**
 * Format task completion over time (stacked)
 */
const formatTaskCompletionStackedChart = (data) => {
  return formatStackedBarChartData(
    data,
    'month',
    ['tasks_completed', 'tasks_pending', 'tasks_rejected'],
    ['Completed', 'Pending', 'Rejected']
  );
};

/**
 * Format reward redemption trend
 */
const formatRedemptionTrendChart = (redemptionData) => {
  return formatLineChartData(
    redemptionData,
    'week',
    ['redemption_requests', 'approved', 'denied'],
    ['Requests', 'Approved', 'Denied']
  );
};

/**
 * Format gauge chart data (for performance scores)
 */
const formatGaugeChartData = (score, maxScore = 100) => {
  return {
    value: parseFloat(score) || 0,
    max: maxScore,
    percentage: ((parseFloat(score) || 0) / maxScore * 100).toFixed(1),
    color: getPerformanceColor(score, maxScore)
  };
};

/**
 * Format radar chart data (multi-metric performance)
 */
const formatRadarChartData = (metrics, labels) => {
  return {
    labels: labels,
    datasets: [{
      label: 'Performance Metrics',
      data: metrics.map(m => parseFloat(m) || 0),
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgb(54, 162, 235)',
      pointBackgroundColor: 'rgb(54, 162, 235)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(54, 162, 235)'
    }]
  };
};

/**
 * Format child performance radar (completion, punctuality, quality, consistency)
 */
const formatChildPerformanceRadar = (performanceData) => {
  const metrics = [
    parseFloat(performanceData.completion_rate) || 0,
    parseFloat(performanceData.punctuality_score) || 0,
    parseFloat(performanceData.quality_score) || 0,
    parseFloat(performanceData.consistency_score) || 0
  ];

  return formatRadarChartData(
    metrics,
    ['Completion', 'Punctuality', 'Quality', 'Consistency']
  );
};

/**
 * Format heatmap data (activity calendar)
 */
const formatHeatmapData = (activityData) => {
  if (!activityData || activityData.length === 0) {
    return [];
  }

  return activityData.map(item => ({
    date: item.date,
    value: parseInt(item.activity_count) || 0,
    level: getActivityLevel(parseInt(item.activity_count) || 0)
  }));
};

// ==========================================================================
// HELPER FUNCTIONS
// ==========================================================================

/**
 * Get chart color by index
 */
const getChartColor = (index, opacity = 1) => {
  const colors = [
    { r: 54, g: 162, b: 235 },   // Blue
    { r: 255, g: 99, b: 132 },   // Red
    { r: 75, g: 192, b: 192 },   // Green
    { r: 255, g: 206, b: 86 },   // Yellow
    { r: 153, g: 102, b: 255 },  // Purple
    { r: 255, g: 159, b: 64 },   // Orange
    { r: 201, g: 203, b: 207 },  // Grey
    { r: 83, g: 102, b: 255 }    // Indigo
  ];

  const color = colors[index % colors.length];
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
};

/**
 * Get performance color based on score
 */
const getPerformanceColor = (score, maxScore = 100) => {
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 90) return '#10b981'; // Green - Excellent
  if (percentage >= 75) return '#3b82f6'; // Blue - Very Good
  if (percentage >= 60) return '#f59e0b'; // Orange - Good
  if (percentage >= 45) return '#f97316'; // Deep Orange - Fair
  return '#ef4444'; // Red - Needs Improvement
};

/**
 * Get activity level for heatmap
 */
const getActivityLevel = (count) => {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
};

/**
 * Format data for simple stats cards
 */
const formatStatsCards = (data) => {
  return {
    total: parseInt(data.total) || 0,
    completed: parseInt(data.completed) || 0,
    pending: parseInt(data.pending) || 0,
    completion_rate: parseFloat(data.completion_rate) || 0,
    trend: calculateTrend(data.current, data.previous)
  };
};

/**
 * Calculate trend (increase/decrease)
 */
const calculateTrend = (current, previous) => {
  if (!previous || previous === 0) return { direction: 'neutral', percentage: 0 };
  
  const change = ((current - previous) / previous) * 100;
  return {
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    percentage: Math.abs(change).toFixed(1)
  };
};

/**
 * Format data for progress bar
 */
const formatProgressBar = (current, total, label) => {
  const percentage = total > 0 ? ((current / total) * 100).toFixed(1) : 0;
  
  return {
    label: label,
    current: current,
    total: total,
    percentage: parseFloat(percentage),
    color: getProgressColor(percentage)
  };
};

/**
 * Get progress bar color
 */
const getProgressColor = (percentage) => {
  if (percentage >= 80) return 'success';
  if (percentage >= 50) return 'warning';
  return 'danger';
};

/**
 * Format leaderboard data
 */
const formatLeaderboard = (data, rankKey, nameKey, scoreKey) => {
  return data.map((item, index) => ({
    rank: index + 1,
    name: item[nameKey],
    score: parseFloat(item[scoreKey]) || 0,
    badge: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : null
  }));
};

// ==========================================================================
// EXPORTS
// ==========================================================================

module.exports = {
  // Basic chart formatters
  formatLineChartData,
  formatBarChartData,
  formatPieChartData,
  formatStackedBarChartData,
  
  // Specific chart formatters
  formatMonthlyTrendChart,
  formatWeeklyTrendChart,
  formatCategoryBarChart,
  formatPriorityPieChart,
  formatStatusDoughnutChart,
  formatChildComparisonChart,
  formatPointsDistributionChart,
  formatTaskCompletionStackedChart,
  formatRedemptionTrendChart,
  
  // Advanced visualizations
  formatGaugeChartData,
  formatRadarChartData,
  formatChildPerformanceRadar,
  formatHeatmapData,
  
  // UI components
  formatStatsCards,
  formatProgressBar,
  formatLeaderboard,
  
  // Helper functions
  getChartColor,
  getPerformanceColor,
  calculateTrend
};
