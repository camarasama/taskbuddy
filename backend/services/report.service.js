// ============================================================================
// Report Service
// Advanced report generation for TaskBuddy analytics
// Author: Souleymane Camara - BIT1007326
// ============================================================================

const pool = require('../config/database');

class ReportService {
  
  // ==========================================================================
  // CHILD PERFORMANCE REPORT
  // ==========================================================================
  
  /**
   * Generate comprehensive child performance report
   * @param {Object} params - { child_id, family_id, start_date, end_date }
   * @returns {Object} - Performance report data
   */
  async generateChildPerformanceReport(params) {
    const { child_id, family_id, start_date, end_date } = params;
    
    try {
      // Build date filter
      const dateFilter = this._buildDateFilter(start_date, end_date, 'ta.assigned_at');
      
      const query = `
        SELECT 
          u.user_id,
          u.full_name,
          u.profile_picture,
          fm.points_balance AS current_points,
          
          -- Task Statistics
          COUNT(DISTINCT ta.assignment_id) AS total_tasks_assigned,
          COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END) AS tasks_completed,
          COUNT(DISTINCT CASE WHEN ta.status = 'rejected' THEN ta.assignment_id END) AS tasks_rejected,
          COUNT(DISTINCT CASE WHEN ta.status = 'pending' THEN ta.assignment_id END) AS tasks_pending,
          COUNT(DISTINCT CASE WHEN ta.status = 'in_progress' THEN ta.assignment_id END) AS tasks_in_progress,
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
          
          -- Points Statistics
          COALESCE(SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END), 0) AS total_points_earned,
          COALESCE(AVG(CASE WHEN ta.status = 'approved' THEN t.points_reward END), 0) AS avg_points_per_task,
          
          -- Time Statistics
          CASE 
            WHEN COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END) > 0
            THEN AVG(
              CASE 
                WHEN ta.status = 'approved' AND ta.completed_at IS NOT NULL 
                THEN EXTRACT(EPOCH FROM (ta.completed_at - ta.assigned_at))/3600 
              END
            )
            ELSE 0 
          END AS avg_completion_time_hours,
          
          -- Category Performance
          json_agg(
            DISTINCT jsonb_build_object(
              'category', t.category,
              'count', COUNT(ta.assignment_id) FILTER (WHERE t.category IS NOT NULL)
            )
          ) FILTER (WHERE t.category IS NOT NULL) AS category_breakdown
          
        FROM users u
        INNER JOIN family_members fm ON u.user_id = fm.user_id
        LEFT JOIN task_assignments ta ON u.user_id = ta.assigned_to
        LEFT JOIN tasks t ON ta.task_id = t.task_id
        WHERE u.user_id = $1 
          AND fm.family_id = $2
          AND u.role = 'child'
          ${dateFilter}
        GROUP BY u.user_id, u.full_name, u.profile_picture, fm.points_balance
      `;
      
      const values = [child_id, family_id];
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Child not found or not a member of this family');
      }
      
      const childData = result.rows[0];
      
      // Get recent activity
      const recentActivity = await this._getChildRecentActivity(child_id, family_id);
      
      // Get task distribution by priority
      const priorityDistribution = await this._getTaskPriorityDistribution(child_id, family_id, start_date, end_date);
      
      // Get monthly trends
      const monthlyTrends = await this._getChildMonthlyTrends(child_id, family_id, start_date, end_date);
      
      return {
        success: true,
        data: {
          child: childData,
          recent_activity: recentActivity,
          priority_distribution: priorityDistribution,
          monthly_trends: monthlyTrends,
          report_period: {
            start_date: start_date || 'Beginning',
            end_date: end_date || 'Today'
          }
        }
      };
      
    } catch (error) {
      console.error('Error generating child performance report:', error);
      throw error;
    }
  }
  
  // ==========================================================================
  // TASK ANALYTICS REPORT
  // ==========================================================================
  
  /**
   * Generate task analytics report
   * @param {Object} params - { family_id, category, start_date, end_date }
   * @returns {Object} - Task analytics data
   */
  async generateTaskAnalyticsReport(params) {
    const { family_id, category, start_date, end_date } = params;
    
    try {
      const dateFilter = this._buildDateFilter(start_date, end_date, 't.created_at');
      const categoryFilter = category ? `AND t.category = $2` : '';
      
      const query = `
        SELECT 
          -- Overall Statistics
          COUNT(DISTINCT t.task_id) AS total_tasks_created,
          COUNT(DISTINCT ta.assignment_id) AS total_assignments,
          COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END) AS completed_assignments,
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
          
          -- Average Completion Time
          AVG(
            CASE 
              WHEN ta.status = 'approved' AND ta.completed_at IS NOT NULL 
              THEN EXTRACT(EPOCH FROM (ta.completed_at - ta.assigned_at))/3600 
            END
          ) AS avg_completion_time_hours,
          
          -- Points Statistics
          SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END) AS total_points_awarded,
          AVG(t.points_reward) AS avg_points_per_task,
          
          -- Priority Distribution
          COUNT(CASE WHEN t.priority = 'low' THEN 1 END) AS low_priority_tasks,
          COUNT(CASE WHEN t.priority = 'medium' THEN 1 END) AS medium_priority_tasks,
          COUNT(CASE WHEN t.priority = 'high' THEN 1 END) AS high_priority_tasks,
          COUNT(CASE WHEN t.priority = 'urgent' THEN 1 END) AS urgent_priority_tasks
          
        FROM tasks t
        LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
        WHERE t.family_id = $1
          ${categoryFilter}
          ${dateFilter}
      `;
      
      const values = category ? [family_id, category] : [family_id];
      const result = await pool.query(query, values);
      
      // Get category breakdown
      const categoryBreakdown = await this._getTaskCategoryBreakdown(family_id, start_date, end_date);
      
      // Get most assigned tasks
      const topTasks = await this._getTopAssignedTasks(family_id, start_date, end_date);
      
      // Get task status distribution
      const statusDistribution = await this._getTaskStatusDistribution(family_id, start_date, end_date);
      
      return {
        success: true,
        data: {
          overview: result.rows[0],
          category_breakdown: categoryBreakdown,
          top_tasks: topTasks,
          status_distribution: statusDistribution,
          report_period: {
            start_date: start_date || 'Beginning',
            end_date: end_date || 'Today',
            category: category || 'All Categories'
          }
        }
      };
      
    } catch (error) {
      console.error('Error generating task analytics report:', error);
      throw error;
    }
  }
  
  // ==========================================================================
  // REWARD ANALYTICS REPORT
  // ==========================================================================
  
  /**
   * Generate reward analytics report
   * @param {Object} params - { family_id, start_date, end_date }
   * @returns {Object} - Reward analytics data
   */
  async generateRewardAnalyticsReport(params) {
    const { family_id, start_date, end_date } = params;
    
    try {
      const dateFilter = this._buildDateFilter(start_date, end_date, 'rr.requested_at');
      
      const query = `
        SELECT 
          -- Overall Statistics
          COUNT(DISTINCT r.reward_id) AS total_rewards_available,
          COUNT(DISTINCT rr.redemption_id) AS total_redemption_requests,
          COUNT(DISTINCT CASE WHEN rr.status = 'approved' THEN rr.redemption_id END) AS approved_redemptions,
          COUNT(DISTINCT CASE WHEN rr.status = 'denied' THEN rr.redemption_id END) AS denied_redemptions,
          COUNT(DISTINCT CASE WHEN rr.status = 'pending' THEN rr.redemption_id END) AS pending_redemptions,
          
          -- Approval Rate
          CASE 
            WHEN COUNT(DISTINCT rr.redemption_id) > 0 
            THEN ROUND(
              (COUNT(DISTINCT CASE WHEN rr.status = 'approved' THEN rr.redemption_id END)::NUMERIC / 
               COUNT(DISTINCT rr.redemption_id)) * 100, 2
            )
            ELSE 0 
          END AS approval_rate,
          
          -- Points Statistics
          SUM(CASE WHEN rr.status = 'approved' THEN rr.points_spent ELSE 0 END) AS total_points_spent,
          AVG(CASE WHEN rr.status = 'approved' THEN rr.points_spent END) AS avg_points_per_redemption,
          AVG(r.points_required) AS avg_reward_cost
          
        FROM rewards r
        LEFT JOIN reward_redemptions rr ON r.reward_id = rr.reward_id
        WHERE r.family_id = $1
          ${dateFilter}
      `;
      
      const result = await pool.query(query, [family_id]);
      
      // Get most popular rewards
      const popularRewards = await this._getMostPopularRewards(family_id, start_date, end_date);
      
      // Get child redemption stats
      const childRedemptionStats = await this._getChildRedemptionStats(family_id, start_date, end_date);
      
      // Get reward status breakdown
      const rewardStatusBreakdown = await this._getRewardStatusBreakdown(family_id);
      
      return {
        success: true,
        data: {
          overview: result.rows[0],
          popular_rewards: popularRewards,
          child_stats: childRedemptionStats,
          reward_status: rewardStatusBreakdown,
          report_period: {
            start_date: start_date || 'Beginning',
            end_date: end_date || 'Today'
          }
        }
      };
      
    } catch (error) {
      console.error('Error generating reward analytics report:', error);
      throw error;
    }
  }
  
  // ==========================================================================
  // FAMILY SUMMARY REPORT
  // ==========================================================================
  
  /**
   * Generate comprehensive family summary report
   * @param {Object} params - { family_id, start_date, end_date }
   * @returns {Object} - Family summary data
   */
  async generateFamilySummaryReport(params) {
    const { family_id, start_date, end_date } = params;
    
    try {
      // Family basic info
      const familyInfoQuery = `
        SELECT 
          f.family_id,
          f.family_name,
          f.family_code,
          f.created_at,
          COUNT(DISTINCT fm.member_id) AS total_members,
          COUNT(DISTINCT CASE WHEN u.role = 'parent' THEN fm.member_id END) AS parents_count,
          COUNT(DISTINCT CASE WHEN u.role = 'spouse' THEN fm.member_id END) AS spouses_count,
          COUNT(DISTINCT CASE WHEN u.role = 'child' THEN fm.member_id END) AS children_count,
          SUM(CASE WHEN u.role = 'child' THEN fm.points_balance ELSE 0 END) AS total_family_points
        FROM families f
        LEFT JOIN family_members fm ON f.family_id = fm.family_id
        LEFT JOIN users u ON fm.user_id = u.user_id
        WHERE f.family_id = $1
        GROUP BY f.family_id, f.family_name, f.family_code, f.created_at
      `;
      
      const familyInfo = await pool.query(familyInfoQuery, [family_id]);
      
      if (familyInfo.rows.length === 0) {
        throw new Error('Family not found');
      }
      
      const dateFilter = this._buildDateFilter(start_date, end_date, 't.created_at');
      
      // Activity statistics
      const activityQuery = `
        SELECT 
          COUNT(DISTINCT t.task_id) AS total_tasks_created,
          COUNT(DISTINCT ta.assignment_id) AS total_assignments,
          COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END) AS completed_tasks,
          COUNT(DISTINCT r.reward_id) AS total_rewards_available,
          COUNT(DISTINCT rr.redemption_id) AS total_redemption_requests,
          SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END) AS total_points_earned,
          SUM(CASE WHEN rr.status = 'approved' THEN rr.points_spent ELSE 0 END) AS total_points_spent
        FROM families f
        LEFT JOIN tasks t ON f.family_id = t.family_id
        LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
        LEFT JOIN rewards r ON f.family_id = r.family_id
        LEFT JOIN reward_redemptions rr ON r.reward_id = rr.reward_id
        WHERE f.family_id = $1
          ${dateFilter}
        GROUP BY f.family_id
      `;
      
      const activityStats = await pool.query(activityQuery, [family_id]);
      
      // Top performing children
      const topChildren = await this._getTopPerformingChildren(family_id, start_date, end_date);
      
      // Recent family activity
      const recentActivity = await this._getFamilyRecentActivity(family_id, 10);
      
      // Weekly activity trend
      const weeklyTrend = await this._getFamilyWeeklyTrend(family_id, start_date, end_date);
      
      return {
        success: true,
        data: {
          family_info: familyInfo.rows[0],
          activity_stats: activityStats.rows[0],
          top_children: topChildren,
          recent_activity: recentActivity,
          weekly_trend: weeklyTrend,
          report_period: {
            start_date: start_date || 'Beginning',
            end_date: end_date || 'Today'
          }
        }
      };
      
    } catch (error) {
      console.error('Error generating family summary report:', error);
      throw error;
    }
  }
  
  // ==========================================================================
  // PARENT ACTIVITY REPORT
  // ==========================================================================
  
  /**
   * Generate parent activity report
   * @param {Object} params - { parent_id, family_id, start_date, end_date }
   * @returns {Object} - Parent activity data
   */
  async generateParentActivityReport(params) {
    const { parent_id, family_id, start_date, end_date } = params;
    
    try {
      const dateFilter = this._buildDateFilter(start_date, end_date, 't.created_at');
      
      const query = `
        SELECT 
          u.user_id,
          u.full_name,
          u.role,
          
          -- Task Creation Statistics
          COUNT(DISTINCT t.task_id) AS tasks_created,
          COUNT(DISTINCT ta.assignment_id) AS tasks_assigned,
          
          -- Review Statistics
          COUNT(DISTINCT CASE WHEN ta.reviewed_by = u.user_id THEN ta.assignment_id END) AS tasks_reviewed,
          COUNT(DISTINCT CASE WHEN ta.reviewed_by = u.user_id AND ta.status = 'approved' THEN ta.assignment_id END) AS tasks_approved,
          COUNT(DISTINCT CASE WHEN ta.reviewed_by = u.user_id AND ta.status = 'rejected' THEN ta.assignment_id END) AS tasks_rejected,
          
          -- Approval Rate
          CASE 
            WHEN COUNT(DISTINCT CASE WHEN ta.reviewed_by = u.user_id THEN ta.assignment_id END) > 0 
            THEN ROUND(
              (COUNT(DISTINCT CASE WHEN ta.reviewed_by = u.user_id AND ta.status = 'approved' THEN ta.assignment_id END)::NUMERIC / 
               COUNT(DISTINCT CASE WHEN ta.reviewed_by = u.user_id THEN ta.assignment_id END)) * 100, 2
            )
            ELSE 0 
          END AS approval_rate,
          
          -- Average Review Time (in hours)
          AVG(
            CASE 
              WHEN ta.reviewed_by = u.user_id AND ta.reviewed_at IS NOT NULL AND ta.completed_at IS NOT NULL
              THEN EXTRACT(EPOCH FROM (ta.reviewed_at - ta.completed_at))/3600 
            END
          ) AS avg_review_time_hours,
          
          -- Reward Management
          COUNT(DISTINCT r.reward_id) AS rewards_created,
          COUNT(DISTINCT CASE WHEN rr.reviewed_by = u.user_id THEN rr.redemption_id END) AS redemptions_reviewed,
          COUNT(DISTINCT CASE WHEN rr.reviewed_by = u.user_id AND rr.status = 'approved' THEN rr.redemption_id END) AS redemptions_approved
          
        FROM users u
        LEFT JOIN tasks t ON u.user_id = t.created_by AND t.family_id = $2
        LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
        LEFT JOIN rewards r ON u.user_id = r.created_by AND r.family_id = $2
        LEFT JOIN reward_redemptions rr ON r.reward_id = rr.reward_id
        WHERE u.user_id = $1
          AND u.role IN ('parent', 'spouse')
          ${dateFilter}
        GROUP BY u.user_id, u.full_name, u.role
      `;
      
      const result = await pool.query(query, [parent_id, family_id]);
      
      if (result.rows.length === 0) {
        throw new Error('Parent not found or not authorized');
      }
      
      // Get parent's recent actions
      const recentActions = await this._getParentRecentActions(parent_id, family_id);
      
      // Get task creation by category
      const tasksByCategory = await this._getParentTasksByCategory(parent_id, family_id, start_date, end_date);
      
      return {
        success: true,
        data: {
          parent: result.rows[0],
          recent_actions: recentActions,
          tasks_by_category: tasksByCategory,
          report_period: {
            start_date: start_date || 'Beginning',
            end_date: end_date || 'Today'
          }
        }
      };
      
    } catch (error) {
      console.error('Error generating parent activity report:', error);
      throw error;
    }
  }
  
  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================
  
  /**
   * Build date filter SQL clause
   * @private
   */
  _buildDateFilter(start_date, end_date, column_name) {
    let filter = '';
    
    if (start_date && end_date) {
      filter = `AND ${column_name} BETWEEN '${start_date}' AND '${end_date}'`;
    } else if (start_date) {
      filter = `AND ${column_name} >= '${start_date}'`;
    } else if (end_date) {
      filter = `AND ${column_name} <= '${end_date}'`;
    }
    
    return filter;
  }
  
  /**
   * Get child's recent activity
   * @private
   */
  async _getChildRecentActivity(child_id, family_id, limit = 10) {
    const query = `
      SELECT 
        ta.assignment_id,
        t.title,
        t.category,
        ta.status,
        ta.assigned_at,
        ta.completed_at,
        t.points_reward
      FROM task_assignments ta
      INNER JOIN tasks t ON ta.task_id = t.task_id
      WHERE ta.assigned_to = $1 AND t.family_id = $2
      ORDER BY ta.assigned_at DESC
      LIMIT $3
    `;
    
    const result = await pool.query(query, [child_id, family_id, limit]);
    return result.rows;
  }
  
  /**
   * Get task priority distribution for a child
   * @private
   */
  async _getTaskPriorityDistribution(child_id, family_id, start_date, end_date) {
    const dateFilter = this._buildDateFilter(start_date, end_date, 'ta.assigned_at');
    
    const query = `
      SELECT 
        t.priority,
        COUNT(ta.assignment_id) AS count,
        COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS completed
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
  }
  
  /**
   * Get child's monthly performance trends
   * @private
   */
  async _getChildMonthlyTrends(child_id, family_id, start_date, end_date) {
    const dateFilter = this._buildDateFilter(start_date, end_date, 'ta.assigned_at');
    
    const query = `
      SELECT 
        TO_CHAR(ta.assigned_at, 'YYYY-MM') AS month,
        COUNT(ta.assignment_id) AS tasks_assigned,
        COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS tasks_completed,
        SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END) AS points_earned
      FROM task_assignments ta
      INNER JOIN tasks t ON ta.task_id = t.task_id
      WHERE ta.assigned_to = $1 AND t.family_id = $2
        ${dateFilter}
      GROUP BY TO_CHAR(ta.assigned_at, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 6
    `;
    
    const result = await pool.query(query, [child_id, family_id]);
    return result.rows;
  }
  
  /**
   * Get task category breakdown
   * @private
   */
  async _getTaskCategoryBreakdown(family_id, start_date, end_date) {
    const dateFilter = this._buildDateFilter(start_date, end_date, 't.created_at');
    
    const query = `
      SELECT 
        COALESCE(t.category, 'Uncategorized') AS category,
        COUNT(DISTINCT t.task_id) AS total_tasks,
        COUNT(DISTINCT ta.assignment_id) AS assignments,
        COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END) AS completed,
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
      GROUP BY t.category
      ORDER BY total_tasks DESC
    `;
    
    const result = await pool.query(query, [family_id]);
    return result.rows;
  }
  
  /**
   * Get top assigned tasks
   * @private
   */
  async _getTopAssignedTasks(family_id, start_date, end_date, limit = 10) {
    const dateFilter = this._buildDateFilter(start_date, end_date, 't.created_at');
    
    const query = `
      SELECT 
        t.task_id,
        t.title,
        t.category,
        t.priority,
        t.points_reward,
        COUNT(ta.assignment_id) AS times_assigned,
        COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS times_completed
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
      WHERE t.family_id = $1
        ${dateFilter}
      GROUP BY t.task_id, t.title, t.category, t.priority, t.points_reward
      ORDER BY times_assigned DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [family_id, limit]);
    return result.rows;
  }
  
  /**
   * Get task status distribution
   * @private
   */
  async _getTaskStatusDistribution(family_id, start_date, end_date) {
    const dateFilter = this._buildDateFilter(start_date, end_date, 'ta.assigned_at');
    
    const query = `
      SELECT 
        ta.status,
        COUNT(ta.assignment_id) AS count
      FROM task_assignments ta
      INNER JOIN tasks t ON ta.task_id = t.task_id
      WHERE t.family_id = $1
        ${dateFilter}
      GROUP BY ta.status
      ORDER BY count DESC
    `;
    
    const result = await pool.query(query, [family_id]);
    return result.rows;
  }
  
  /**
   * Get most popular rewards
   * @private
   */
  async _getMostPopularRewards(family_id, start_date, end_date, limit = 10) {
    const dateFilter = this._buildDateFilter(start_date, end_date, 'rr.requested_at');
    
    const query = `
      SELECT 
        r.reward_id,
        r.reward_name,
        r.points_required,
        COUNT(rr.redemption_id) AS redemption_requests,
        COUNT(CASE WHEN rr.status = 'approved' THEN 1 END) AS approved_redemptions,
        r.quantity_available,
        r.quantity_redeemed
      FROM rewards r
      LEFT JOIN reward_redemptions rr ON r.reward_id = rr.reward_id
      WHERE r.family_id = $1
        ${dateFilter}
      GROUP BY r.reward_id, r.reward_name, r.points_required, r.quantity_available, r.quantity_redeemed
      ORDER BY redemption_requests DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [family_id, limit]);
    return result.rows;
  }
  
  /**
   * Get child redemption statistics
   * @private
   */
  async _getChildRedemptionStats(family_id, start_date, end_date) {
    const dateFilter = this._buildDateFilter(start_date, end_date, 'rr.requested_at');
    
    const query = `
      SELECT 
        u.user_id,
        u.full_name,
        COUNT(rr.redemption_id) AS redemption_requests,
        COUNT(CASE WHEN rr.status = 'approved' THEN 1 END) AS approved_redemptions,
        SUM(CASE WHEN rr.status = 'approved' THEN rr.points_spent ELSE 0 END) AS total_points_spent
      FROM users u
      INNER JOIN family_members fm ON u.user_id = fm.user_id
      LEFT JOIN reward_redemptions rr ON u.user_id = rr.child_id
      WHERE fm.family_id = $1 AND u.role = 'child'
        ${dateFilter}
      GROUP BY u.user_id, u.full_name
      ORDER BY redemption_requests DESC
    `;
    
    const result = await pool.query(query, [family_id]);
    return result.rows;
  }
  
  /**
   * Get reward status breakdown
   * @private
   */
  async _getRewardStatusBreakdown(family_id) {
    const query = `
      SELECT 
        status,
        COUNT(reward_id) AS count
      FROM rewards
      WHERE family_id = $1
      GROUP BY status
    `;
    
    const result = await pool.query(query, [family_id]);
    return result.rows;
  }
  
  /**
   * Get top performing children
   * @private
   */
  async _getTopPerformingChildren(family_id, start_date, end_date, limit = 5) {
    const dateFilter = this._buildDateFilter(start_date, end_date, 'ta.assigned_at');
    
    const query = `
      SELECT 
        u.user_id,
        u.full_name,
        u.profile_picture,
        fm.points_balance,
        COUNT(ta.assignment_id) AS tasks_assigned,
        COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS tasks_completed,
        ROUND(
          CASE 
            WHEN COUNT(ta.assignment_id) > 0 
            THEN (COUNT(CASE WHEN ta.status = 'approved' THEN 1 END)::NUMERIC / COUNT(ta.assignment_id)) * 100 
            ELSE 0 
          END, 2
        ) AS completion_rate
      FROM users u
      INNER JOIN family_members fm ON u.user_id = fm.user_id
      LEFT JOIN task_assignments ta ON u.user_id = ta.assigned_to
      WHERE fm.family_id = $1 AND u.role = 'child'
        ${dateFilter}
      GROUP BY u.user_id, u.full_name, u.profile_picture, fm.points_balance
      ORDER BY tasks_completed DESC, completion_rate DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [family_id, limit]);
    return result.rows;
  }
  
  /**
   * Get family recent activity
   * @private
   */
  async _getFamilyRecentActivity(family_id, limit = 10) {
    const query = `
      SELECT 
        'task_completed' AS activity_type,
        t.title AS description,
        u.full_name AS actor_name,
        ta.completed_at AS activity_date
      FROM task_assignments ta
      INNER JOIN tasks t ON ta.task_id = t.task_id
      INNER JOIN users u ON ta.assigned_to = u.user_id
      WHERE t.family_id = $1 AND ta.status = 'approved'
      
      UNION ALL
      
      SELECT 
        'reward_redeemed' AS activity_type,
        r.reward_name AS description,
        u.full_name AS actor_name,
        rr.requested_at AS activity_date
      FROM reward_redemptions rr
      INNER JOIN rewards r ON rr.reward_id = r.reward_id
      INNER JOIN users u ON rr.child_id = u.user_id
      WHERE rr.family_id = $1 AND rr.status = 'approved'
      
      ORDER BY activity_date DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [family_id, limit]);
    return result.rows;
  }
  
  /**
   * Get family weekly trend
   * @private
   */
  async _getFamilyWeeklyTrend(family_id, start_date, end_date) {
    const dateFilter = this._buildDateFilter(start_date, end_date, 'ta.assigned_at');
    
    const query = `
      SELECT 
        TO_CHAR(ta.assigned_at, 'IYYY-IW') AS week,
        COUNT(ta.assignment_id) AS tasks_assigned,
        COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS tasks_completed,
        SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END) AS points_earned
      FROM task_assignments ta
      INNER JOIN tasks t ON ta.task_id = t.task_id
      WHERE t.family_id = $1
        ${dateFilter}
      GROUP BY TO_CHAR(ta.assigned_at, 'IYYY-IW')
      ORDER BY week DESC
      LIMIT 12
    `;
    
    const result = await pool.query(query, [family_id]);
    return result.rows;
  }
  
  /**
   * Get parent's recent actions
   * @private
   */
  async _getParentRecentActions(parent_id, family_id, limit = 10) {
    const query = `
      SELECT 
        'task_created' AS action_type,
        t.title AS description,
        t.created_at AS action_date
      FROM tasks t
      WHERE t.created_by = $1 AND t.family_id = $2
      
      UNION ALL
      
      SELECT 
        'task_reviewed' AS action_type,
        t.title AS description,
        ta.reviewed_at AS action_date
      FROM task_assignments ta
      INNER JOIN tasks t ON ta.task_id = t.task_id
      WHERE ta.reviewed_by = $1 AND t.family_id = $2
      
      UNION ALL
      
      SELECT 
        'reward_created' AS action_type,
        r.reward_name AS description,
        r.created_at AS action_date
      FROM rewards r
      WHERE r.created_by = $1 AND r.family_id = $2
      
      ORDER BY action_date DESC
      LIMIT $3
    `;
    
    const result = await pool.query(query, [parent_id, family_id, limit]);
    return result.rows;
  }
  
  /**
   * Get parent's tasks by category
   * @private
   */
  async _getParentTasksByCategory(parent_id, family_id, start_date, end_date) {
    const dateFilter = this._buildDateFilter(start_date, end_date, 't.created_at');
    
    const query = `
      SELECT 
        COALESCE(t.category, 'Uncategorized') AS category,
        COUNT(t.task_id) AS count
      FROM tasks t
      WHERE t.created_by = $1 AND t.family_id = $2
        ${dateFilter}
      GROUP BY t.category
      ORDER BY count DESC
    `;
    
    const result = await pool.query(query, [parent_id, family_id]);
    return result.rows;
  }
}

module.exports = new ReportService();
