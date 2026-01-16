// ============================================================================
// Task Analytics Queries
// Optimized SQL queries for task performance analytics
// Author: Souleymane Camara - BIT1007326
// ============================================================================

const pool = require('../../config/database');

/**
 * Get comprehensive task analytics overview
 */
const getTaskAnalyticsOverview = async (family_id, start_date = null, end_date = null, category = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 't.created_at');
  const categoryFilter = category ? `AND t.category = '${category}'` : '';
  
  const query = `
    SELECT 
      -- Task Creation Statistics
      COUNT(DISTINCT t.task_id) AS total_tasks_created,
      COUNT(DISTINCT CASE WHEN t.status = 'active' THEN t.task_id END) AS active_tasks,
      COUNT(DISTINCT CASE WHEN t.status = 'inactive' THEN t.task_id END) AS inactive_tasks,
      COUNT(DISTINCT CASE WHEN t.is_recurring THEN t.task_id END) AS recurring_tasks,
      COUNT(DISTINCT CASE WHEN t.photo_required THEN t.task_id END) AS photo_required_tasks,
      
      -- Assignment Statistics
      COUNT(DISTINCT ta.assignment_id) AS total_assignments,
      COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END) AS completed_assignments,
      COUNT(DISTINCT CASE WHEN ta.status = 'rejected' THEN ta.assignment_id END) AS rejected_assignments,
      COUNT(DISTINCT CASE WHEN ta.status = 'pending' THEN ta.assignment_id END) AS pending_assignments,
      COUNT(DISTINCT CASE WHEN ta.status = 'in_progress' THEN ta.assignment_id END) AS in_progress_assignments,
      COUNT(DISTINCT CASE WHEN ta.status = 'pending_review' THEN ta.assignment_id END) AS pending_review_assignments,
      COUNT(DISTINCT CASE WHEN ta.status = 'overdue' THEN ta.assignment_id END) AS overdue_assignments,
      
      -- Completion Rate
      CASE 
        WHEN COUNT(DISTINCT ta.assignment_id) > 0 
        THEN ROUND(
          (COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END)::NUMERIC / 
           COUNT(DISTINCT ta.assignment_id)) * 100, 2
        )
        ELSE 0 
      END AS overall_completion_rate,
      
      -- Rejection Rate
      CASE 
        WHEN COUNT(DISTINCT ta.assignment_id) > 0 
        THEN ROUND(
          (COUNT(DISTINCT CASE WHEN ta.status = 'rejected' THEN ta.assignment_id END)::NUMERIC / 
           COUNT(DISTINCT ta.assignment_id)) * 100, 2
        )
        ELSE 0 
      END AS rejection_rate,
      
      -- Time Statistics
      ROUND(AVG(
        CASE 
          WHEN ta.status = 'approved' AND ta.completed_at IS NOT NULL AND ta.assigned_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (ta.completed_at - ta.assigned_at))/3600 
        END
      )::NUMERIC, 2) AS avg_completion_time_hours,
      
      ROUND(AVG(
        CASE 
          WHEN ta.reviewed_at IS NOT NULL AND ta.completed_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (ta.reviewed_at - ta.completed_at))/3600 
        END
      )::NUMERIC, 2) AS avg_review_time_hours,
      
      -- Points Statistics
      SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END) AS total_points_awarded,
      ROUND(AVG(t.points_reward)::NUMERIC, 2) AS avg_points_per_task,
      MAX(t.points_reward) AS max_points_per_task,
      MIN(t.points_reward) AS min_points_per_task,
      
      -- Priority Distribution
      COUNT(CASE WHEN t.priority = 'low' THEN 1 END) AS low_priority_count,
      COUNT(CASE WHEN t.priority = 'medium' THEN 1 END) AS medium_priority_count,
      COUNT(CASE WHEN t.priority = 'high' THEN 1 END) AS high_priority_count,
      COUNT(CASE WHEN t.priority = 'urgent' THEN 1 END) AS urgent_priority_count,
      
      -- Unique metrics
      COUNT(DISTINCT t.created_by) AS unique_task_creators,
      COUNT(DISTINCT ta.assigned_to) AS unique_children_assigned,
      COUNT(DISTINCT t.category) AS unique_categories
      
    FROM tasks t
    LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
    WHERE t.family_id = $1
      ${dateFilter}
      ${categoryFilter}
  `;
  
  const result = await pool.query(query, [family_id]);
  return result.rows[0];
};

