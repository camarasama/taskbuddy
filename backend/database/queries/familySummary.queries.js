// ============================================================================
// Family Summary Queries
// Optimized SQL queries for family activity summaries
// Author: Souleymane Camara - BIT1007326
// ============================================================================

const pool = require('../../config/database');

/**
 * Get comprehensive family information
 */
const getFamilyInformation = async (family_id) => {
  const query = `
    SELECT 
      f.family_id,
      f.family_name,
      f.family_code,
      f.is_active,
      f.created_at,
      u.full_name AS created_by_name,
      u.email AS created_by_email,
      
      -- Member counts
      COUNT(DISTINCT fm.member_id) AS total_members,
      COUNT(DISTINCT CASE WHEN u_members.role = 'parent' THEN fm.member_id END) AS parents_count,
      COUNT(DISTINCT CASE WHEN u_members.role = 'spouse' THEN fm.member_id END) AS spouses_count,
      COUNT(DISTINCT CASE WHEN u_members.role = 'child' THEN fm.member_id END) AS children_count,
      
      -- Points summary
      SUM(CASE WHEN u_members.role = 'child' THEN fm.points_balance ELSE 0 END) AS total_family_points,
      ROUND(AVG(CASE WHEN u_members.role = 'child' THEN fm.points_balance END)::NUMERIC, 2) AS avg_child_points,
      MAX(CASE WHEN u_members.role = 'child' THEN fm.points_balance END) AS highest_child_points,
      
      -- Activity dates
      EXTRACT(DAY FROM (CURRENT_TIMESTAMP - f.created_at)) AS days_since_creation
      
    FROM families f
    INNER JOIN users u ON f.created_by = u.user_id
    LEFT JOIN family_members fm ON f.family_id = fm.family_id
    LEFT JOIN users u_members ON fm.user_id = u_members.user_id
    WHERE f.family_id = $1
    GROUP BY f.family_id, f.family_name, f.family_code, f.is_active, 
             f.created_at, u.full_name, u.email
  `;
  
  const result = await pool.query(query, [family_id]);
  return result.rows[0];
};

/**
 * Get family activity statistics
 */
const getFamilyActivityStats = async (family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 't.created_at');
  
  const query = `
    SELECT 
      -- Task statistics
      COUNT(DISTINCT t.task_id) AS total_tasks_created,
      COUNT(DISTINCT CASE WHEN t.status = 'active' THEN t.task_id END) AS active_tasks,
      COUNT(DISTINCT CASE WHEN t.is_recurring THEN t.task_id END) AS recurring_tasks,
      
      -- Assignment statistics
      COUNT(DISTINCT ta.assignment_id) AS total_assignments,
      COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END) AS completed_tasks,
      COUNT(DISTINCT CASE WHEN ta.status = 'pending' THEN ta.assignment_id END) AS pending_tasks,
      COUNT(DISTINCT CASE WHEN ta.status = 'overdue' THEN ta.assignment_id END) AS overdue_tasks,
      
      -- Completion rate
      ROUND(
        CASE 
          WHEN COUNT(DISTINCT ta.assignment_id) > 0 
          THEN (COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END)::NUMERIC / 
                COUNT(DISTINCT ta.assignment_id)) * 100 
          ELSE 0 
        END, 2
      ) AS overall_completion_rate,
      
      -- Reward statistics
      COUNT(DISTINCT r.reward_id) AS total_rewards_available,
      COUNT(DISTINCT CASE WHEN r.status = 'available' THEN r.reward_id END) AS active_rewards,
      COUNT(DISTINCT rr.redemption_id) AS total_redemption_requests,
      COUNT(DISTINCT CASE WHEN rr.status = 'approved' THEN rr.redemption_id END) AS approved_redemptions,
      
      -- Points flow
      SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END) AS total_points_earned,
      SUM(CASE WHEN rr.status = 'approved' THEN rr.points_spent ELSE 0 END) AS total_points_spent,
      SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END) - 
      SUM(CASE WHEN rr.status = 'approved' THEN rr.points_spent ELSE 0 END) AS net_points_change,
      
      -- Activity metrics
      COUNT(DISTINCT DATE(t.created_at)) AS days_with_task_creation,
      COUNT(DISTINCT DATE(ta.completed_at)) AS days_with_completions,
      COUNT(DISTINCT DATE(rr.requested_at)) AS days_with_redemptions
      
    FROM families f
    LEFT JOIN tasks t ON f.family_id = t.family_id ${dateFilter}
    LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
    LEFT JOIN rewards r ON f.family_id = r.family_id
    LEFT JOIN reward_redemptions rr ON r.reward_id = rr.reward_id
    WHERE f.family_id = $1
    GROUP BY f.family_id
  `;
  
  const result = await pool.query(query, [family_id]);
  return result.rows[0];
};

