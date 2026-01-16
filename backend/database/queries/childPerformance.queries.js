// ============================================================================
// Child Performance Queries
// Optimized SQL queries for child performance analytics
// Author: Souleymane Camara - BIT1007326
// ============================================================================

const pool = require('../../config/database');

/**
 * Get comprehensive child performance metrics
 */
const getChildPerformanceMetrics = async (child_id, family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 'ta.assigned_at');
  
  const query = `
    SELECT 
      u.user_id,
      u.full_name,
      u.profile_picture,
      u.date_of_birth,
      fm.points_balance AS current_points,
      
      -- Task Completion Statistics
      COUNT(DISTINCT ta.assignment_id) AS total_tasks_assigned,
      COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END) AS tasks_completed,
      COUNT(DISTINCT CASE WHEN ta.status = 'rejected' THEN ta.assignment_id END) AS tasks_rejected,
      COUNT(DISTINCT CASE WHEN ta.status = 'pending' THEN ta.assignment_id END) AS tasks_pending,
      COUNT(DISTINCT CASE WHEN ta.status = 'in_progress' THEN ta.assignment_id END) AS tasks_in_progress,
      COUNT(DISTINCT CASE WHEN ta.status = 'pending_review' THEN ta.assignment_id END) AS tasks_pending_review,
      COUNT(DISTINCT CASE WHEN ta.status = 'overdue' THEN ta.assignment_id END) AS tasks_overdue,
      
      -- Completion Rate
      CASE 
        WHEN COUNT(DISTINCT ta.assignment_id) > 0 
        THEN ROUND(
          (COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END)::NUMERIC / 
           COUNT(DISTINCT ta.assignment_id)) * 100, 2
        )
        ELSE 0 
      END AS completion_rate,
      
      -- Success Rate (First-time approvals)
      CASE 
        WHEN COUNT(DISTINCT ta.assignment_id) > 0 
        THEN ROUND(
          (COUNT(DISTINCT CASE WHEN ta.status = 'approved' AND ta.assignment_id NOT IN (
            SELECT ts1.assignment_id 
            FROM task_submissions ts1 
            WHERE ts1.is_latest = FALSE
          ) THEN ta.assignment_id END)::NUMERIC / 
           COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END)) * 100, 2
        )
        ELSE 0 
      END AS first_time_approval_rate,
      
      -- Points Statistics
      COALESCE(SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END), 0) AS total_points_earned,
      COALESCE(AVG(CASE WHEN ta.status = 'approved' THEN t.points_reward END), 0) AS avg_points_per_task,
      COALESCE(MAX(CASE WHEN ta.status = 'approved' THEN t.points_reward END), 0) AS max_points_earned,
      COALESCE(MIN(CASE WHEN ta.status = 'approved' THEN t.points_reward END), 0) AS min_points_earned,
      
      -- Time Statistics
      ROUND(AVG(
        CASE 
          WHEN ta.status = 'approved' AND ta.completed_at IS NOT NULL AND ta.assigned_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (ta.completed_at - ta.assigned_at))/3600 
        END
      )::NUMERIC, 2) AS avg_completion_time_hours,
      
      ROUND(AVG(
        CASE 
          WHEN ta.status = 'approved' AND ta.reviewed_at IS NOT NULL AND ta.completed_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (ta.reviewed_at - ta.completed_at))/3600 
        END
      )::NUMERIC, 2) AS avg_review_wait_time_hours,
      
      -- Punctuality
      COUNT(CASE 
        WHEN ta.status = 'approved' 
        AND ta.completed_at IS NOT NULL 
        AND ta.due_date IS NOT NULL 
        AND ta.completed_at <= ta.due_date 
        THEN 1 
      END) AS ontime_completions,
      
      COUNT(CASE 
        WHEN ta.status = 'approved' 
        AND ta.completed_at IS NOT NULL 
        AND ta.due_date IS NOT NULL 
        AND ta.completed_at > ta.due_date 
        THEN 1 
      END) AS late_completions,
      
      -- Activity Metrics
      COUNT(DISTINCT DATE(ta.assigned_at)) AS active_days,
      MIN(ta.assigned_at) AS first_task_date,
      MAX(ta.assigned_at) AS last_task_date
      
    FROM users u
    INNER JOIN family_members fm ON u.user_id = fm.user_id
    LEFT JOIN task_assignments ta ON u.user_id = ta.assigned_to
    LEFT JOIN tasks t ON ta.task_id = t.task_id
    WHERE u.user_id = $1 
      AND fm.family_id = $2
      AND u.role = 'child'
      ${dateFilter}
    GROUP BY u.user_id, u.full_name, u.profile_picture, u.date_of_birth, fm.points_balance
  `;
  
  const result = await pool.query(query, [child_id, family_id]);
  return result.rows[0];
};

