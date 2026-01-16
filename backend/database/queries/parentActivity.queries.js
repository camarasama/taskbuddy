// ============================================================================
// Parent Activity Queries
// Optimized SQL queries for parent/spouse activity analytics
// Author: Souleymane Camara - BIT1007326
// ============================================================================

const pool = require('../../config/database');

/**
 * Get comprehensive parent activity metrics
 */
const getParentActivityMetrics = async (parent_id, family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 't.created_at');
  
  const query = `
    SELECT 
      u.user_id,
      u.full_name,
      u.email,
      u.role,
      u.profile_picture,
      
      -- Task Creation Statistics
      COUNT(DISTINCT t.task_id) AS tasks_created,
      COUNT(DISTINCT CASE WHEN t.status = 'active' THEN t.task_id END) AS active_tasks_created,
      COUNT(DISTINCT CASE WHEN t.is_recurring THEN t.task_id END) AS recurring_tasks_created,
      COUNT(DISTINCT ta.assignment_id) AS tasks_assigned,
      
      -- Review Statistics
      COUNT(DISTINCT CASE WHEN ta.reviewed_by = u.user_id THEN ta.assignment_id END) AS tasks_reviewed,
      COUNT(DISTINCT CASE WHEN ta.reviewed_by = u.user_id AND ta.status = 'approved' THEN ta.assignment_id END) AS tasks_approved,
      COUNT(DISTINCT CASE WHEN ta.reviewed_by = u.user_id AND ta.status = 'rejected' THEN ta.assignment_id END) AS tasks_rejected,
      
      -- Approval Rate
      ROUND(
        CASE 
          WHEN COUNT(DISTINCT CASE WHEN ta.reviewed_by = u.user_id THEN ta.assignment_id END) > 0 
          THEN (COUNT(DISTINCT CASE WHEN ta.reviewed_by = u.user_id AND ta.status = 'approved' THEN ta.assignment_id END)::NUMERIC / 
                COUNT(DISTINCT CASE WHEN ta.reviewed_by = u.user_id THEN ta.assignment_id END)) * 100 
          ELSE 0 
        END, 2
      ) AS approval_rate,
      
      -- Average Review Time (in hours)
      ROUND(AVG(
        CASE 
          WHEN ta.reviewed_by = u.user_id AND ta.reviewed_at IS NOT NULL AND ta.completed_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (ta.reviewed_at - ta.completed_at))/3600 
        END
      )::NUMERIC, 2) AS avg_review_time_hours,
      
      -- Points Management
      SUM(CASE WHEN ta.status = 'approved' AND t.created_by = u.user_id THEN t.points_reward ELSE 0 END) AS points_distributed,
      ROUND(AVG(CASE WHEN t.created_by = u.user_id THEN t.points_reward END)::NUMERIC, 2) AS avg_points_per_task,
      
      -- Reward Management
      COUNT(DISTINCT r.reward_id) AS rewards_created,
      COUNT(DISTINCT CASE WHEN r.status = 'available' THEN r.reward_id END) AS active_rewards,
      COUNT(DISTINCT CASE WHEN rr.reviewed_by = u.user_id THEN rr.redemption_id END) AS redemptions_reviewed,
      COUNT(DISTINCT CASE WHEN rr.reviewed_by = u.user_id AND rr.status = 'approved' THEN rr.redemption_id END) AS redemptions_approved,
      COUNT(DISTINCT CASE WHEN rr.reviewed_by = u.user_id AND rr.status = 'denied' THEN rr.redemption_id END) AS redemptions_denied,
      
      -- Activity Metrics
      COUNT(DISTINCT DATE(t.created_at)) AS days_with_task_creation,
      COUNT(DISTINCT DATE(ta.reviewed_at)) FILTER (WHERE ta.reviewed_by = u.user_id) AS days_with_reviews,
      MIN(t.created_at) AS first_task_created,
      MAX(t.created_at) AS last_task_created
      
    FROM users u
    LEFT JOIN tasks t ON u.user_id = t.created_by AND t.family_id = $2 ${dateFilter}
    LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
    LEFT JOIN rewards r ON u.user_id = r.created_by AND r.family_id = $2
    LEFT JOIN reward_redemptions rr ON r.reward_id = rr.reward_id
    WHERE u.user_id = $1
      AND u.role IN ('parent', 'spouse')
    GROUP BY u.user_id, u.full_name, u.email, u.role, u.profile_picture
  `;
  
  const result = await pool.query(query, [parent_id, family_id]);
  return result.rows[0];
};

/**
 * Get parent's tasks by category
 */