/**
 * Get all family members with their statistics
 */
const getFamilyMembers = async (family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 'ta.assigned_at');
  
  const query = `
    SELECT 
      u.user_id,
      u.full_name,
      u.email,
      u.role,
      u.profile_picture,
      u.date_of_birth,
      fm.relationship,
      fm.points_balance,
      fm.joined_at,
      fm.is_active,
      
      -- For children: task statistics
      CASE WHEN u.role = 'child' THEN
        COUNT(DISTINCT ta.assignment_id)
      ELSE 0 END AS tasks_assigned,
      
      CASE WHEN u.role = 'child' THEN
        COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END)
      ELSE 0 END AS tasks_completed,
      
      CASE WHEN u.role = 'child' THEN
        ROUND(
          CASE 
            WHEN COUNT(DISTINCT ta.assignment_id) > 0 
            THEN (COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END)::NUMERIC / 
                  COUNT(DISTINCT ta.assignment_id)) * 100 
            ELSE 0 
          END, 2
        )
      ELSE 0 END AS completion_rate,
      
      -- For parents/spouses: creation statistics
      CASE WHEN u.role IN ('parent', 'spouse') THEN
        COUNT(DISTINCT t_created.task_id)
      ELSE 0 END AS tasks_created,
      
      CASE WHEN u.role IN ('parent', 'spouse') THEN
        COUNT(DISTINCT r_created.reward_id)
      ELSE 0 END AS rewards_created
      
    FROM family_members fm
    INNER JOIN users u ON fm.user_id = u.user_id
    LEFT JOIN task_assignments ta ON u.user_id = ta.assigned_to AND u.role = 'child' ${dateFilter}
    LEFT JOIN tasks t_created ON u.user_id = t_created.created_by AND t_created.family_id = $1
    LEFT JOIN rewards r_created ON u.user_id = r_created.created_by AND r_created.family_id = $1
    WHERE fm.family_id = $1
    GROUP BY u.user_id, u.full_name, u.email, u.role, u.profile_picture, 
             u.date_of_birth, fm.relationship, fm.points_balance, fm.joined_at, fm.is_active
    ORDER BY u.role, u.full_name
  `;
  
  const result = await pool.query(query, [family_id]);
  return result.rows;
};

/**
 * Get top performing children
 */
const getTopPerformingChildren = async (family_id, start_date = null, end_date = null, limit = 5) => {
  const dateFilter = buildDateFilter(start_date, end_date, 'ta.assigned_at');
  
  const query = `
    SELECT 
      u.user_id,
      u.full_name,
      u.profile_picture,
      fm.points_balance,
      COUNT(ta.assignment_id) AS tasks_assigned,
      COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS tasks_completed,
      COUNT(CASE WHEN ta.status = 'rejected' THEN 1 END) AS tasks_rejected,
      SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END) AS points_earned,
      ROUND(
        CASE 
          WHEN COUNT(ta.assignment_id) > 0 
          THEN (COUNT(CASE WHEN ta.status = 'approved' THEN 1 END)::NUMERIC / COUNT(ta.assignment_id)) * 100 
          ELSE 0 
        END, 2
      ) AS completion_rate
    FROM users u
    INNER JOIN family_members fm ON u.user_id = fm.user_id
    LEFT JOIN task_assignments ta ON u.user_id = ta.assigned_to ${dateFilter}
    LEFT JOIN tasks t ON ta.task_id = t.task_id
    WHERE fm.family_id = $1 AND u.role = 'child'
    GROUP BY u.user_id, u.full_name, u.profile_picture, fm.points_balance
    HAVING COUNT(ta.assignment_id) > 0
    ORDER BY tasks_completed DESC, completion_rate DESC, points_earned DESC
    LIMIT $2
  `;
  
  const result = await pool.query(query, [family_id, limit]);
  return result.rows;
};