/**
 * Get child's task breakdown by category
 */
const getChildTasksByCategory = async (child_id, family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 'ta.assigned_at');
  
  const query = `
    SELECT 
      COALESCE(t.category, 'Uncategorized') AS category,
      COUNT(ta.assignment_id) AS total_tasks,
      COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS completed_tasks,
      COUNT(CASE WHEN ta.status = 'rejected' THEN 1 END) AS rejected_tasks,
      COUNT(CASE WHEN ta.status = 'overdue' THEN 1 END) AS overdue_tasks,
      SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END) AS points_earned,
      ROUND(
        CASE 
          WHEN COUNT(ta.assignment_id) > 0 
          THEN (COUNT(CASE WHEN ta.status = 'approved' THEN 1 END)::NUMERIC / COUNT(ta.assignment_id)) * 100 
          ELSE 0 
        END, 2
      ) AS completion_rate
    FROM task_assignments ta
    INNER JOIN tasks t ON ta.task_id = t.task_id
    WHERE ta.assigned_to = $1 AND t.family_id = $2
      ${dateFilter}
    GROUP BY t.category
    ORDER BY total_tasks DESC
  `;
  
  const result = await pool.query(query, [child_id, family_id]);
  return result.rows;
};

/**
 * Get child's task breakdown by priority
 */
const getChildTasksByPriority = async (child_id, family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 'ta.assigned_at');
  
  const query = `
    SELECT 
      t.priority,
      COUNT(ta.assignment_id) AS total_tasks,
      COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS completed_tasks,
      COUNT(CASE WHEN ta.status = 'overdue' THEN 1 END) AS overdue_tasks,
      SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END) AS points_earned,
      ROUND(AVG(
        CASE 
          WHEN ta.status = 'approved' AND ta.completed_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (ta.completed_at - ta.assigned_at))/3600 
        END
      )::NUMERIC, 2) AS avg_completion_time_hours
    FROM task_assignments ta
    INNER JOIN tasks t ON ta.task_id = t.task_id
    WHERE ta.assigned_to = $1 AND t.family_id = $2
      ${dateFilter}
    GROUP BY t.priority
    ORDER BY 
      CASE t.priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END
  `;
  
  const result = await pool.query(query, [child_id, family_id]);
  return result.rows;
};

/**
 * Get child's recent task activity
 */
const getChildRecentActivity = async (child_id, family_id, limit = 20) => {
  const query = `
    SELECT 
      ta.assignment_id,
      t.task_id,
      t.title,
      t.description,
      t.category,
      t.priority,
      t.points_reward,
      ta.status,
      ta.assigned_at,
      ta.started_at,
      ta.completed_at,
      ta.reviewed_at,
      ta.due_date,
      ta.review_comments,
      u_assigned.full_name AS assigned_by_name,
      u_reviewed.full_name AS reviewed_by_name,
      ts.photo_url,
      ts.submission_notes
    FROM task_assignments ta
    INNER JOIN tasks t ON ta.task_id = t.task_id
    LEFT JOIN users u_assigned ON ta.assigned_by = u_assigned.user_id
    LEFT JOIN users u_reviewed ON ta.reviewed_by = u_reviewed.user_id
    LEFT JOIN task_submissions ts ON ta.assignment_id = ts.assignment_id AND ts.is_latest = TRUE
    WHERE ta.assigned_to = $1 AND t.family_id = $2
    ORDER BY ta.assigned_at DESC
    LIMIT $3
  `;
  
  const result = await pool.query(query, [child_id, family_id, limit]);
  return result.rows;
};

/**
 * Get child's monthly performance trends
 */
