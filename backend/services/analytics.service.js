// ============================================================================
// Analytics Service
// Advanced data analytics and calculations for TaskBuddy
// Author: Souleymane Camara - BIT1007326
// ============================================================================

const pool = require('../config/database');

class AnalyticsService {
  
  // ==========================================================================
  // PERFORMANCE CALCULATIONS
  // ==========================================================================
  
  /**
   * Calculate child performance score
   * @param {Object} params - { child_id, family_id, start_date, end_date }
   * @returns {Object} - Performance score and breakdown
   */
  async calculatePerformanceScore(params) {
    const { child_id, family_id, start_date, end_date } = params;
    
    try {
      // Get metrics
      const metrics = await this._getChildMetrics(child_id, family_id, start_date, end_date);
      
      // Calculate scores (100 point scale)
      const completionScore = this._calculateCompletionScore(metrics);
      const punctualityScore = this._calculatePunctualityScore(metrics);
      const qualityScore = this._calculateQualityScore(metrics);
      const consistencyScore = this._calculateConsistencyScore(metrics);
      
      // Weighted overall score
      const overallScore = (
        (completionScore * 0.35) +
        (punctualityScore * 0.25) +
        (qualityScore * 0.25) +
        (consistencyScore * 0.15)
      ).toFixed(2);
      
      // Performance rating
      const rating = this._getPerformanceRating(overallScore);
      
      return {
        success: true,
        data: {
          overall_score: parseFloat(overallScore),
          rating: rating,
          breakdown: {
            completion: {
              score: completionScore,
              weight: '35%',
              description: 'Task completion rate'
            },
            punctuality: {
              score: punctualityScore,
              weight: '25%',
              description: 'On-time completion rate'
            },
            quality: {
              score: qualityScore,
              weight: '25%',
              description: 'First-time approval rate'
            },
            consistency: {
              score: consistencyScore,
              weight: '15%',
              description: 'Regular participation'
            }
          },
          metrics: metrics
        }
      };
      
    } catch (error) {
      console.error('Error calculating performance score:', error);
      throw error;
    }
  }
  
  /**
   * Calculate family engagement score
   * @param {Object} params - { family_id, start_date, end_date }
   * @returns {Object} - Engagement score and metrics
   */
  async calculateFamilyEngagement(params) {
    const { family_id, start_date, end_date } = params;
    
    try {
      const metrics = await this._getFamilyMetrics(family_id, start_date, end_date);
      
      // Calculate engagement indicators
      const taskActivityScore = this._calculateTaskActivityScore(metrics);
      const childParticipationScore = this._calculateChildParticipationScore(metrics);
      const parentInvolvementScore = this._calculateParentInvolvementScore(metrics);
      const rewardActivityScore = this._calculateRewardActivityScore(metrics);
      
      // Overall engagement score
      const engagementScore = (
        (taskActivityScore * 0.35) +
        (childParticipationScore * 0.30) +
        (parentInvolvementScore * 0.20) +
        (rewardActivityScore * 0.15)
      ).toFixed(2);
      
      const engagementLevel = this._getEngagementLevel(engagementScore);
      
      return {
        success: true,
        data: {
          engagement_score: parseFloat(engagementScore),
          engagement_level: engagementLevel,
          breakdown: {
            task_activity: taskActivityScore,
            child_participation: childParticipationScore,
            parent_involvement: parentInvolvementScore,
            reward_activity: rewardActivityScore
          },
          metrics: metrics,
          recommendations: this._getEngagementRecommendations(engagementScore, metrics)
        }
      };
      
    } catch (error) {
      console.error('Error calculating family engagement:', error);
      throw error;
    }
  }
  
  // ==========================================================================
  // TREND ANALYSIS
  // ==========================================================================
  
  /**
   * Analyze performance trends over time
   * @param {Object} params - { child_id, family_id, period }
   * @returns {Object} - Trend analysis data
   */
  async analyzePerformanceTrend(params) {
    const { child_id, family_id, period = 'monthly' } = params;
    
    try {
      const trendData = await this._getTrendData(child_id, family_id, period);
      
      // Calculate trend direction
      const trendDirection = this._calculateTrendDirection(trendData);
      
      // Calculate rate of change
      const rateOfChange = this._calculateRateOfChange(trendData);
      
      // Predict next period performance
      const prediction = this._predictNextPeriod(trendData);
      
      return {
        success: true,
        data: {
          period: period,
          trend_direction: trendDirection,
          rate_of_change: rateOfChange,
          prediction: prediction,
          historical_data: trendData,
          insights: this._generateTrendInsights(trendDirection, rateOfChange, trendData)
        }
      };
      
    } catch (error) {
      console.error('Error analyzing performance trend:', error);
      throw error;
    }
  }
  