const getParentTasksByCategory = async (parent_id, family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 't.created_at');
  
  const query = `
    SELECT 
      COALESCE(t.category, 'Uncategorized') AS category,
      COUNT(t.task_id) AS tasks_created,
      COUNT(DISTINCT ta.assignment_id) AS times_assigned,
      COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS times_completed,
      SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END) AS points_awarded,
      ROUND(
        CASE 
          WHEN COUNT(ta.assignment_id) > 0 
          THEN (COUNT(CASE WHEN ta.status = 'approved' THEN 1 END)::NUMERIC / COUNT(ta.assignment_id)) * 100 
          ELSE 0 
        END, 2
      ) AS success_rate
    FROM tasks t
    LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
    WHERE t.created_by = $1 AND t.family_id = $2
      ${dateFilter}
    GROUP BY t.category
    ORDER BY tasks_created DESC
  `;
  
  const result = await pool.query(query, [parent_id, family_id]);
  return result.rows;
};

/**
 * Get parent's tasks by priority
 */
const getParentTasksByPriority = async (parent_id, family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 't.created_at');
  
  const query = `
    SELECT 
      t.priority,
      COUNT(t.task_id) AS tasks_created,
      COUNT(DISTINCT ta.assignment_id) AS times_assigned,
      COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS times_completed,
      ROUND(AVG(t.points_reward)::NUMERIC, 2) AS avg_points
    FROM tasks t
    LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
    WHERE t.created_by = $1 AND t.family_id = $2
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
  
  const result = await pool.query(query, [parent_id, family_id]);
  return result.rows;
};

/**
 * Get parent's recent actions (timeline)
 */
const getParentRecentActions = async (parent_id, family_id, limit = 20) => {
  const query = `
    -- Task creations
    SELECT 
      'task_created' AS action_type,
      t.title AS description,
      t.category AS category,
      t.points_reward AS points_involved,
      t.created_at AS action_date,
      NULL AS target_user
    FROM tasks t
    WHERE t.created_by = $1 AND t.family_id = $2
    
    UNION ALL
    
    -- Task assignments
    SELECT 
      'task_assigned' AS action_type,
      t.title AS description,
      t.category AS category,
      t.points_reward AS points_involved,
      ta.assigned_at AS action_date,
      u.full_name AS target_user
    FROM task_assignments ta
    INNER JOIN tasks t ON ta.task_id = t.task_id
    INNER JOIN users u ON ta.assigned_to = u.user_id
    WHERE ta.assigned_by = $1 AND t.family_id = $2
    
    UNION ALL
    
    -- Task reviews
    SELECT 
      CASE WHEN ta.status = 'approved' THEN 'task_approved' ELSE 'task_rejected' END AS action_type,
      t.title AS description,
      t.category AS category,
      t.points_reward AS points_involved,
      ta.reviewed_at AS action_date,
      u.full_name AS target_user
    FROM task_assignments ta
    INNER JOIN tasks t ON ta.task_id = t.task_id
    INNER JOIN users u ON ta.assigned_to = u.user_id
    WHERE ta.reviewed_by = $1 AND t.family_id = $2 AND ta.status IN ('approved', 'rejected')
    
    UNION ALL
    
    -- Reward creations
    SELECT 
      'reward_created' AS action_type,
      r.reward_name AS description,
      NULL AS category,
      r.points_required AS points_involved,
      r.created_at AS action_date,
      NULL AS target_user
    FROM rewards r
    WHERE r.created_by = $1 AND r.family_id = $2
    
    UNION ALL
    
    -- Reward redemption reviews
    SELECT 
      CASE WHEN rr.status = 'approved' THEN 'redemption_approved' ELSE 'redemption_denied' END AS action_type,
      r.reward_name AS description,
      NULL AS category,
      rr.points_spent AS points_involved,
      rr.reviewed_at AS action_date,
      u.full_name AS target_user
    FROM reward_redemptions rr
    INNER JOIN rewards r ON rr.reward_id = r.reward_id
    INNER JOIN users u ON rr.child_id = u.user_id
    WHERE rr.reviewed_by = $1 AND rr.family_id = $2 AND rr.status IN ('approved', 'denied')
    
    ORDER BY action_date DESC
    LIMIT $3
  `;
  
  const result = await pool.query(query, [parent_id, family_id, limit]);
  return result.rows;
};

/**
 * Get parent's review performance by child
 */
const getParentReviewsByChild = async (parent_id, family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 'ta.reviewed_at');
  
  const query = `
    SELECT 
      u.user_id AS child_id,
      u.full_name AS child_name,
      COUNT(ta.assignment_id) AS reviews_completed,
      COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS approved_count,
      COUNT(CASE WHEN ta.status = 'rejected' THEN 1 END) AS rejected_count,
      ROUND(
        CASE 
          WHEN COUNT(ta.assignment_id) > 0 
          THEN (COUNT(CASE WHEN ta.status = 'approved' THEN 1 END)::NUMERIC / COUNT(ta.assignment_id)) * 100 
          ELSE 0 
        END, 2
      ) AS approval_rate,
      ROUND(AVG(
        CASE 
          WHEN ta.reviewed_at IS NOT NULL AND ta.completed_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (ta.reviewed_at - ta.completed_at))/3600 
        END
      )::NUMERIC, 2) AS avg_review_time_hours
    FROM task_assignments ta
    INNER JOIN tasks t ON ta.task_id = t.task_id
    INNER JOIN users u ON ta.assigned_to = u.user_id
    WHERE ta.reviewed_by = $1 
      AND t.family_id = $2
      AND ta.status IN ('approved', 'rejected')
      ${dateFilter}
    GROUP BY u.user_id, u.full_name
    ORDER BY reviews_completed DESC
  `;
  
  const result = await pool.query(query, [parent_id, family_id]);
  return result.rows;
};

/**
 * Get parent's daily activity pattern
 */
const getParentDailyActivity = async (parent_id, family_id, days = 30) => {
  const query = `
    WITH daily_activities AS (
      -- Task creations
      SELECT DATE(created_at) AS activity_date, COUNT(*) AS tasks_created, 0 AS reviews_done
      FROM tasks
      WHERE created_by = $1 AND family_id = $2
        AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      
      UNION ALL
      
      -- Reviews
      SELECT DATE(ta.reviewed_at) AS activity_date, 0 AS tasks_created, COUNT(*) AS reviews_done
      FROM task_assignments ta
      INNER JOIN tasks t ON ta.task_id = t.task_id
      WHERE ta.reviewed_by = $1 
        AND t.family_id = $2
        AND ta.reviewed_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(ta.reviewed_at)
    )
    SELECT 
      activity_date,
      SUM(tasks_created) AS tasks_created,
      SUM(reviews_done) AS reviews_completed,
      SUM(tasks_created) + SUM(reviews_done) AS total_actions
    FROM daily_activities
    GROUP BY activity_date
    ORDER BY activity_date DESC
  `;
  
  const result = await pool.query(query, [parent_id, family_id]);
  return result.rows;
};

/**
 * Get parent's weekly activity trend
 */
const getParentWeeklyActivity = async (parent_id, family_id, weeks = 12) => {
  const query = `
    SELECT 
      TO_CHAR(t.created_at, 'IYYY-IW') AS week,
      DATE_TRUNC('week', t.created_at)::DATE AS week_start,
      COUNT(DISTINCT t.task_id) AS tasks_created,
      COUNT(DISTINCT ta.assignment_id) AS tasks_assigned,
      COUNT(DISTINCT CASE WHEN ta.reviewed_by = $1 THEN ta.assignment_id END) AS tasks_reviewed
    FROM tasks t
    LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
    WHERE t.created_by = $1 AND t.family_id = $2
    GROUP BY TO_CHAR(t.created_at, 'IYYY-IW'), DATE_TRUNC('week', t.created_at)
    ORDER BY week DESC
    LIMIT $3
  `;
  
  const result = await pool.query(query, [parent_id, family_id, weeks]);
  return result.rows;
};

/**
 * Get parent's task effectiveness (tasks that get completed)
 */
const getParentTaskEffectiveness = async (parent_id, family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 't.created_at');
  
  const query = `
    SELECT 
      t.task_id,
      t.title,
      t.category,
      t.priority,
      t.points_reward,
      COUNT(ta.assignment_id) AS times_assigned,
      COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS times_completed,
      COUNT(CASE WHEN ta.status = 'rejected' THEN 1 END) AS times_rejected,
      COUNT(CASE WHEN ta.status = 'overdue' THEN 1 END) AS times_overdue,
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
      )::NUMERIC, 2) AS avg_completion_time_hours
    FROM tasks t
    LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
    WHERE t.created_by = $1 AND t.family_id = $2
      ${dateFilter}
    GROUP BY t.task_id, t.title, t.category, t.priority, t.points_reward
    HAVING COUNT(ta.assignment_id) > 0
    ORDER BY completion_rate DESC, times_completed DESC
  `;
  
  const result = await pool.query(query, [parent_id, family_id]);
  return result.rows;
};

/**
 * Get parent's collaboration with other parents
 */
const getParentCollaboration = async (parent_id, family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 't.created_at');
  
  const query = `
    SELECT 
      u.user_id AS other_parent_id,
      u.full_name AS other_parent_name,
      u.role AS other_parent_role,
      
      -- Tasks created by other parent
      COUNT(DISTINCT t_other.task_id) AS their_tasks_created,
      
      -- Reviews done by this parent on other parent's tasks
      COUNT(DISTINCT CASE WHEN ta.reviewed_by = $1 THEN ta.assignment_id END) AS reviews_on_their_tasks,
      
      -- Reviews done by other parent on this parent's tasks
      COUNT(DISTINCT CASE WHEN ta.reviewed_by = u.user_id THEN ta.assignment_id END) AS their_reviews_on_my_tasks
      
    FROM users u
    LEFT JOIN tasks t_other ON u.user_id = t_other.created_by AND t_other.family_id = $2 ${dateFilter}
    LEFT JOIN task_assignments ta ON t_other.task_id = ta.task_id
    LEFT JOIN tasks t_mine ON t_mine.created_by = $1 AND t_mine.family_id = $2
    WHERE u.user_id != $1 
      AND u.role IN ('parent', 'spouse')
      AND EXISTS (
        SELECT 1 FROM family_members fm 
        WHERE fm.user_id = u.user_id AND fm.family_id = $2
      )
    GROUP BY u.user_id, u.full_name, u.role
  `;
  
  const result = await pool.query(query, [parent_id, family_id]);
  return result.rows;
};

/**
 * Get parent's reward management stats
 */
const getParentRewardManagement = async (parent_id, family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 'r.created_at');
  
  const query = `
    SELECT 
      r.reward_id,
      r.reward_name,
      r.points_required,
      r.quantity_available,
      r.quantity_redeemed,
      r.status,
      r.created_at,
      COUNT(rr.redemption_id) AS redemption_requests,
      COUNT(CASE WHEN rr.status = 'approved' THEN 1 END) AS approved_requests,
      COUNT(CASE WHEN rr.status = 'denied' THEN 1 END) AS denied_requests,
      COUNT(CASE WHEN rr.status = 'pending' THEN 1 END) AS pending_requests,
      SUM(CASE WHEN rr.status = 'approved' THEN rr.points_spent ELSE 0 END) AS total_points_spent
    FROM rewards r
    LEFT JOIN reward_redemptions rr ON r.reward_id = rr.reward_id
    WHERE r.created_by = $1 AND r.family_id = $2
      ${dateFilter}
    GROUP BY r.reward_id, r.reward_name, r.points_required, r.quantity_available, 
             r.quantity_redeemed, r.status, r.created_at
    ORDER BY redemption_requests DESC
  `;
  
  const result = await pool.query(query, [parent_id, family_id]);
  return result.rows;
};

/**
 * Get parent's responsiveness metrics
 */
const getParentResponsiveness = async (parent_id, family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 'ta.completed_at');
  
  const query = `
    SELECT 
      -- Overall responsiveness
      COUNT(ta.assignment_id) AS total_submissions_to_review,
      COUNT(CASE WHEN ta.reviewed_by = $1 THEN 1 END) AS reviewed_by_this_parent,
      
      -- Review time statistics
      ROUND(AVG(
        CASE 
          WHEN ta.reviewed_by = $1 AND ta.reviewed_at IS NOT NULL AND ta.completed_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (ta.reviewed_at - ta.completed_at))/3600 
        END
      )::NUMERIC, 2) AS avg_review_time_hours,
      
      ROUND(MIN(
        CASE 
          WHEN ta.reviewed_by = $1 AND ta.reviewed_at IS NOT NULL AND ta.completed_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (ta.reviewed_at - ta.completed_at))/3600 
        END
      )::NUMERIC, 2) AS fastest_review_hours,
      
      ROUND(MAX(
        CASE 
          WHEN ta.reviewed_by = $1 AND ta.reviewed_at IS NOT NULL AND ta.completed_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (ta.reviewed_at - ta.completed_at))/3600 
        END
      )::NUMERIC, 2) AS slowest_review_hours,
      
      -- Reviews within 24 hours
      COUNT(CASE 
        WHEN ta.reviewed_by = $1 
        AND ta.reviewed_at IS NOT NULL 
        AND ta.completed_at IS NOT NULL
        AND EXTRACT(EPOCH FROM (ta.reviewed_at - ta.completed_at))/3600 <= 24
        THEN 1 
      END) AS reviews_within_24h,
      
      -- Pending reviews
      COUNT(CASE WHEN ta.status = 'pending_review' THEN 1 END) AS currently_pending_reviews
      
    FROM task_assignments ta
    INNER JOIN tasks t ON ta.task_id = t.task_id
    WHERE t.family_id = $2
      AND ta.status IN ('approved', 'rejected', 'pending_review')
      ${dateFilter}
  `;
  
  const result = await pool.query(query, [parent_id, family_id]);
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
  getParentActivityMetrics,
  getParentTasksByCategory,
  getParentTasksByPriority,
  getParentRecentActions,
  getParentReviewsByChild,
  getParentDailyActivity,
  getParentWeeklyActivity,
  getParentTaskEffectiveness,
  getParentCollaboration,
  getParentRewardManagement,
  getParentResponsiveness
};
