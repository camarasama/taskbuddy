// ============================================================================
// Report Controller - Analytics and reporting endpoints
// ============================================================================

const pool = require('../config/database');

exports.getChildPerformanceReport = async (req, res) => {
  try {
    const { childId } = req.params;
    const { startDate, endDate } = req.query;

    // Basic performance metrics
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE status = 'approved') as completed_tasks,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_tasks,
        COUNT(*) FILTER (WHERE status = 'overdue') as overdue_tasks,
        AVG(CASE WHEN status = 'approved' THEN 
          EXTRACT(EPOCH FROM (reviewed_at - assigned_at))/3600 
        END) as avg_completion_hours
       FROM task_assignments
       WHERE assigned_to = $1
       ${startDate ? 'AND assigned_at >= $2' : ''}
       ${endDate ? 'AND assigned_at <= $3' : ''}`,
      [childId, startDate, endDate].filter(v => v !== undefined)
    );

    res.status(200).json({ success: true, data: { report: result.rows[0] } });
  } catch (error) {
    console.error('Get child performance report error:', error);
    res.status(500).json({ success: false, message: 'Failed to get report', error: error.message });
  }
};

exports.getChildPerformanceSummary = async (req, res) => {
  try {
    const { childId } = req.params;
    
    const result = await pool.query(
      `SELECT * FROM v_child_performance WHERE user_id = $1`,
      [childId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }

    res.status(200).json({ success: true, data: { summary: result.rows[0] } });
  } catch (error) {
    console.error('Get performance summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to get summary', error: error.message });
  }
};

exports.getChildPerformanceTrends = async (req, res) => {
  try {
    const { childId } = req.params;
    const { period = 'month' } = req.query;

    // Simplified trend analysis
    const result = await pool.query(
      `SELECT 
        DATE_TRUNC($1, assigned_at) as period,
        COUNT(*) as tasks_assigned,
        COUNT(*) FILTER (WHERE status = 'approved') as tasks_completed
       FROM task_assignments
       WHERE assigned_to = $2
       GROUP BY period
       ORDER BY period DESC
       LIMIT 12`,
      [period, childId]
    );

    res.status(200).json({ success: true, data: { trends: result.rows } });
  } catch (error) {
    console.error('Get performance trends error:', error);
    res.status(500).json({ success: false, message: 'Failed to get trends', error: error.message });
  }
};

exports.getTaskAnalytics = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE status = 'active') as active_tasks,
        AVG(points_reward) as avg_points,
        COUNT(*) FILTER (WHERE is_recurring = TRUE) as recurring_tasks
       FROM tasks WHERE family_id = $1`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { analytics: result.rows[0] } });
  } catch (error) {
    console.error('Get task analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to get analytics', error: error.message });
  }
};

exports.getTaskCompletionReport = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    const result = await pool.query(
      `SELECT 
        COUNT(ta.assignment_id) as total_assignments,
        COUNT(ta.assignment_id) FILTER (WHERE ta.status = 'approved') as completed,
        ROUND(100.0 * COUNT(ta.assignment_id) FILTER (WHERE ta.status = 'approved') / 
          NULLIF(COUNT(ta.assignment_id), 0), 2) as completion_rate
       FROM task_assignments ta
       INNER JOIN tasks t ON ta.task_id = t.task_id
       WHERE t.family_id = $1`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { report: result.rows[0] } });
  } catch (error) {
    console.error('Get completion report error:', error);
    res.status(500).json({ success: false, message: 'Failed to get report', error: error.message });
  }
};

exports.getTaskCategoryReport = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    const result = await pool.query(
      `SELECT category, COUNT(*) as count FROM tasks 
       WHERE family_id = $1 AND category IS NOT NULL
       GROUP BY category
       ORDER BY count DESC`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { categories: result.rows } });
  } catch (error) {
    console.error('Get category report error:', error);
    res.status(500).json({ success: false, message: 'Failed to get report', error: error.message });
  }
};

exports.getOverdueTasksReport = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    const result = await pool.query(
      `SELECT ta.*, t.title, u.full_name as child_name
       FROM task_assignments ta
       INNER JOIN tasks t ON ta.task_id = t.task_id
       INNER JOIN users u ON ta.assigned_to = u.user_id
       WHERE t.family_id = $1 AND ta.due_date < CURRENT_TIMESTAMP 
         AND ta.status NOT IN ('approved', 'rejected')
       ORDER BY ta.due_date ASC`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { overdue_tasks: result.rows } });
  } catch (error) {
    console.error('Get overdue report error:', error);
    res.status(500).json({ success: false, message: 'Failed to get report', error: error.message });
  }
};