  /**
   * Analyze task category performance
   * @param {Object} params - { family_id, start_date, end_date }
   * @returns {Object} - Category analysis data
   */
  async analyzeCategoryPerformance(params) {
    const { family_id, start_date, end_date } = params;
    
    try {
      const categoryData = await this._getCategoryData(family_id, start_date, end_date);
      
      // Identify top and bottom categories
      const topCategories = categoryData.slice(0, 3);
      const bottomCategories = categoryData.slice(-3).reverse();
      
      // Calculate category efficiency
      const categoryEfficiency = categoryData.map(cat => ({
        category: cat.category,
        efficiency_score: this._calculateCategoryEfficiency(cat)
      }));
      
      return {
        success: true,
        data: {
          all_categories: categoryData,
          top_performing: topCategories,
          needs_improvement: bottomCategories,
          efficiency_scores: categoryEfficiency,
          insights: this._generateCategoryInsights(categoryData)
        }
      };
      
    } catch (error) {
      console.error('Error analyzing category performance:', error);
      throw error;
    }
  }
  
  // ==========================================================================
  // COMPARATIVE ANALYSIS
  // ==========================================================================
  
  /**
   * Compare child performance within family
   * @param {Object} params - { family_id, start_date, end_date }
   * @returns {Object} - Comparative analysis data
   */
  async compareChildrenPerformance(params) {
    const { family_id, start_date, end_date } = params;
    
    try {
      const childrenData = await this._getAllChildrenMetrics(family_id, start_date, end_date);
      
      if (childrenData.length === 0) {
        return {
          success: true,
          data: {
            message: 'No children data available for comparison'
          }
        };
      }
      
      // Calculate rankings
      const rankings = this._calculateRankings(childrenData);
      
      // Calculate family averages
      const familyAverages = this._calculateFamilyAverages(childrenData);
      
      // Identify standouts
      const topPerformer = rankings[0];
      const mostImproved = await this._getMostImprovedChild(family_id, start_date, end_date);
      
      return {
        success: true,
        data: {
          rankings: rankings,
          family_averages: familyAverages,
          top_performer: topPerformer,
          most_improved: mostImproved,
          comparison_chart_data: this._formatComparisonChartData(childrenData)
        }
      };
      
    } catch (error) {
      console.error('Error comparing children performance:', error);
      throw error;
    }
  }
  
  /**
   * Compare task types effectiveness
   * @param {Object} params - { family_id, start_date, end_date }
   * @returns {Object} - Task type comparison data
   */
  async compareTaskTypes(params) {
    const { family_id, start_date, end_date } = params;
    
    try {
      // Compare by priority
      const priorityComparison = await this._comparePriorityTypes(family_id, start_date, end_date);
      
      // Compare by category
      const categoryComparison = await this._compareCategoryTypes(family_id, start_date, end_date);
      
      // Compare recurring vs one-time
      const recurringComparison = await this._compareRecurringTypes(family_id, start_date, end_date);
      
      return {
        success: true,
        data: {
          by_priority: priorityComparison,
          by_category: categoryComparison,
          recurring_vs_onetime: recurringComparison,
          insights: this._generateTaskTypeInsights(priorityComparison, categoryComparison, recurringComparison)
        }
      };
      
    } catch (error) {
      console.error('Error comparing task types:', error);
      throw error;
    }
  }
  
  // ==========================================================================
  // PREDICTIVE ANALYTICS
  // ==========================================================================
  
  /**
   * Predict task completion probability
   * @param {Object} params - { assignment_id }
   * @returns {Object} - Prediction data
   */
  async predictTaskCompletion(params) {
    const { assignment_id } = params;
    
    try {
      const taskData = await this._getTaskAssignmentData(assignment_id);
      const childHistory = await this._getChildTaskHistory(taskData.child_id, taskData.family_id);
      
      // Calculate probability based on historical performance
      const completionProbability = this._calculateCompletionProbability(taskData, childHistory);
      
      // Estimate completion time
      const estimatedCompletionTime = this._estimateCompletionTime(taskData, childHistory);
      
      return {
        success: true,
        data: {
          assignment_id: assignment_id,
          completion_probability: completionProbability,
          estimated_completion_time: estimatedCompletionTime,
          confidence_level: this._calculateConfidenceLevel(childHistory),
          factors: this._identifyInfluencingFactors(taskData, childHistory)
        }
      };
      
    } catch (error) {
      console.error('Error predicting task completion:', error);
      throw error;
    }
  }
  