/**
 * Get task breakdown by category
 */
const getTasksByCategory = async (family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 't.created_at');
  
  const query = `
    SELECT 
      COALESCE(t.category, 'Uncategorized') AS category,
      COUNT(DISTINCT t.task_id) AS total_tasks,
      COUNT(DISTINCT ta.assignment_id) AS total_assignments,
      COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END) AS completed_assignments,
      COUNT(DISTINCT CASE WHEN ta.status = 'rejected' THEN ta.assignment_id END) AS rejected_assignments,
      COUNT(DISTINCT CASE WHEN ta.status = 'overdue' THEN ta.assignment_id END) AS overdue_assignments,
      SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END) AS total_points_awarded,
      ROUND(AVG(t.points_reward)::NUMERIC, 2) AS avg_points_per_task,
      ROUND(
        CASE 
          WHEN COUNT(DISTINCT ta.assignment_id) > 0 
          THEN (COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END)::NUMERIC / 
                COUNT(DISTINCT ta.assignment_id)) * 100 
          ELSE 0 
        END, 2
      ) AS completion_rate,
      ROUND(AVG(
        CASE 
          WHEN ta.status = 'approved' AND ta.completed_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (ta.completed_at - ta.assigned_at))/3600 
        END
      )::NUMERIC, 2) AS avg_completion_time_hours
    FROM tasks t
    LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
    WHERE t.family_id = $1
      ${dateFilter}
    GROUP BY t.category
    ORDER BY total_tasks DESC
  `;
  
  const result = await pool.query(query, [family_id]);
  return result.rows;
};

/**
 * Get task breakdown by priority
 */
