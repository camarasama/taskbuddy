// ============================================================================
// Report Formatters
// Utility functions for formatting report data
// Author: Souleymane Camara - BIT1007326
// ============================================================================

/**
 * Format child performance report data
 */
const formatChildPerformanceReport = (reportData) => {
  if (!reportData || !reportData.child) {
    return null;
  }

  const { child, recent_activity, priority_distribution, monthly_trends, report_period } = reportData;

  return {
    report_type: 'Child Performance Report',
    generated_at: new Date().toISOString(),
    report_period: report_period,
    
    summary: {
      child_name: child.full_name,
      current_points: parseInt(child.current_points) || 0,
      total_tasks_assigned: parseInt(child.total_tasks_assigned) || 0,
      tasks_completed: parseInt(child.tasks_completed) || 0,
      tasks_pending: parseInt(child.tasks_pending) || 0,
      tasks_rejected: parseInt(child.tasks_rejected) || 0,
      completion_rate: parseFloat(child.completion_rate) || 0,
      total_points_earned: parseInt(child.total_points_earned) || 0,
      avg_points_per_task: parseFloat(child.avg_points_per_task) || 0,
      avg_completion_time_hours: parseFloat(child.avg_completion_time_hours) || 0
    },
    
    performance_metrics: {
      completion_rate: `${parseFloat(child.completion_rate) || 0}%`,
      first_time_approval_rate: `${parseFloat(child.first_time_approval_rate) || 0}%`,
      on_time_completions: parseInt(child.ontime_completions) || 0,
      late_completions: parseInt(child.late_completions) || 0,
      punctuality_score: calculatePunctualityScore(child)
    },
    
    recent_activity: formatRecentActivity(recent_activity),
    priority_distribution: formatPriorityDistribution(priority_distribution),
    monthly_trends: formatMonthlyTrends(monthly_trends)
  };
};

/**
 * Format task analytics report data
 */
const formatTaskAnalyticsReport = (reportData) => {
  if (!reportData || !reportData.overview) {
    return null;
  }

  const { overview, category_breakdown, top_tasks, status_distribution, report_period } = reportData;

  return {
    report_type: 'Task Analytics Report',
    generated_at: new Date().toISOString(),
    report_period: report_period,
    
    overview: {
      total_tasks_created: parseInt(overview.total_tasks_created) || 0,
      total_assignments: parseInt(overview.total_assignments) || 0,
      completed_assignments: parseInt(overview.completed_assignments) || 0,
      overall_completion_rate: `${parseFloat(overview.overall_completion_rate) || 0}%`,
      total_points_awarded: parseInt(overview.total_points_awarded) || 0,
      avg_points_per_task: parseFloat(overview.avg_points_per_task) || 0,
      avg_completion_time: `${parseFloat(overview.avg_completion_time_hours) || 0} hours`
    },
    
    priority_breakdown: {
      low: parseInt(overview.low_priority_count) || 0,
      medium: parseInt(overview.medium_priority_count) || 0,
      high: parseInt(overview.high_priority_count) || 0,
      urgent: parseInt(overview.urgent_priority_count) || 0
    },
    
    category_performance: formatCategoryBreakdown(category_breakdown),
    top_performing_tasks: formatTopTasks(top_tasks),
    status_distribution: formatStatusDistribution(status_distribution)
  };
};

/**
 * Format reward analytics report data
 */
const formatRewardAnalyticsReport = (reportData) => {
  if (!reportData || !reportData.overview) {
    return null;
  }

  const { overview, popular_rewards, child_stats, reward_status, report_period } = reportData;

  return {
    report_type: 'Reward Analytics Report',
    generated_at: new Date().toISOString(),
    report_period: report_period,
    
    overview: {
      total_rewards_available: parseInt(overview.total_rewards_available) || 0,
      redemption_requests: parseInt(overview.total_redemption_requests) || 0,
      approved_redemptions: parseInt(overview.approved_redemptions) || 0,
      denied_redemptions: parseInt(overview.denied_redemptions) || 0,
      pending_redemptions: parseInt(overview.pending_redemptions) || 0,
      approval_rate: `${parseFloat(overview.approval_rate) || 0}%`,
      total_points_spent: parseInt(overview.total_points_spent) || 0,
      avg_points_per_redemption: parseFloat(overview.avg_points_per_redemption) || 0
    },
    
    popular_rewards: formatPopularRewards(popular_rewards),
    child_statistics: formatChildRedemptionStats(child_stats),
    reward_status_breakdown: formatRewardStatus(reward_status)
  };
};

/**
 * Format family summary report data
 */