  /**
   * Forecast family activity for next period
   * @param {Object} params - { family_id }
   * @returns {Object} - Forecast data
   */
  async forecastFamilyActivity(params) {
    const { family_id } = params;
    
    try {
      const historicalData = await this._getFamilyHistoricalData(family_id);
      
      // Forecast tasks
      const taskForecast = this._forecastTasks(historicalData);
      
      // Forecast points
      const pointsForecast = this._forecastPoints(historicalData);
      
      // Forecast redemptions
      const redemptionForecast = this._forecastRedemptions(historicalData);
      
      return {
        success: true,
        data: {
          forecast_period: 'Next 30 days',
          tasks: taskForecast,
          points: pointsForecast,
          redemptions: redemptionForecast,
          confidence: this._calculateForecastConfidence(historicalData)
        }
      };
      
    } catch (error) {
      console.error('Error forecasting family activity:', error);
      throw error;
    }
  }
  
  // ==========================================================================
  // HELPER METHODS - METRICS RETRIEVAL
  // ==========================================================================
  
  /**
   * Get child performance metrics
   * @private
   */
  async _getChildMetrics(child_id, family_id, start_date, end_date) {
    const dateFilter = this._buildDateFilter(start_date, end_date, 'ta.assigned_at');
    
    const query = `
      SELECT 
        COUNT(ta.assignment_id) AS total_tasks,
        COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS completed_tasks,
        COUNT(CASE WHEN ta.status = 'rejected' THEN 1 END) AS rejected_tasks,
        COUNT(CASE WHEN ta.status = 'overdue' THEN 1 END) AS overdue_tasks,
        COUNT(CASE WHEN ta.completed_at <= ta.due_date THEN 1 END) AS ontime_completions,
        AVG(CASE WHEN ta.status = 'approved' THEN 
          EXTRACT(EPOCH FROM (ta.completed_at - ta.assigned_at))/3600 
        END) AS avg_completion_time_hours,
        COUNT(DISTINCT DATE(ta.assigned_at)) AS active_days
      FROM task_assignments ta
      INNER JOIN tasks t ON ta.task_id = t.task_id
      WHERE ta.assigned_to = $1 AND t.family_id = $2
        ${dateFilter}
    `;
    
    const result = await pool.query(query, [child_id, family_id]);
    return result.rows[0];
  }
  
  /**
   * Get family engagement metrics
   * @private
   */
  async _getFamilyMetrics(family_id, start_date, end_date) {
    const dateFilter = this._buildDateFilter(start_date, end_date, 't.created_at');
    
    const query = `
      SELECT 
        COUNT(DISTINCT t.task_id) AS total_tasks_created,
        COUNT(DISTINCT ta.assignment_id) AS total_assignments,
        COUNT(DISTINCT CASE WHEN ta.status = 'approved' THEN ta.assignment_id END) AS completed_assignments,
        COUNT(DISTINCT ta.assigned_to) AS active_children,
        COUNT(DISTINCT t.created_by) AS active_parents,
        COUNT(DISTINCT rr.redemption_id) AS redemption_requests,
        COUNT(DISTINCT DATE(t.created_at)) AS active_days
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
      LEFT JOIN rewards r ON r.family_id = t.family_id
      LEFT JOIN reward_redemptions rr ON r.reward_id = rr.reward_id
      WHERE t.family_id = $1
        ${dateFilter}
    `;
    
    const result = await pool.query(query, [family_id]);
    return result.rows[0];
  }
  
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
  
  // ==========================================================================
  // HELPER METHODS - SCORE CALCULATIONS
  // ==========================================================================
  
  /**
   * Calculate completion score
   * @private
   */
  _calculateCompletionScore(metrics) {
    if (metrics.total_tasks === 0) return 0;
    
    const completionRate = (metrics.completed_tasks / metrics.total_tasks) * 100;
    return Math.min(completionRate, 100).toFixed(2);
  }
  
  /**
   * Calculate punctuality score
   * @private
   */
  _calculatePunctualityScore(metrics) {
    if (metrics.completed_tasks === 0) return 0;
    
    const ontimeRate = (metrics.ontime_completions / metrics.completed_tasks) * 100;
    const overdueImpact = (metrics.overdue_tasks / metrics.total_tasks) * 20; // Penalty
    
    const score = Math.max(ontimeRate - overdueImpact, 0);
    return Math.min(score, 100).toFixed(2);
  }
  