exports.getRewardRedemptionReport = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_redemptions,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        SUM(points_spent) FILTER (WHERE status = 'approved') as total_points_spent
       FROM reward_redemptions WHERE family_id = $1`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { report: result.rows[0] } });
  } catch (error) {
    console.error('Get redemption report error:', error);
    res.status(500).json({ success: false, message: 'Failed to get report', error: error.message });
  }
};

exports.getPopularRewardsReport = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { limit = 10 } = req.query;
    
    const result = await pool.query(
      `SELECT r.reward_name, r.points_required, COUNT(rr.redemption_id) as redemption_count
       FROM rewards r
       LEFT JOIN reward_redemptions rr ON r.reward_id = rr.reward_id
       WHERE r.family_id = $1
       GROUP BY r.reward_id
       ORDER BY redemption_count DESC
       LIMIT $2`,
      [familyId, limit]
    );

    res.status(200).json({ success: true, data: { popular_rewards: result.rows } });
  } catch (error) {
    console.error('Get popular rewards error:', error);
    res.status(500).json({ success: false, message: 'Failed to get report', error: error.message });
  }
};

exports.getRewardTrends = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { period = 'month' } = req.query;
    
    const result = await pool.query(
      `SELECT 
        DATE_TRUNC($1, requested_at) as period,
        COUNT(*) as redemption_count
       FROM reward_redemptions
       WHERE family_id = $2
       GROUP BY period
       ORDER BY period DESC
       LIMIT 12`,
      [period, familyId]
    );

    res.status(200).json({ success: true, data: { trends: result.rows } });
  } catch (error) {
    console.error('Get reward trends error:', error);
    res.status(500).json({ success: false, message: 'Failed to get trends', error: error.message });
  }
};

exports.getFamilyActivitySummary = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    const result = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM tasks WHERE family_id = $1) as total_tasks,
        (SELECT COUNT(*) FROM task_assignments ta 
         INNER JOIN tasks t ON ta.task_id = t.task_id 
         WHERE t.family_id = $1) as total_assignments,
        (SELECT COUNT(*) FROM rewards WHERE family_id = $1) as total_rewards,
        (SELECT COUNT(*) FROM reward_redemptions WHERE family_id = $1) as total_redemptions`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { summary: result.rows[0] } });
  } catch (error) {
    console.error('Get family summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to get summary', error: error.message });
  }
};

