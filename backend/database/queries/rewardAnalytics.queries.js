// ============================================================================
// Reward Analytics Queries
// Optimized SQL queries for reward system analytics
// Author: Souleymane Camara - BIT1007326
// ============================================================================

const pool = require('../../config/database');

/**
 * Get comprehensive reward analytics overview
 */
const getRewardAnalyticsOverview = async (family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 'rr.requested_at');
  
  const query = `
    SELECT 
      -- Reward Availability
      COUNT(DISTINCT r.reward_id) AS total_rewards_created,
      COUNT(DISTINCT CASE WHEN r.status = 'available' THEN r.reward_id END) AS available_rewards,
      COUNT(DISTINCT CASE WHEN r.status = 'unavailable' THEN r.reward_id END) AS unavailable_rewards,
      COUNT(DISTINCT CASE WHEN r.status = 'archived' THEN r.reward_id END) AS archived_rewards,
      
      -- Redemption Statistics
      COUNT(DISTINCT rr.redemption_id) AS total_redemption_requests,
      COUNT(DISTINCT CASE WHEN rr.status = 'approved' THEN rr.redemption_id END) AS approved_redemptions,
      COUNT(DISTINCT CASE WHEN rr.status = 'denied' THEN rr.redemption_id END) AS denied_redemptions,
      COUNT(DISTINCT CASE WHEN rr.status = 'pending' THEN rr.redemption_id END) AS pending_redemptions,
      COUNT(DISTINCT CASE WHEN rr.status = 'cancelled' THEN rr.redemption_id END) AS cancelled_redemptions,
      
      -- Approval Rate
      CASE 
        WHEN COUNT(DISTINCT rr.redemption_id) > 0 
        THEN ROUND(
          (COUNT(DISTINCT CASE WHEN rr.status = 'approved' THEN rr.redemption_id END)::NUMERIC / 
           COUNT(DISTINCT rr.redemption_id)) * 100, 2
        )
        ELSE 0 
      END AS approval_rate,
      
      -- Denial Rate
      CASE 
        WHEN COUNT(DISTINCT rr.redemption_id) > 0 
        THEN ROUND(
          (COUNT(DISTINCT CASE WHEN rr.status = 'denied' THEN rr.redemption_id END)::NUMERIC / 
           COUNT(DISTINCT rr.redemption_id)) * 100, 2
        )
        ELSE 0 
      END AS denial_rate,
      
      -- Points Statistics
      SUM(CASE WHEN rr.status = 'approved' THEN rr.points_spent ELSE 0 END) AS total_points_spent,
      ROUND(AVG(CASE WHEN rr.status = 'approved' THEN rr.points_spent END)::NUMERIC, 2) AS avg_points_per_redemption,
      MAX(CASE WHEN rr.status = 'approved' THEN rr.points_spent END) AS max_points_spent,
      MIN(CASE WHEN rr.status = 'approved' THEN rr.points_spent END) AS min_points_spent,
      
      -- Reward Cost Statistics
      ROUND(AVG(r.points_required)::NUMERIC, 2) AS avg_reward_cost,
      MAX(r.points_required) AS most_expensive_reward_cost,
      MIN(r.points_required) AS cheapest_reward_cost,
      
      -- Quantity Statistics
      SUM(r.quantity_available) AS total_quantity_available,
      SUM(r.quantity_redeemed) AS total_quantity_redeemed,
      SUM(r.quantity_available - r.quantity_redeemed) AS remaining_quantity,
      
      -- Review Time Statistics
      ROUND(AVG(
        CASE 
          WHEN rr.reviewed_at IS NOT NULL AND rr.requested_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (rr.reviewed_at - rr.requested_at))/3600 
        END
      )::NUMERIC, 2) AS avg_review_time_hours,
      
      -- Unique Metrics
      COUNT(DISTINCT rr.child_id) AS unique_children_redeeming,
      COUNT(DISTINCT rr.reviewed_by) AS unique_reviewers
      
    FROM rewards r
    LEFT JOIN reward_redemptions rr ON r.reward_id = rr.reward_id
    WHERE r.family_id = $1
      ${dateFilter}
  `;
  
  const result = await pool.query(query, [family_id]);
  return result.rows[0];
};

/**
 * Get most popular rewards
 */