/**
 * Get recent family activity (timeline of events)
 */
const getRecentFamilyActivity = async (family_id, limit = 20) => {
  const query = `
    -- Task completions
    SELECT 
      'task_completed' AS activity_type,
      t.title AS description,
      u_child.full_name AS actor_name,
      u_child.user_id AS actor_id,
      ta.completed_at AS activity_date,
      t.points_reward AS points_involved,
      NULL AS additional_info
    FROM task_assignments ta
    INNER JOIN tasks t ON ta.task_id = t.task_id
    INNER JOIN users u_child ON ta.assigned_to = u_child.user_id
    WHERE t.family_id = $1 AND ta.status = 'approved' AND ta.completed_at IS NOT NULL
    
    UNION ALL
    
    -- Task assignments
    SELECT 
      'task_assigned' AS activity_type,
      t.title AS description,
      u_parent.full_name AS actor_name,
      u_parent.user_id AS actor_id,
      ta.assigned_at AS activity_date,
      t.points_reward AS points_involved,
      u_child.full_name AS additional_info
    FROM task_assignments ta
    INNER JOIN tasks t ON ta.task_id = t.task_id
    INNER JOIN users u_parent ON ta.assigned_by = u_parent.user_id
    INNER JOIN users u_child ON ta.assigned_to = u_child.user_id
    WHERE t.family_id = $1
    
    UNION ALL
    
    -- Reward redemptions
    SELECT 
      'reward_redeemed' AS activity_type,
      r.reward_name AS description,
      u_child.full_name AS actor_name,
      u_child.user_id AS actor_id,
      rr.requested_at AS activity_date,
      rr.points_spent AS points_involved,
      rr.status AS additional_info
    FROM reward_redemptions rr
    INNER JOIN rewards r ON rr.reward_id = r.reward_id
    INNER JOIN users u_child ON rr.child_id = u_child.user_id
    WHERE rr.family_id = $1 AND rr.status = 'approved'
    
    UNION ALL
    
    -- Task creations
    SELECT 
      'task_created' AS activity_type,
      t.title AS description,
      u_parent.full_name AS actor_name,
      u_parent.user_id AS actor_id,
      t.created_at AS activity_date,
      t.points_reward AS points_involved,
      t.category AS additional_info
    FROM tasks t
    INNER JOIN users u_parent ON t.created_by = u_parent.user_id
    WHERE t.family_id = $1
    
    UNION ALL
    
    -- Reward creations
    SELECT 
      'reward_created' AS activity_type,
      r.reward_name AS description,
      u_parent.full_name AS actor_name,
      u_parent.user_id AS actor_id,
      r.created_at AS activity_date,
      r.points_required AS points_involved,
      NULL AS additional_info
    FROM rewards r
    INNER JOIN users u_parent ON r.created_by = u_parent.user_id
    WHERE r.family_id = $1
    
    ORDER BY activity_date DESC
    LIMIT $2
  `;
  
  const result = await pool.query(query, [family_id, limit]);
  return result.rows;
};

/**
 * Get family weekly activity trend
 */