exports.getFamilyDashboard = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    const result = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM task_assignments ta 
         INNER JOIN tasks t ON ta.task_id = t.task_id 
         WHERE t.family_id = $1 AND ta.status = 'pending_review') as pending_reviews,
        (SELECT COUNT(*) FROM reward_redemptions 
         WHERE family_id = $1 AND status = 'pending') as pending_redemptions,
        (SELECT COUNT(*) FROM task_assignments ta 
         INNER JOIN tasks t ON ta.task_id = t.task_id 
         WHERE t.family_id = $1 AND ta.status = 'overdue') as overdue_tasks`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { dashboard: result.rows[0] } });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to get dashboard', error: error.message });
  }
};

exports.getFamilyEngagementReport = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    const result = await pool.query(
      `SELECT 
        u.user_id, u.full_name,
        COUNT(ta.assignment_id) as tasks_completed,
        COUNT(rr.redemption_id) as rewards_redeemed
       FROM family_members fm
       INNER JOIN users u ON fm.user_id = u.user_id
       LEFT JOIN task_assignments ta ON u.user_id = ta.assigned_to AND ta.status = 'approved'
       LEFT JOIN reward_redemptions rr ON u.user_id = rr.child_id AND rr.status = 'approved'
       WHERE fm.family_id = $1 AND fm.relationship = 'child'
       GROUP BY u.user_id, u.full_name`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { engagement: result.rows } });
  } catch (error) {
    console.error('Get engagement report error:', error);
    res.status(500).json({ success: false, message: 'Failed to get report', error: error.message });
  }
};

exports.getParentActivityReport = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    const result = await pool.query(
      `SELECT 
        u.user_id, u.full_name,
        COUNT(DISTINCT t.task_id) as tasks_created,
        COUNT(DISTINCT ta.assignment_id) FILTER (WHERE ta.reviewed_by = u.user_id) as reviews_completed
       FROM family_members fm
       INNER JOIN users u ON fm.user_id = u.user_id
       LEFT JOIN tasks t ON u.user_id = t.created_by
       LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
       WHERE fm.family_id = $1 AND fm.relationship IN ('parent', 'spouse')
       GROUP BY u.user_id, u.full_name`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { parent_activity: result.rows } });
  } catch (error) {
    console.error('Get parent activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to get report', error: error.message });
  }
};

exports.getParentActivitySummary = async (req, res) => {
  try {
    const { parentId } = req.params;
    
    const result = await pool.query(
      `SELECT 
        COUNT(DISTINCT task_id) as tasks_created,
        (SELECT COUNT(*) FROM task_assignments WHERE reviewed_by = $1) as reviews_completed,
        (SELECT COUNT(*) FROM reward_redemptions WHERE reviewed_by = $1) as redemptions_reviewed
       FROM tasks WHERE created_by = $1`,
      [parentId]
    );

    res.status(200).json({ success: true, data: { summary: result.rows[0] } });
  } catch (error) {
    console.error('Get parent summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to get summary', error: error.message });
  }
};

exports.getPointsDistributionReport = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    const result = await pool.query(
      `SELECT u.full_name, fm.points_balance
       FROM family_members fm
       INNER JOIN users u ON fm.user_id = u.user_id
       WHERE fm.family_id = $1 AND fm.relationship = 'child'
       ORDER BY fm.points_balance DESC`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { distribution: result.rows } });
  } catch (error) {
    console.error('Get points distribution error:', error);
    res.status(500).json({ success: false, message: 'Failed to get report', error: error.message });
  }
};

exports.getPointsTrends = async (req, res) => {
  try {
    const { childId } = req.params;
    const { period = 'month' } = req.query;
    
    const result = await pool.query(
      `SELECT 
        DATE_TRUNC($1, created_at) as period,
        SUM(points_amount) FILTER (WHERE transaction_type = 'earned') as points_earned,
        SUM(ABS(points_amount)) FILTER (WHERE transaction_type = 'spent') as points_spent
       FROM points_log pl
       INNER JOIN family_members fm ON pl.family_member_id = fm.member_id
       WHERE fm.user_id = $2
       GROUP BY period
       ORDER BY period DESC
       LIMIT 12`,
      [period, childId]
    );

    res.status(200).json({ success: true, data: { trends: result.rows } });
  } catch (error) {
    console.error('Get points trends error:', error);
    res.status(500).json({ success: false, message: 'Failed to get trends', error: error.message });
  }
};

exports.compareChildren = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    const result = await pool.query(
      `SELECT 
        u.user_id, u.full_name, fm.points_balance,
        COUNT(ta.assignment_id) FILTER (WHERE ta.status = 'approved') as tasks_completed,
        COUNT(rr.redemption_id) FILTER (WHERE rr.status = 'approved') as rewards_redeemed
       FROM family_members fm
       INNER JOIN users u ON fm.user_id = u.user_id
       LEFT JOIN task_assignments ta ON u.user_id = ta.assigned_to
       LEFT JOIN reward_redemptions rr ON u.user_id = rr.child_id
       WHERE fm.family_id = $1 AND fm.relationship = 'child'
       GROUP BY u.user_id, u.full_name, fm.points_balance
       ORDER BY fm.points_balance DESC`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { comparison: result.rows } });
  } catch (error) {
    console.error('Compare children error:', error);
    res.status(500).json({ success: false, message: 'Failed to compare', error: error.message });
  }
};

exports.comparePeriods = async (req, res) => {
  try {
    // Simplified period comparison
    res.status(200).json({ 
      success: true, 
      data: { message: 'Period comparison - implementation pending' } 
    });
  } catch (error) {
    console.error('Compare periods error:', error);
    res.status(500).json({ success: false, message: 'Failed to compare periods', error: error.message });
  }
};

exports.exportReportPDF = async (req, res) => {
  res.status(501).json({ success: false, message: 'PDF export - coming soon' });
};

exports.exportReportCSV = async (req, res) => {
  res.status(501).json({ success: false, message: 'CSV export - coming soon' });
};