const formatFamilySummaryReport = (reportData) => {
  if (!reportData || !reportData.family_info) {
    return null;
  }

  const { family_info, activity_stats, top_children, recent_activity, weekly_trend, report_period } = reportData;

  return {
    report_type: 'Family Activity Summary Report',
    generated_at: new Date().toISOString(),
    report_period: report_period,
    
    family_information: {
      family_name: family_info.family_name,
      family_code: family_info.family_code,
      total_members: parseInt(family_info.total_members) || 0,
      parents_count: parseInt(family_info.parents_count) || 0,
      spouses_count: parseInt(family_info.spouses_count) || 0,
      children_count: parseInt(family_info.children_count) || 0,
      total_family_points: parseInt(family_info.total_family_points) || 0,
      days_since_creation: parseInt(family_info.days_since_creation) || 0
    },
    
    activity_overview: {
      tasks_created: parseInt(activity_stats.total_tasks_created) || 0,
      assignments: parseInt(activity_stats.total_assignments) || 0,
      completed_tasks: parseInt(activity_stats.completed_tasks) || 0,
      rewards_available: parseInt(activity_stats.total_rewards_available) || 0,
      redemption_requests: parseInt(activity_stats.total_redemption_requests) || 0,
      points_earned: parseInt(activity_stats.total_points_earned) || 0,
      points_spent: parseInt(activity_stats.total_points_spent) || 0
    },
    
    top_performers: formatTopChildren(top_children),
    recent_activities: formatRecentFamilyActivity(recent_activity),
    weekly_trend: formatWeeklyTrend(weekly_trend)
  };
};

/**
 * Format parent activity report data
 */
const formatParentActivityReport = (reportData) => {
  if (!reportData || !reportData.parent) {
    return null;
  }

  const { parent, recent_actions, tasks_by_category, report_period } = reportData;

  return {
    report_type: 'Parent Activity Report',
    generated_at: new Date().toISOString(),
    report_period: report_period,
    
    parent_info: {
      name: parent.full_name,
      role: parent.role
    },
    
    task_management: {
      tasks_created: parseInt(parent.tasks_created) || 0,
      tasks_assigned: parseInt(parent.tasks_assigned) || 0,
      tasks_reviewed: parseInt(parent.tasks_reviewed) || 0,
      tasks_approved: parseInt(parent.tasks_approved) || 0,
      tasks_rejected: parseInt(parent.tasks_rejected) || 0,
      approval_rate: `${parseFloat(parent.approval_rate) || 0}%`,
      avg_review_time: `${parseFloat(parent.avg_review_time_hours) || 0} hours`
    },
    
    reward_management: {
      rewards_created: parseInt(parent.rewards_created) || 0,
      redemptions_reviewed: parseInt(parent.redemptions_reviewed) || 0,
      redemptions_approved: parseInt(parent.redemptions_approved) || 0
    },
    
    recent_actions: formatParentActions(recent_actions),
    tasks_by_category: formatTasksByCategory(tasks_by_category)
  };
};

// ==========================================================================
// HELPER FORMATTERS
// ==========================================================================

/**
 * Calculate punctuality score
 */
const calculatePunctualityScore = (child) => {
  const onTime = parseInt(child.ontime_completions) || 0;
  const late = parseInt(child.late_completions) || 0;
  const total = onTime + late;
  
  if (total === 0) return 0;
  return parseFloat(((onTime / total) * 100).toFixed(2));
};

/**
 * Format recent activity
 */
const formatRecentActivity = (activities) => {
  if (!activities || activities.length === 0) {
    return [];
  }

  return activities.map(activity => ({
    task_title: activity.title,
    category: activity.category || 'Uncategorized',
    status: activity.status,
    points: parseInt(activity.points_reward) || 0,
    assigned_at: activity.assigned_at,
    completed_at: activity.completed_at
  }));
};

/**
 * Format priority distribution
 */
const formatPriorityDistribution = (distribution) => {
  if (!distribution || distribution.length === 0) {
    return [];
  }

  return distribution.map(item => ({
    priority: item.priority,
    total_tasks: parseInt(item.count) || 0,
    completed_tasks: parseInt(item.completed) || 0,
    completion_rate: parseInt(item.count) > 0 
      ? parseFloat(((parseInt(item.completed) / parseInt(item.count)) * 100).toFixed(2))
      : 0
  }));
};

/**
 * Format monthly trends
 */
const formatMonthlyTrends = (trends) => {
  if (!trends || trends.length === 0) {
    return [];
  }

  return trends.map(trend => ({
    month: trend.month,
    tasks_assigned: parseInt(trend.tasks_assigned) || 0,
    tasks_completed: parseInt(trend.tasks_completed) || 0,
    points_earned: parseInt(trend.points_earned) || 0,
    completion_rate: parseFloat(trend.completion_rate) || 0
  }));
};

/**
 * Format category breakdown
 */