const getFamilyWeeklyTrend = async (family_id, start_date = null, end_date = null, weeks = 12) => {
  const dateFilter = buildDateFilter(start_date, end_date, 'ta.assigned_at');
  
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
    WHERE t.family_id = $1
      ${dateFilter}
    GROUP BY TO_CHAR(ta.assigned_at, 'IYYY-IW'), DATE_TRUNC('week', ta.assigned_at)
    ORDER BY week DESC
    LIMIT $2
  `;
  
  const result = await pool.query(query, [family_id, weeks]);
  return result.rows;
};

/**
 * Get family monthly trend
 */
const getFamilyMonthlyTrend = async (family_id, months = 6) => {
  const query = `
    SELECT 
      TO_CHAR(ta.assigned_at, 'YYYY-MM') AS month,
      TO_CHAR(ta.assigned_at, 'Mon YYYY') AS month_name,
      COUNT(ta.assignment_id) AS tasks_assigned,
      COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS tasks_completed,
      SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END) AS points_earned,
      COUNT(DISTINCT ta.assigned_to) AS active_children
    FROM task_assignments ta
    INNER JOIN tasks t ON ta.task_id = t.task_id
    WHERE t.family_id = $1
    GROUP BY TO_CHAR(ta.assigned_at, 'YYYY-MM'), TO_CHAR(ta.assigned_at, 'Mon YYYY')
    ORDER BY month DESC
    LIMIT $2
  `;
  
  const result = await pool.query(query, [family_id, months]);
  return result.rows;
};

/**
 * Get family engagement score components
 */
const getFamilyEngagementMetrics = async (family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 't.created_at');
  
  const query = `
    SELECT 
      -- Task creation activity
      COUNT(DISTINCT t.task_id) AS tasks_created,
      COUNT(DISTINCT t.created_by) AS active_parents,
      COUNT(DISTINCT DATE(t.created_at)) AS days_with_task_creation,
      
      -- Task completion activity
      COUNT(DISTINCT ta.assignment_id) AS total_assignments,
      COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END) AS completed_assignments,
      COUNT(DISTINCT ta.assigned_to) AS active_children,
      COUNT(DISTINCT DATE(ta.completed_at)) AS days_with_completions,
      
      -- Reward activity
      COUNT(DISTINCT r.reward_id) AS rewards_created,
      COUNT(DISTINCT rr.redemption_id) AS redemption_requests,
      COUNT(DISTINCT DATE(rr.requested_at)) AS days_with_redemptions,
      
      -- Overall engagement days
      COUNT(DISTINCT DATE(t.created_at)) + 
      COUNT(DISTINCT DATE(ta.completed_at)) + 
      COUNT(DISTINCT DATE(rr.requested_at)) AS total_engagement_days,
      
      -- Average daily activity
      ROUND(
        (COUNT(DISTINCT ta.assignment_id)::NUMERIC / 
         NULLIF(EXTRACT(DAY FROM (CURRENT_DATE - MIN(t.created_at))), 0)
        ), 2
      ) AS avg_assignments_per_day
      
    FROM families f
    LEFT JOIN tasks t ON f.family_id = t.family_id ${dateFilter}
    LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
    LEFT JOIN rewards r ON f.family_id = r.family_id
    LEFT JOIN reward_redemptions rr ON r.reward_id = rr.reward_id
    WHERE f.family_id = $1
    GROUP BY f.family_id
  `;
  
  const result = await pool.query(query, [family_id]);
  return result.rows[0];
};

/**
 * Get family comparison with platform averages (if multiple families)
 */
const getFamilyComparison = async (family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 't.created_at');
  
  const query = `
    WITH family_stats AS (
      SELECT 
        COUNT(DISTINCT ta.assignment_id) AS assignments,
        COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END) AS completions,
        ROUND(
          CASE 
            WHEN COUNT(DISTINCT ta.assignment_id) > 0 
            THEN (COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END)::NUMERIC / 
                  COUNT(DISTINCT ta.assignment_id)) * 100 
            ELSE 0 
          END, 2
        ) AS completion_rate
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
      WHERE t.family_id = $1
        ${dateFilter}
    ),
    platform_avg AS (
      SELECT 
        ROUND(AVG(
          CASE 
            WHEN COUNT(DISTINCT ta.assignment_id) > 0 
            THEN (COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END)::NUMERIC / 
                  COUNT(DISTINCT ta.assignment_id)) * 100 
            ELSE 0 
          END
        )::NUMERIC, 2) AS avg_completion_rate,
        ROUND(AVG(COUNT(DISTINCT ta.assignment_id))::NUMERIC, 0) AS avg_assignments
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
      ${dateFilter}
      GROUP BY t.family_id
    )
    SELECT 
      fs.assignments AS family_assignments,
      fs.completions AS family_completions,
      fs.completion_rate AS family_completion_rate,
      pa.avg_assignments AS platform_avg_assignments,
      pa.avg_completion_rate AS platform_avg_completion_rate,
      fs.assignments - pa.avg_assignments AS assignments_difference,
      fs.completion_rate - pa.avg_completion_rate AS completion_rate_difference
    FROM family_stats fs, platform_avg pa
  `;
  
  const result = await pool.query(query, [family_id]);
  return result.rows[0];
};

/**
 * Get family achievements and milestones
 */
const getFamilyAchievements = async (family_id) => {
  const query = `
    SELECT 
      -- Total achievements
      (SELECT COUNT(*) FROM task_assignments ta 
       INNER JOIN tasks t ON ta.task_id = t.task_id 
       WHERE t.family_id = $1 AND ta.status = 'approved') AS total_tasks_completed,
      
      (SELECT COUNT(*) FROM reward_redemptions rr 
       WHERE rr.family_id = $1 AND rr.status = 'approved') AS total_rewards_redeemed,
      
      -- Points milestone
      (SELECT SUM(fm.points_balance) FROM family_members fm 
       INNER JOIN users u ON fm.user_id = u.user_id 
       WHERE fm.family_id = $1 AND u.role = 'child') AS total_family_points,
      
      -- Longest streak (consecutive days with completions)
      (SELECT MAX(streak_length) FROM (
        SELECT 
          completion_date,
          ROW_NUMBER() OVER (ORDER BY completion_date) - 
          ROW_NUMBER() OVER (PARTITION BY completion_date - 
            (ROW_NUMBER() OVER (ORDER BY completion_date))::INTEGER * INTERVAL '1 day' 
            ORDER BY completion_date) AS streak_group,
          COUNT(*) OVER (PARTITION BY completion_date - 
            (ROW_NUMBER() OVER (ORDER BY completion_date))::INTEGER * INTERVAL '1 day') AS streak_length
        FROM (
          SELECT DISTINCT DATE(ta.completed_at) AS completion_date
          FROM task_assignments ta
          INNER JOIN tasks t ON ta.task_id = t.task_id
          WHERE t.family_id = $1 AND ta.status = 'approved'
          ORDER BY completion_date
        ) dates
      ) streaks) AS longest_streak_days,
      
      -- Most productive day
      (SELECT DATE(ta.completed_at) 
       FROM task_assignments ta
       INNER JOIN tasks t ON ta.task_id = t.task_id
       WHERE t.family_id = $1 AND ta.status = 'approved'
       GROUP BY DATE(ta.completed_at)
       ORDER BY COUNT(*) DESC
       LIMIT 1) AS most_productive_day,
      
      -- Most productive child
      (SELECT u.full_name
       FROM task_assignments ta
       INNER JOIN tasks t ON ta.task_id = t.task_id
       INNER JOIN users u ON ta.assigned_to = u.user_id
       WHERE t.family_id = $1 AND ta.status = 'approved'
       GROUP BY u.user_id, u.full_name
       ORDER BY COUNT(*) DESC
       LIMIT 1) AS most_productive_child
  `;
  
  const result = await pool.query(query, [family_id]);
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
  getFamilyInformation,
  getFamilyActivityStats,
  getFamilyMembers,
  getTopPerformingChildren,
  getRecentFamilyActivity,
  getFamilyWeeklyTrend,
  getFamilyMonthlyTrend,
  getFamilyEngagementMetrics,
  getFamilyComparison,
  getFamilyAchievements
};