const getTasksByPriority = async (family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 't.created_at');
  
  const query = `
    SELECT 
      t.priority,
      COUNT(DISTINCT t.task_id) AS total_tasks,
      COUNT(DISTINCT ta.assignment_id) AS total_assignments,
      COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END) AS completed_assignments,
      COUNT(DISTINCT CASE WHEN ta.status = 'overdue' THEN ta.assignment_id END) AS overdue_assignments,
      SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END) AS total_points_awarded,
      ROUND(
        CASE 
          WHEN COUNT(DISTINCT ta.assignment_id) > 0 
          THEN (COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END)::NUMERIC / 
                COUNT(DISTINCT ta.assignment_id)) * 100 
          ELSE 0 
        END, 2
      ) AS completion_rate,
      ROUND(AVG(
        CASE 
          WHEN ta.status = 'approved' AND ta.completed_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (ta.completed_at - ta.assigned_at))/3600 
        END
      )::NUMERIC, 2) AS avg_completion_time_hours
    FROM tasks t
    LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
    WHERE t.family_id = $1
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
  
  const result = await pool.query(query, [family_id]);
  return result.rows;
};

/**
 * Get most assigned tasks
 */
const getMostAssignedTasks = async (family_id, start_date = null, end_date = null, limit = 10) => {
  const dateFilter = buildDateFilter(start_date, end_date, 't.created_at');
  
  const query = `
    SELECT 
      t.task_id,
      t.title,
      t.description,
      t.category,
      t.priority,
      t.points_reward,
      t.photo_required,
      t.is_recurring,
      COUNT(ta.assignment_id) AS times_assigned,
      COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS times_completed,
      COUNT(CASE WHEN ta.status = 'rejected' THEN 1 END) AS times_rejected,
      ROUND(
        CASE 
          WHEN COUNT(ta.assignment_id) > 0 
          THEN (COUNT(CASE WHEN ta.status = 'approved' THEN 1 END)::NUMERIC / COUNT(ta.assignment_id)) * 100 
          ELSE 0 
        END, 2
      ) AS completion_rate,
      ROUND(AVG(
        CASE 
          WHEN ta.status = 'approved' AND ta.completed_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (ta.completed_at - ta.assigned_at))/3600 
        END
      )::NUMERIC, 2) AS avg_completion_time_hours,
      u.full_name AS created_by_name
    FROM tasks t
    LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
    LEFT JOIN users u ON t.created_by = u.user_id
    WHERE t.family_id = $1
      ${dateFilter}
    GROUP BY t.task_id, t.title, t.description, t.category, t.priority, 
             t.points_reward, t.photo_required, t.is_recurring, u.full_name
    ORDER BY times_assigned DESC
    LIMIT $2
  `;
  
  const result = await pool.query(query, [family_id, limit]);
  return result.rows;
};

/**
 * Get task status distribution
 */
const getTaskStatusDistribution = async (family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 'ta.assigned_at');
  
  const query = `
    SELECT 
      ta.status,
      COUNT(ta.assignment_id) AS count,
      ROUND((COUNT(ta.assignment_id)::NUMERIC / 
             (SELECT COUNT(*) FROM task_assignments ta2 
              INNER JOIN tasks t2 ON ta2.task_id = t2.task_id 
              WHERE t2.family_id = $1 ${dateFilter})) * 100, 2) AS percentage
    FROM task_assignments ta
    INNER JOIN tasks t ON ta.task_id = t.task_id
    WHERE t.family_id = $1
      ${dateFilter}
    GROUP BY ta.status
    ORDER BY count DESC
  `;
  
  const result = await pool.query(query, [family_id]);
  return result.rows;
};

/**
 * Get recurring vs one-time task comparison
 */
const getRecurringVsOneTimeComparison = async (family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 't.created_at');
  
  const query = `
    SELECT 
      CASE WHEN t.is_recurring THEN 'Recurring' ELSE 'One-time' END AS task_type,
      COUNT(DISTINCT t.task_id) AS total_tasks,
      COUNT(ta.assignment_id) AS total_assignments,
      COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS completed_assignments,
      ROUND(
        CASE 
          WHEN COUNT(ta.assignment_id) > 0 
          THEN (COUNT(CASE WHEN ta.status = 'approved' THEN 1 END)::NUMERIC / COUNT(ta.assignment_id)) * 100 
          ELSE 0 
        END, 2
      ) AS completion_rate,
      SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END) AS total_points_awarded
    FROM tasks t
    LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
    WHERE t.family_id = $1
      ${dateFilter}
    GROUP BY t.is_recurring
  `;
  
  const result = await pool.query(query, [family_id]);
  return result.rows;
};

/**
 * Get photo-required vs optional task comparison
 */
const getPhotoRequiredComparison = async (family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 't.created_at');
  
  const query = `
    SELECT 
      CASE WHEN t.photo_required THEN 'Photo Required' ELSE 'No Photo' END AS photo_requirement,
      COUNT(DISTINCT t.task_id) AS total_tasks,
      COUNT(ta.assignment_id) AS total_assignments,
      COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS completed_assignments,
      COUNT(CASE WHEN ta.status = 'rejected' THEN 1 END) AS rejected_assignments,
      ROUND(
        CASE 
          WHEN COUNT(ta.assignment_id) > 0 
          THEN (COUNT(CASE WHEN ta.status = 'approved' THEN 1 END)::NUMERIC / COUNT(ta.assignment_id)) * 100 
          ELSE 0 
        END, 2
      ) AS completion_rate,
      ROUND(
        CASE 
          WHEN COUNT(ta.assignment_id) > 0 
          THEN (COUNT(CASE WHEN ta.status = 'rejected' THEN 1 END)::NUMERIC / COUNT(ta.assignment_id)) * 100 
          ELSE 0 
        END, 2
      ) AS rejection_rate
    FROM tasks t
    LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
    WHERE t.family_id = $1
      ${dateFilter}
    GROUP BY t.photo_required
  `;
  
  const result = await pool.query(query, [family_id]);
  return result.rows;
};

/**
 * Get daily task creation trend
 */
const getDailyTaskCreationTrend = async (family_id, days = 30) => {
  const query = `
    SELECT 
      DATE(t.created_at) AS date,
      COUNT(t.task_id) AS tasks_created,
      COUNT(ta.assignment_id) AS assignments_made
    FROM tasks t
    LEFT JOIN task_assignments ta ON t.task_id = ta.task_id AND DATE(ta.assigned_at) = DATE(t.created_at)
    WHERE t.family_id = $1
      AND t.created_at >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY DATE(t.created_at)
    ORDER BY date DESC
  `;
  
  const result = await pool.query(query, [family_id]);
  return result.rows;
};

/**
 * Get weekly task completion trend
 */
const getWeeklyTaskCompletionTrend = async (family_id, weeks = 12) => {
  const query = `
    SELECT 
      TO_CHAR(ta.assigned_at, 'IYYY-IW') AS week,
      DATE_TRUNC('week', ta.assigned_at)::DATE AS week_start,
      COUNT(ta.assignment_id) AS tasks_assigned,
      COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS tasks_completed,
      COUNT(CASE WHEN ta.status = 'rejected' THEN 1 END) AS tasks_rejected,
      COUNT(CASE WHEN ta.status = 'overdue' THEN 1 END) AS tasks_overdue,
      ROUND(
        CASE 
          WHEN COUNT(ta.assignment_id) > 0 
          THEN (COUNT(CASE WHEN ta.status = 'approved' THEN 1 END)::NUMERIC / COUNT(ta.assignment_id)) * 100 
          ELSE 0 
        END, 2
      ) AS completion_rate
    FROM task_assignments ta
    INNER JOIN tasks t ON ta.task_id = t.task_id
    WHERE t.family_id = $1
    GROUP BY TO_CHAR(ta.assigned_at, 'IYYY-IW'), DATE_TRUNC('week', ta.assigned_at)
    ORDER BY week DESC
    LIMIT $2
  `;
  
  const result = await pool.query(query, [family_id, weeks]);
  return result.rows;
};

/**
 * Get task efficiency metrics (assignments per task)
 */
const getTaskEfficiencyMetrics = async (family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 't.created_at');
  
  const query = `
    WITH task_metrics AS (
      SELECT 
        t.task_id,
        t.title,
        COUNT(ta.assignment_id) AS assignment_count,
        COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS completion_count
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
      WHERE t.family_id = $1
        ${dateFilter}
      GROUP BY t.task_id, t.title
    )
    SELECT 
      COUNT(*) AS total_tasks,
      ROUND(AVG(assignment_count)::NUMERIC, 2) AS avg_assignments_per_task,
      MAX(assignment_count) AS max_assignments_per_task,
      ROUND(AVG(
        CASE WHEN assignment_count > 0 
        THEN (completion_count::NUMERIC / assignment_count) * 100 
        ELSE 0 END
      )::NUMERIC, 2) AS avg_task_success_rate,
      COUNT(CASE WHEN assignment_count = 0 THEN 1 END) AS unassigned_tasks,
      COUNT(CASE WHEN completion_count = 0 AND assignment_count > 0 THEN 1 END) AS tasks_with_no_completions
    FROM task_metrics
  `;
  
  const result = await pool.query(query, [family_id]);
  return result.rows[0];
};

/**
 * Get tasks with low completion rates (need attention)
 */
const getTasksNeedingAttention = async (family_id, threshold = 50, limit = 10) => {
  const query = `
    SELECT 
      t.task_id,
      t.title,
      t.category,
      t.priority,
      COUNT(ta.assignment_id) AS times_assigned,
      COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS times_completed,
      COUNT(CASE WHEN ta.status = 'rejected' THEN 1 END) AS times_rejected,
      ROUND(
        CASE 
          WHEN COUNT(ta.assignment_id) > 0 
          THEN (COUNT(CASE WHEN ta.status = 'approved' THEN 1 END)::NUMERIC / COUNT(ta.assignment_id)) * 100 
          ELSE 0 
        END, 2
      ) AS completion_rate
    FROM tasks t
    INNER JOIN task_assignments ta ON t.task_id = ta.task_id
    WHERE t.family_id = $1 AND t.status = 'active'
    GROUP BY t.task_id, t.title, t.category, t.priority
    HAVING COUNT(ta.assignment_id) >= 3
      AND ROUND(
        CASE 
          WHEN COUNT(ta.assignment_id) > 0 
          THEN (COUNT(CASE WHEN ta.status = 'approved' THEN 1 END)::NUMERIC / COUNT(ta.assignment_id)) * 100 
          ELSE 0 
        END, 2
      ) < $2
    ORDER BY completion_rate ASC
    LIMIT $3
  `;
  
  const result = await pool.query(query, [family_id, threshold, limit]);
  return result.rows;
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
  getTaskAnalyticsOverview,
  getTasksByCategory,
  getTasksByPriority,
  getMostAssignedTasks,
  getTaskStatusDistribution,
  getRecurringVsOneTimeComparison,
  getPhotoRequiredComparison,
  getDailyTaskCreationTrend,
  getWeeklyTaskCompletionTrend,
  getTaskEfficiencyMetrics,
  getTasksNeedingAttention
};