const formatCategoryBreakdown = (categories) => {
  if (!categories || categories.length === 0) {
    return [];
  }

  return categories.map(cat => ({
    category: cat.category,
    total_tasks: parseInt(cat.total_tasks) || 0,
    assignments: parseInt(cat.assignments) || 0,
    completed: parseInt(cat.completed) || 0,
    completion_rate: `${parseFloat(cat.completion_rate) || 0}%`
  }));
};

/**
 * Format top tasks
 */
const formatTopTasks = (tasks) => {
  if (!tasks || tasks.length === 0) {
    return [];
  }

  return tasks.map(task => ({
    task_id: task.task_id,
    title: task.title,
    category: task.category || 'Uncategorized',
    priority: task.priority,
    points_reward: parseInt(task.points_reward) || 0,
    times_assigned: parseInt(task.times_assigned) || 0,
    times_completed: parseInt(task.times_completed) || 0,
    completion_rate: parseInt(task.times_assigned) > 0
      ? parseFloat(((parseInt(task.times_completed) / parseInt(task.times_assigned)) * 100).toFixed(2))
      : 0
  }));
};

/**
 * Format status distribution
 */
const formatStatusDistribution = (statuses) => {
  if (!statuses || statuses.length === 0) {
    return [];
  }

  return statuses.map(status => ({
    status: status.status,
    count: parseInt(status.count) || 0
  }));
};

/**
 * Format popular rewards
 */
const formatPopularRewards = (rewards) => {
  if (!rewards || rewards.length === 0) {
    return [];
  }

  return rewards.map(reward => ({
    reward_id: reward.reward_id,
    reward_name: reward.reward_name,
    points_required: parseInt(reward.points_required) || 0,
    redemption_requests: parseInt(reward.redemption_requests) || 0,
    approved_redemptions: parseInt(reward.approved_redemptions) || 0,
    approval_rate: parseInt(reward.redemption_requests) > 0
      ? parseFloat(((parseInt(reward.approved_redemptions) / parseInt(reward.redemption_requests)) * 100).toFixed(2))
      : 0
  }));
};

/**
 * Format child redemption stats
 */
const formatChildRedemptionStats = (stats) => {
  if (!stats || stats.length === 0) {
    return [];
  }

  return stats.map(child => ({
    child_name: child.full_name,
    redemption_requests: parseInt(child.redemption_requests) || 0,
    approved_redemptions: parseInt(child.approved_redemptions) || 0,
    total_points_spent: parseInt(child.total_points_spent) || 0
  }));
};

/**
 * Format reward status
 */
const formatRewardStatus = (statuses) => {
  if (!statuses || statuses.length === 0) {
    return [];
  }

  return statuses.map(status => ({
    status: status.status,
    count: parseInt(status.count) || 0
  }));
};

/**
 * Format top children
 */
const formatTopChildren = (children) => {
  if (!children || children.length === 0) {
    return [];
  }

  return children.map(child => ({
    child_name: child.full_name,
    points_balance: parseInt(child.points_balance) || 0,
    tasks_assigned: parseInt(child.tasks_assigned) || 0,
    tasks_completed: parseInt(child.tasks_completed) || 0,
    completion_rate: `${parseFloat(child.completion_rate) || 0}%`
  }));
};

/**
 * Format recent family activity
 */
const formatRecentFamilyActivity = (activities) => {
  if (!activities || activities.length === 0) {
    return [];
  }

  return activities.map(activity => ({
    activity_type: activity.activity_type,
    description: activity.description,
    actor_name: activity.actor_name,
    activity_date: activity.activity_date
  }));
};

/**
 * Format weekly trend
 */
const formatWeeklyTrend = (trends) => {
  if (!trends || trends.length === 0) {
    return [];
  }

  return trends.map(trend => ({
    week: trend.week,
    tasks_assigned: parseInt(trend.tasks_assigned) || 0,
    tasks_completed: parseInt(trend.tasks_completed) || 0,
    points_earned: parseInt(trend.points_earned) || 0,
    completion_rate: `${parseFloat(trend.completion_rate) || 0}%`
  }));
};

/**
 * Format parent actions
 */
const formatParentActions = (actions) => {
  if (!actions || actions.length === 0) {
    return [];
  }

  return actions.map(action => ({
    action_type: action.action_type,
    description: action.description,
    action_date: action.action_date
  }));
};

/**
 * Format tasks by category
 */
const formatTasksByCategory = (categories) => {
  if (!categories || categories.length === 0) {
    return [];
  }

  return categories.map(cat => ({
    category: cat.category,
    count: parseInt(cat.count) || 0
  }));
};

// ==========================================================================
// EXPORTS
// ==========================================================================

module.exports = {
  formatChildPerformanceReport,
  formatTaskAnalyticsReport,
  formatRewardAnalyticsReport,
  formatFamilySummaryReport,
  formatParentActivityReport
};