const getChildMonthlyTrends = async (child_id, family_id, months = 6) => {
  const query = `
    SELECT 
      TO_CHAR(ta.assigned_at, 'YYYY-MM') AS month,
      TO_CHAR(ta.assigned_at, 'Mon YYYY') AS month_name,
      COUNT(ta.assignment_id) AS tasks_assigned,
      COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS tasks_completed,
      COUNT(CASE WHEN ta.status = 'rejected' THEN 1 END) AS tasks_rejected,
      COUNT(CASE WHEN ta.status = 'overdue' THEN 1 END) AS tasks_overdue,
      SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END) AS points_earned,
      ROUND(
        CASE 
          WHEN COUNT(ta.assignment_id) > 0 
          THEN (COUNT(CASE WHEN ta.status = 'approved' THEN 1 END)::NUMERIC / COUNT(ta.assignment_id)) * 100 
          ELSE 0 
        END, 2
      ) AS completion_rate
    FROM task_assignments ta
    INNER JOIN tasks t ON ta.task_id = t.task_id
    WHERE ta.assigned_to = $1 AND t.family_id = $2
    GROUP BY TO_CHAR(ta.assigned_at, 'YYYY-MM'), TO_CHAR(ta.assigned_at, 'Mon YYYY')
    ORDER BY month DESC
    LIMIT $3
  `;
  
  const result = await pool.query(query, [child_id, family_id, months]);
  return result.rows;
};

/**
 * Get child's weekly performance trends
 */
const getChildWeeklyTrends = async (child_id, family_id, weeks = 12) => {
  const query = `
    SELECT 
      TO_CHAR(ta.assigned_at, 'IYYY-IW') AS week,
      DATE_TRUNC('week', ta.assigned_at)::DATE AS week_start,
      COUNT(ta.assignment_id) AS tasks_assigned,
      COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS tasks_completed,
      SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END) AS points_earned,
      ROUND(
        CASE 
          WHEN COUNT(ta.assignment_id) > 0 
          THEN (COUNT(CASE WHEN ta.status = 'approved' THEN 1 END)::NUMERIC / COUNT(ta.assignment_id)) * 100 
          ELSE 0 
        END, 2
      ) AS completion_rate
    FROM task_assignments ta
    INNER JOIN tasks t ON ta.task_id = t.task_id
    WHERE ta.assigned_to = $1 AND t.family_id = $2
    GROUP BY TO_CHAR(ta.assigned_at, 'IYYY-IW'), DATE_TRUNC('week', ta.assigned_at)
    ORDER BY week DESC
    LIMIT $3
  `;
  
  const result = await pool.query(query, [child_id, family_id, weeks]);
  return result.rows;
};

/**
 * Get child's achievement milestones
 */
const getChildAchievements = async (child_id, family_id) => {
  const query = `
    SELECT 
      -- Total achievements
      (SELECT COUNT(*) FROM task_assignments ta 
       INNER JOIN tasks t ON ta.task_id = t.task_id 
       WHERE ta.assigned_to = $1 AND t.family_id = $2 AND ta.status = 'approved') AS total_tasks_completed,
      
      -- Streak information
      (SELECT COUNT(*) FROM (
        SELECT DATE(ta.completed_at) AS completion_date
        FROM task_assignments ta
        INNER JOIN tasks t ON ta.task_id = t.task_id
        WHERE ta.assigned_to = $1 AND t.family_id = $2 AND ta.status = 'approved'
        GROUP BY DATE(ta.completed_at)
        ORDER BY completion_date DESC
        LIMIT 1000
      ) consecutive_days) AS current_streak_days,
      
      -- Points milestones
      (SELECT fm.points_balance FROM family_members fm WHERE fm.user_id = $1 AND fm.family_id = $2) AS total_points,
      
      -- Perfect tasks (completed on first submission)
      (SELECT COUNT(*) FROM task_assignments ta
       INNER JOIN tasks t ON ta.task_id = t.task_id
       WHERE ta.assigned_to = $1 
       AND t.family_id = $2 
       AND ta.status = 'approved'
       AND ta.assignment_id NOT IN (
         SELECT ts.assignment_id FROM task_submissions ts WHERE ts.is_latest = FALSE
       )) AS perfect_tasks,
      
      -- Best category
      (SELECT t.category 
       FROM task_assignments ta
       INNER JOIN tasks t ON ta.task_id = t.task_id
       WHERE ta.assigned_to = $1 AND t.family_id = $2 AND ta.status = 'approved'
       GROUP BY t.category
       ORDER BY COUNT(*) DESC
       LIMIT 1) AS best_category
  `;
  
  const result = await pool.query(query, [child_id, family_id]);
  return result.rows[0];
};