const getMostPopularRewards = async (family_id, start_date = null, end_date = null, limit = 10) => {
  const dateFilter = buildDateFilter(start_date, end_date, 'rr.requested_at');
  
  const query = `
    SELECT 
      r.reward_id,
      r.reward_name,
      r.description,
      r.points_required,
      r.quantity_available,
      r.quantity_redeemed,
      r.status,
      COUNT(rr.redemption_id) AS redemption_requests,
      COUNT(CASE WHEN rr.status = 'approved' THEN 1 END) AS approved_redemptions,
      COUNT(CASE WHEN rr.status = 'denied' THEN 1 END) AS denied_redemptions,
      COUNT(CASE WHEN rr.status = 'pending' THEN 1 END) AS pending_redemptions,
      ROUND(
        CASE 
          WHEN COUNT(rr.redemption_id) > 0 
          THEN (COUNT(CASE WHEN rr.status = 'approved' THEN 1 END)::NUMERIC / COUNT(rr.redemption_id)) * 100 
          ELSE 0 
        END, 2
      ) AS approval_rate,
      SUM(CASE WHEN rr.status = 'approved' THEN rr.points_spent ELSE 0 END) AS total_points_spent,
      u.full_name AS created_by_name
    FROM rewards r
    LEFT JOIN reward_redemptions rr ON r.reward_id = rr.reward_id ${dateFilter ? 'AND' + dateFilter.substring(3) : ''}
    LEFT JOIN users u ON r.created_by = u.user_id
    WHERE r.family_id = $1
    GROUP BY r.reward_id, r.reward_name, r.description, r.points_required, 
             r.quantity_available, r.quantity_redeemed, r.status, u.full_name
    ORDER BY redemption_requests DESC, approved_redemptions DESC
    LIMIT $2
  `;
  
  const result = await pool.query(query, [family_id, limit]);
  return result.rows;
};

/**
 * Get least popular rewards (might need adjustment)
 */
const getLeastPopularRewards = async (family_id, min_age_days = 30, limit = 10) => {
  const query = `
    SELECT 
      r.reward_id,
      r.reward_name,
      r.points_required,
      r.quantity_available,
      r.quantity_redeemed,
      r.status,
      r.created_at,
      EXTRACT(DAY FROM (CURRENT_TIMESTAMP - r.created_at)) AS days_since_created,
      COUNT(rr.redemption_id) AS redemption_requests,
      COUNT(CASE WHEN rr.status = 'approved' THEN 1 END) AS approved_redemptions
    FROM rewards r
    LEFT JOIN reward_redemptions rr ON r.reward_id = rr.reward_id
    WHERE r.family_id = $1
      AND r.status = 'available'
      AND r.created_at < CURRENT_TIMESTAMP - INTERVAL '${min_age_days} days'
    GROUP BY r.reward_id, r.reward_name, r.points_required, 
             r.quantity_available, r.quantity_redeemed, r.status, r.created_at
    ORDER BY redemption_requests ASC, approved_redemptions ASC
    LIMIT $2
  `;
  
  const result = await pool.query(query, [family_id, limit]);
  return result.rows;
};

/**
 * Get child redemption statistics
 */
const getChildRedemptionStats = async (family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 'rr.requested_at');
  
  const query = `
    SELECT 
      u.user_id,
      u.full_name,
      u.profile_picture,
      fm.points_balance AS current_points,
      COUNT(rr.redemption_id) AS redemption_requests,
      COUNT(CASE WHEN rr.status = 'approved' THEN 1 END) AS approved_redemptions,
      COUNT(CASE WHEN rr.status = 'denied' THEN 1 END) AS denied_redemptions,
      COUNT(CASE WHEN rr.status = 'pending' THEN 1 END) AS pending_redemptions,
      SUM(CASE WHEN rr.status = 'approved' THEN rr.points_spent ELSE 0 END) AS total_points_spent,
      ROUND(AVG(CASE WHEN rr.status = 'approved' THEN rr.points_spent END)::NUMERIC, 2) AS avg_points_per_redemption,
      ROUND(
        CASE 
          WHEN COUNT(rr.redemption_id) > 0 
          THEN (COUNT(CASE WHEN rr.status = 'approved' THEN 1 END)::NUMERIC / COUNT(rr.redemption_id)) * 100 
          ELSE 0 
        END, 2
      ) AS approval_rate
    FROM users u
    INNER JOIN family_members fm ON u.user_id = fm.user_id
    LEFT JOIN reward_redemptions rr ON u.user_id = rr.child_id ${dateFilter ? 'AND' + dateFilter.substring(3) : ''}
    WHERE fm.family_id = $1 AND u.role = 'child'
    GROUP BY u.user_id, u.full_name, u.profile_picture, fm.points_balance
    ORDER BY redemption_requests DESC
  `;
  
  const result = await pool.query(query, [family_id]);
  return result.rows;
};

/**
 * Get reward status breakdown
 */