  /**
   * Calculate quality score (first-time approval rate)
   * @private
   */
  _calculateQualityScore(metrics) {
    if (metrics.total_tasks === 0) return 0;
    
    const approvalRate = (metrics.completed_tasks / (metrics.completed_tasks + metrics.rejected_tasks)) * 100;
    return Math.min(approvalRate || 0, 100).toFixed(2);
  }
  
  /**
   * Calculate consistency score
   * @private
   */
  _calculateConsistencyScore(metrics) {
    // Based on active participation days
    const daysInPeriod = 30; // Assuming 30-day period
    const participationRate = (metrics.active_days / daysInPeriod) * 100;
    
    return Math.min(participationRate, 100).toFixed(2);
  }
  
  /**
   * Calculate task activity score
   * @private
   */
  _calculateTaskActivityScore(metrics) {
    const tasksPerDay = metrics.total_tasks_created / Math.max(metrics.active_days, 1);
    const assignmentRate = metrics.total_assignments / Math.max(metrics.total_tasks_created, 1);
    const completionRate = metrics.completed_assignments / Math.max(metrics.total_assignments, 1);
    
    // Scoring logic: activity level + efficiency
    const activityScore = Math.min(tasksPerDay * 10, 50); // Max 50 points for activity
    const efficiencyScore = (assignmentRate * 25) + (completionRate * 25); // Max 50 points
    
    return (activityScore + efficiencyScore).toFixed(2);
  }
  
  /**
   * Calculate child participation score
   * @private
   */
  _calculateChildParticipationScore(metrics) {
    if (metrics.total_assignments === 0) return 0;
    
    const childrenParticipationRate = metrics.active_children / Math.max(metrics.active_children, 1);
    const completionRate = metrics.completed_assignments / metrics.total_assignments;
    
    return ((childrenParticipationRate * 50) + (completionRate * 50)).toFixed(2);
  }
  
  /**
   * Calculate parent involvement score
   * @private
   */
  _calculateParentInvolvementScore(metrics) {
    const taskCreationRate = metrics.total_tasks_created / Math.max(metrics.active_days, 1);
    const parentActivityScore = Math.min(taskCreationRate * 20, 100);
    
    return parentActivityScore.toFixed(2);
  }
  
  /**
   * Calculate reward activity score
   * @private
   */
  _calculateRewardActivityScore(metrics) {
    const redemptionRate = metrics.redemption_requests / Math.max(metrics.active_children, 1);
    return Math.min(redemptionRate * 20, 100).toFixed(2);
  }
  
  // ==========================================================================
  // HELPER METHODS - RATINGS & LEVELS
  // ==========================================================================
  
  /**
   * Get performance rating based on score
   * @private
   */
  _getPerformanceRating(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Very Good';
    if (score >= 60) return 'Good';
    if (score >= 45) return 'Fair';
    return 'Needs Improvement';
  }
  
  /**
   * Get engagement level
   * @private
   */
  _getEngagementLevel(score) {
    if (score >= 80) return 'Highly Engaged';
    if (score >= 60) return 'Engaged';
    if (score >= 40) return 'Moderately Engaged';
    return 'Low Engagement';
  }
  
  /**
   * Generate engagement recommendations
   * @private
   */
  _getEngagementRecommendations(score, metrics) {
    const recommendations = [];
    
    if (score < 60) {
      recommendations.push('Consider creating more engaging tasks with appropriate rewards');
      recommendations.push('Ensure tasks are age-appropriate and achievable');
    }
    
    if (metrics.active_children < 2) {
      recommendations.push('Encourage all children to participate regularly');
    }
    
    if (metrics.redemption_requests === 0) {
      recommendations.push('Review reward catalog to ensure it appeals to children');
    }
    
    return recommendations;
  }
  
  /**
   * Calculate trend direction
   * @private
   */
  _calculateTrendDirection(trendData) {
    if (trendData.length < 2) return 'Insufficient data';
    
    const recent = trendData[0].completion_rate;
    const previous = trendData[1].completion_rate;
    
    if (recent > previous + 5) return 'Improving';
    if (recent < previous - 5) return 'Declining';
    return 'Stable';
  }
  
  /**
   * Calculate rate of change
   * @private
   */
  _calculateRateOfChange(trendData) {
    if (trendData.length < 2) return 0;
    
    const recent = trendData[0].completion_rate;
    const previous = trendData[1].completion_rate;
    
    return ((recent - previous) / previous * 100).toFixed(2);
  }
  