/**
 * Compare child with family average
 */
const compareChildWithFamilyAverage = async (child_id, family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 'ta.assigned_at');
  
  const query = `
    WITH child_stats AS (
      SELECT 
        ROUND(
          CASE 
            WHEN COUNT(ta.assignment_id) > 0 
            THEN (COUNT(CASE WHEN ta.status = 'approved' THEN 1 END)::NUMERIC / COUNT(ta.assignment_id)) * 100 
            ELSE 0 
          END, 2
        ) AS completion_rate,
        COALESCE(SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END), 0) AS total_points
      FROM task_assignments ta
      INNER JOIN tasks t ON ta.task_id = t.task_id
      WHERE ta.assigned_to = $1 AND t.family_id = $2
        ${dateFilter}
    ),
    family_avg AS (
      SELECT 
        ROUND(AVG(
          CASE 
            WHEN COUNT(ta.assignment_id) > 0 
            THEN (COUNT(CASE WHEN ta.status = 'approved' THEN 1 END)::NUMERIC / COUNT(ta.assignment_id)) * 100 
            ELSE 0 
          END
        )::NUMERIC, 2) AS avg_completion_rate,
        ROUND(AVG(COALESCE(SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END), 0))::NUMERIC, 0) AS avg_points
      FROM task_assignments ta
      INNER JOIN tasks t ON ta.task_id = t.task_id
      INNER JOIN users u ON ta.assigned_to = u.user_id
      WHERE t.family_id = $2 AND u.role = 'child'
        ${dateFilter}
      GROUP BY ta.assigned_to
    )
    SELECT 
      cs.completion_rate AS child_completion_rate,
      fa.avg_completion_rate AS family_avg_completion_rate,
      cs.completion_rate - fa.avg_completion_rate AS completion_rate_difference,
      cs.total_points AS child_total_points,
      fa.avg_points AS family_avg_points,
      cs.total_points - fa.avg_points AS points_difference
    FROM child_stats cs, family_avg fa
  `;
  
  const result = await pool.query(query, [child_id, family_id]);
  return result.rows[0];
};

/**
 * Get child's performance ranking within family
 */
const getChildFamilyRanking = async (child_id, family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 'ta.assigned_at');
  
  const query = `
    WITH child_rankings AS (
      SELECT 
        u.user_id,
        u.full_name,
        COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS tasks_completed,
        ROUND(
          CASE 
            WHEN COUNT(ta.assignment_id) > 0 
            THEN (COUNT(CASE WHEN ta.status = 'approved' THEN 1 END)::NUMERIC / COUNT(ta.assignment_id)) * 100 
            ELSE 0 
          END, 2
        ) AS completion_rate,
        SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END) AS total_points,
        RANK() OVER (ORDER BY COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) DESC) AS rank_by_tasks,
        RANK() OVER (ORDER BY SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END) DESC) AS rank_by_points
      FROM users u
      INNER JOIN family_members fm ON u.user_id = fm.user_id
      LEFT JOIN task_assignments ta ON u.user_id = ta.assigned_to
      LEFT JOIN tasks t ON ta.task_id = t.task_id
      WHERE fm.family_id = $2 AND u.role = 'child'
        ${dateFilter}
      GROUP BY u.user_id, u.full_name
    )
    SELECT * FROM child_rankings WHERE user_id = $1
  `;
  
  const result = await pool.query(query, [child_id, family_id]);
  return result.rows[0];
};

// ==========================================================================
// HELPER FUNCTIONS
// ==========================================================================

/**
 * Build date filter for SQL queries
 */
const buildDateFilter = (start_date, end_date, column_name) => {
  let filter = '';
  
  if (start_date && end_date) {
    filter = `AND ${column_name} BETWEEN '${start_date}' AND '${end_date}'`;
  } else if (start_date) {
    filter = `AND ${column_name} >= '${start_date}'`;
  } else if (end_date) {
    filter = `AND ${column_name} <= '${end_date}'`;
  }
  
  return filter;
};

// ==========================================================================
// EXPORTS
// ==========================================================================

module.exports = {
  getChildPerformanceMetrics,
  getChildTasksByCategory,
  getChildTasksByPriority,
  getChildRecentActivity,
  getChildMonthlyTrends,
  getChildWeeklyTrends,
  getChildAchievements,
  compareChildWithFamilyAverage,
  getChildFamilyRanking
};