const getRewardStatusBreakdown = async (family_id) => {
  const query = `
    SELECT 
      status,
      COUNT(reward_id) AS count,
      SUM(quantity_available) AS total_quantity,
      SUM(quantity_redeemed) AS total_redeemed,
      ROUND(AVG(points_required)::NUMERIC, 2) AS avg_points_required,
      ROUND((COUNT(reward_id)::NUMERIC / 
             (SELECT COUNT(*) FROM rewards WHERE family_id = $1)) * 100, 2) AS percentage
    FROM rewards
    WHERE family_id = $1
    GROUP BY status
    ORDER BY count DESC
  `;
  
  const result = await pool.query(query, [family_id]);
  return result.rows;
};

/**
 * Get reward points distribution (bucketing rewards by cost)
 */
const getRewardPointsDistribution = async (family_id) => {
  const query = `
    SELECT 
      CASE 
        WHEN points_required <= 50 THEN '0-50 points'
        WHEN points_required <= 100 THEN '51-100 points'
        WHEN points_required <= 200 THEN '101-200 points'
        WHEN points_required <= 500 THEN '201-500 points'
        ELSE '500+ points'
      END AS points_range,
      COUNT(reward_id) AS reward_count,
      SUM(quantity_redeemed) AS total_redeemed
    FROM rewards
    WHERE family_id = $1
    GROUP BY 
      CASE 
        WHEN points_required <= 50 THEN '0-50 points'
        WHEN points_required <= 100 THEN '51-100 points'
        WHEN points_required <= 200 THEN '101-200 points'
        WHEN points_required <= 500 THEN '201-500 points'
        ELSE '500+ points'
      END
    ORDER BY 
      CASE 
        WHEN points_required <= 50 THEN 1
        WHEN points_required <= 100 THEN 2
        WHEN points_required <= 200 THEN 3
        WHEN points_required <= 500 THEN 4
        ELSE 5
      END
  `;
  
  const result = await pool.query(query, [family_id]);
  return result.rows;
};

/**
 * Get daily redemption trend
 */
const getDailyRedemptionTrend = async (family_id, days = 30) => {
  const query = `
    SELECT 
      DATE(rr.requested_at) AS date,
      COUNT(rr.redemption_id) AS redemption_requests,
      COUNT(CASE WHEN rr.status = 'approved' THEN 1 END) AS approved,
      COUNT(CASE WHEN rr.status = 'denied' THEN 1 END) AS denied,
      SUM(CASE WHEN rr.status = 'approved' THEN rr.points_spent ELSE 0 END) AS points_spent
    FROM reward_redemptions rr
    INNER JOIN rewards r ON rr.reward_id = r.reward_id
    WHERE rr.family_id = $1
      AND rr.requested_at >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY DATE(rr.requested_at)
    ORDER BY date DESC
  `;
  
  const result = await pool.query(query, [family_id]);
  return result.rows;
};

/**
 * Get weekly redemption trend
 */
const getWeeklyRedemptionTrend = async (family_id, weeks = 12) => {
  const query = `
    SELECT 
      TO_CHAR(rr.requested_at, 'IYYY-IW') AS week,
      DATE_TRUNC('week', rr.requested_at)::DATE AS week_start,
      COUNT(rr.redemption_id) AS redemption_requests,
      COUNT(CASE WHEN rr.status = 'approved' THEN 1 END) AS approved,
      COUNT(CASE WHEN rr.status = 'denied' THEN 1 END) AS denied,
      SUM(CASE WHEN rr.status = 'approved' THEN rr.points_spent ELSE 0 END) AS points_spent
    FROM reward_redemptions rr
    INNER JOIN rewards r ON rr.reward_id = r.reward_id
    WHERE rr.family_id = $1
    GROUP BY TO_CHAR(rr.requested_at, 'IYYY-IW'), DATE_TRUNC('week', rr.requested_at)
    ORDER BY week DESC
    LIMIT $2
  `;
  
  const result = await pool.query(query, [family_id, weeks]);
  return result.rows;
};

/**
 * Get reward inventory status (low stock alerts)
 */
const getRewardInventoryStatus = async (family_id, low_stock_threshold = 2) => {
  const query = `
    SELECT 
      r.reward_id,
      r.reward_name,
      r.points_required,
      r.quantity_available,
      r.quantity_redeemed,
      r.quantity_available - r.quantity_redeemed AS remaining_quantity,
      r.status,
      COUNT(rr.redemption_id) FILTER (WHERE rr.status = 'pending') AS pending_redemptions,
      CASE 
        WHEN (r.quantity_available - r.quantity_redeemed) <= 0 THEN 'Out of Stock'
        WHEN (r.quantity_available - r.quantity_redeemed) <= $2 THEN 'Low Stock'
        ELSE 'In Stock'
      END AS stock_status
    FROM rewards r
    LEFT JOIN reward_redemptions rr ON r.reward_id = rr.reward_id
    WHERE r.family_id = $1 AND r.status = 'available'
    GROUP BY r.reward_id, r.reward_name, r.points_required, 
             r.quantity_available, r.quantity_redeemed, r.status
    ORDER BY remaining_quantity ASC, pending_redemptions DESC
  `;
  
  const result = await pool.query(query, [family_id, low_stock_threshold]);
  return result.rows;
};