  /**
   * Predict next period performance
   * @private
   */
  _predictNextPeriod(trendData) {
    if (trendData.length < 3) {
      return { prediction: 'Insufficient historical data', confidence: 'Low' };
    }
    
    // Simple linear regression prediction
    const avgChange = trendData.slice(0, 3).reduce((sum, item, idx, arr) => {
      if (idx === arr.length - 1) return sum;
      return sum + (item.completion_rate - arr[idx + 1].completion_rate);
    }, 0) / 2;
    
    const predictedRate = trendData[0].completion_rate + avgChange;
    
    return {
      predicted_completion_rate: Math.max(0, Math.min(100, predictedRate)).toFixed(2),
      confidence: 'Medium'
    };
  }
  
  /**
   * Generate trend insights
   * @private
   */
  _generateTrendInsights(direction, rateOfChange, trendData) {
    const insights = [];
    
    if (direction === 'Improving') {
      insights.push('Performance is showing positive improvement');
    } else if (direction === 'Declining') {
      insights.push('Performance requires attention and support');
    }
    
    if (Math.abs(rateOfChange) > 20) {
      insights.push('Significant performance change detected');
    }
    
    return insights;
  }
  
  /**
   * Calculate category efficiency
   * @private
   */
  _calculateCategoryEfficiency(categoryData) {
    const completionRate = (categoryData.completed / categoryData.assignments) * 100 || 0;
    const assignmentUtilization = (categoryData.assignments / categoryData.total_tasks) * 100 || 0;
    
    return ((completionRate * 0.7) + (assignmentUtilization * 0.3)).toFixed(2);
  }
  
  /**
   * Generate category insights
   * @private
   */
  _generateCategoryInsights(categoryData) {
    const insights = [];
    
    const avgCompletionRate = categoryData.reduce((sum, cat) => 
      sum + (cat.completed / cat.assignments * 100 || 0), 0) / categoryData.length;
    
    if (avgCompletionRate < 50) {
      insights.push('Overall task completion rates could be improved');
    }
    
    return insights;
  }
  
  /**
   * Stub methods for data retrieval - to be implemented with actual queries
   * @private
   */
  async _getTrendData(child_id, family_id, period) {
    // Return monthly/weekly trend data
    return [];
  }
  
  async _getCategoryData(family_id, start_date, end_date) {
    // Return category performance data
    return [];
  }
  
  async _getAllChildrenMetrics(family_id, start_date, end_date) {
    // Return metrics for all children
    return [];
  }
  
  _calculateRankings(childrenData) {
    return childrenData.sort((a, b) => b.completion_rate - a.completion_rate);
  }
  
  _calculateFamilyAverages(childrenData) {
    return {
      avg_completion_rate: (childrenData.reduce((sum, child) => 
        sum + child.completion_rate, 0) / childrenData.length).toFixed(2)
    };
  }
  
  async _getMostImprovedChild(family_id, start_date, end_date) {
    // Calculate improvement over time
    return null;
  }
  
  _formatComparisonChartData(childrenData) {
    return childrenData.map(child => ({
      name: child.full_name,
      completion_rate: child.completion_rate
    }));
  }
  
  async _comparePriorityTypes(family_id, start_date, end_date) {
    return [];
  }
  
  async _compareCategoryTypes(family_id, start_date, end_date) {
    return [];
  }
  
  async _compareRecurringTypes(family_id, start_date, end_date) {
    return [];
  }
  
  _generateTaskTypeInsights(priority, category, recurring) {
    return [];
  }
  
  async _getTaskAssignmentData(assignment_id) {
    return {};
  }
  
  async _getChildTaskHistory(child_id, family_id) {
    return [];
  }
  
  _calculateCompletionProbability(taskData, childHistory) {
    return 75; // Placeholder
  }
  
  _estimateCompletionTime(taskData, childHistory) {
    return '2 days';
  }
  
  _calculateConfidenceLevel(childHistory) {
    return childHistory.length > 10 ? 'High' : 'Medium';
  }
  
  _identifyInfluencingFactors(taskData, childHistory) {
    return ['Task complexity', 'Historical performance', 'Time available'];
  }
  
  async _getFamilyHistoricalData(family_id) {
    return [];
  }
  
  _forecastTasks(historicalData) {
    return { estimated_tasks: 25 };
  }
  
  _forecastPoints(historicalData) {
    return { estimated_points: 500 };
  }
  
  _forecastRedemptions(historicalData) {
    return { estimated_redemptions: 3 };
  }
  
  _calculateForecastConfidence(historicalData) {
    return historicalData.length > 30 ? 'High' : 'Medium';
  }
}

module.exports = new AnalyticsService();