/**
 * Get redemption denial reasons analysis
 */
const getRedemptionDenialAnalysis = async (family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 'rr.requested_at');
  
  const query = `
    SELECT 
      rr.review_notes,
      COUNT(*) AS denial_count,
      AVG(rr.points_spent) AS avg_points_attempted
    FROM reward_redemptions rr
    INNER JOIN rewards r ON rr.reward_id = r.reward_id
    WHERE rr.family_id = $1
      AND rr.status = 'denied'
      AND rr.review_notes IS NOT NULL
      ${dateFilter}
    GROUP BY rr.review_notes
    ORDER BY denial_count DESC
    LIMIT 10
  `;
  
  const result = await pool.query(query, [family_id]);
  return result.rows;
};

/**
 * Get reward ROI analysis (redemptions per reward)
 */
const getRewardROIAnalysis = async (family_id, min_redemptions = 1) => {
  const query = `
    SELECT 
      r.reward_id,
      r.reward_name,
      r.points_required,
      r.quantity_available,
      r.quantity_redeemed,
      COUNT(rr.redemption_id) AS total_requests,
      COUNT(CASE WHEN rr.status = 'approved' THEN 1 END) AS approved_requests,
      ROUND((r.quantity_redeemed::NUMERIC / NULLIF(r.quantity_available, 0)) * 100, 2) AS redemption_rate,
      ROUND(
        CASE 
          WHEN COUNT(rr.redemption_id) > 0 
          THEN (COUNT(CASE WHEN rr.status = 'approved' THEN 1 END)::NUMERIC / COUNT(rr.redemption_id)) * 100 
          ELSE 0 
        END, 2
      ) AS approval_rate,
      r.quantity_redeemed * r.points_required AS total_points_generated
    FROM rewards r
    LEFT JOIN reward_redemptions rr ON r.reward_id = rr.reward_id
    WHERE r.family_id = $1
    GROUP BY r.reward_id, r.reward_name, r.points_required, r.quantity_available, r.quantity_redeemed
    HAVING COUNT(CASE WHEN rr.status = 'approved' THEN 1 END) >= $2
    ORDER BY total_points_generated DESC
  `;
  
  const result = await pool.query(query, [family_id, min_redemptions]);
  return result.rows;
};

/**
 * Get parent review performance (for reward redemptions)
 */
const getParentReviewPerformance = async (family_id, start_date = null, end_date = null) => {
  const dateFilter = buildDateFilter(start_date, end_date, 'rr.requested_at');
  
  const query = `
    SELECT 
      u.user_id,
      u.full_name,
      COUNT(rr.redemption_id) AS redemptions_reviewed,
      COUNT(CASE WHEN rr.status = 'approved' THEN 1 END) AS approved_count,
      COUNT(CASE WHEN rr.status = 'denied' THEN 1 END) AS denied_count,
      ROUND(
        CASE 
          WHEN COUNT(rr.redemption_id) > 0 
          THEN (COUNT(CASE WHEN rr.status = 'approved' THEN 1 END)::NUMERIC / COUNT(rr.redemption_id)) * 100 
          ELSE 0 
        END, 2
      ) AS approval_rate,
      ROUND(AVG(
        CASE 
          WHEN rr.reviewed_at IS NOT NULL AND rr.requested_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (rr.reviewed_at - rr.requested_at))/3600 
        END
      )::NUMERIC, 2) AS avg_review_time_hours
    FROM users u
    INNER JOIN reward_redemptions rr ON u.user_id = rr.reviewed_by
    WHERE rr.family_id = $1
      AND rr.status IN ('approved', 'denied')
      ${dateFilter}
    GROUP BY u.user_id, u.full_name
    ORDER BY redemptions_reviewed DESC
  `;
  
  const result = await pool.query(query, [family_id]);
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
  getRewardAnalyticsOverview,
  getMostPopularRewards,
  getLeastPopularRewards,
  getChildRedemptionStats,
  getRewardStatusBreakdown,
  getRewardPointsDistribution,
  getDailyRedemptionTrend,
  getWeeklyRedemptionTrend,
  getRewardInventoryStatus,
  getRedemptionDenialAnalysis,
  getRewardROIAnalysis,
  getParentReviewPerformance
};
