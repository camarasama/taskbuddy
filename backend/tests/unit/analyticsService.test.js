// ============================================================================
// Analytics Service Unit Tests
// Author: Souleymane Camara - BIT1007326
// ============================================================================

const analyticsService = require('../../services/analytics.service');
const pool = require('../../config/database');

// Mock the database pool
jest.mock('../../config/database');

describe('Analytics Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // PERFORMANCE SCORE CALCULATION TESTS
  // ==========================================================================

  describe('calculatePerformanceScore', () => {
    
    test('should calculate performance score correctly', async () => {
      const mockMetrics = {
        total_tasks: 10,
        completed_tasks: 8,
        rejected_tasks: 1,
        overdue_tasks: 1,
        ontime_completions: 7,
        avg_completion_time_hours: 24,
        active_days: 5
      };

      pool.query.mockResolvedValueOnce({ rows: [mockMetrics] });

      const result = await analyticsService.calculatePerformanceScore({
        child_id: 1,
        family_id: 1
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('overall_score');
      expect(result.data).toHaveProperty('rating');
      expect(result.data).toHaveProperty('breakdown');
      expect(result.data.breakdown).toHaveProperty('completion');
      expect(result.data.breakdown).toHaveProperty('punctuality');
      expect(result.data.breakdown).toHaveProperty('quality');
      expect(result.data.breakdown).toHaveProperty('consistency');
    });

    test('should handle perfect performance (100% completion)', async () => {
      const mockMetrics = {
        total_tasks: 10,
        completed_tasks: 10,
        rejected_tasks: 0,
        overdue_tasks: 0,
        ontime_completions: 10,
        avg_completion_time_hours: 12,
        active_days: 10
      };

      pool.query.mockResolvedValueOnce({ rows: [mockMetrics] });

      const result = await analyticsService.calculatePerformanceScore({
        child_id: 1,
        family_id: 1
      });

      expect(result.success).toBe(true);
      expect(parseFloat(result.data.overall_score)).toBeGreaterThan(90);
      expect(result.data.rating).toBe('Excellent');
    });

    test('should handle poor performance (low completion)', async () => {
      const mockMetrics = {
        total_tasks: 10,
        completed_tasks: 3,
        rejected_tasks: 3,
        overdue_tasks: 4,
        ontime_completions: 1,
        avg_completion_time_hours: 72,
        active_days: 2
      };

      pool.query.mockResolvedValueOnce({ rows: [mockMetrics] });

      const result = await analyticsService.calculatePerformanceScore({
        child_id: 1,
        family_id: 1
      });

      expect(result.success).toBe(true);
      expect(parseFloat(result.data.overall_score)).toBeLessThan(50);
      expect(result.data.rating).toBe('Needs Improvement');
    });

    test('should handle zero tasks scenario', async () => {
      const mockMetrics = {
        total_tasks: 0,
        completed_tasks: 0,
        rejected_tasks: 0,
        overdue_tasks: 0,
        ontime_completions: 0,
        avg_completion_time_hours: null,
        active_days: 0
      };

      pool.query.mockResolvedValueOnce({ rows: [mockMetrics] });

      const result = await analyticsService.calculatePerformanceScore({
        child_id: 1,
        family_id: 1
      });

      expect(result.success).toBe(true);
      expect(parseFloat(result.data.overall_score)).toBe(0);
    });

  });

  // ==========================================================================
  // FAMILY ENGAGEMENT CALCULATION TESTS
  // ==========================================================================

  describe('calculateFamilyEngagement', () => {
    
    test('should calculate family engagement score correctly', async () => {
      const mockMetrics = {
        total_tasks_created: 20,
        total_assignments: 50,
        completed_assignments: 40,
        active_children: 2,
        active_parents: 2,
        redemption_requests: 5,
        active_days: 15
      };

      pool.query.mockResolvedValueOnce({ rows: [mockMetrics] });

      const result = await analyticsService.calculateFamilyEngagement({
        family_id: 1
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('engagement_score');
      expect(result.data).toHaveProperty('engagement_level');
      expect(result.data).toHaveProperty('breakdown');
      expect(result.data).toHaveProperty('recommendations');
    });

    test('should provide recommendations for low engagement', async () => {
      const mockMetrics = {
        total_tasks_created: 5,
        total_assignments: 5,
        completed_assignments: 2,
        active_children: 1,
        active_parents: 1,
        redemption_requests: 0,
        active_days: 3
      };

      pool.query.mockResolvedValueOnce({ rows: [mockMetrics] });

      const result = await analyticsService.calculateFamilyEngagement({
        family_id: 1
      });

      expect(result.success).toBe(true);
      expect(parseFloat(result.data.engagement_score)).toBeLessThan(50);
      expect(result.data.recommendations).toBeInstanceOf(Array);
      expect(result.data.recommendations.length).toBeGreaterThan(0);
    });

  });

  // ==========================================================================
  // TREND ANALYSIS TESTS
  // ==========================================================================

  describe('analyzePerformanceTrend', () => {
    
    test('should identify improving trend', async () => {
      const mockTrendData = [
        { completion_rate: 85, month: '2025-03' },
        { completion_rate: 75, month: '2025-02' },
        { completion_rate: 65, month: '2025-01' }
      ];

      // Mock implementation for private method
      pool.query.mockResolvedValueOnce({ rows: mockTrendData });

      const result = await analyticsService.analyzePerformanceTrend({
        child_id: 1,
        family_id: 1,
        period: 'monthly'
      });

      expect(result.success).toBe(true);
      expect(result.data.trend_direction).toBe('Improving');
      expect(parseFloat(result.data.rate_of_change)).toBeGreaterThan(0);
    });

    test('should identify declining trend', async () => {
      const mockTrendData = [
        { completion_rate: 50, month: '2025-03' },
        { completion_rate: 70, month: '2025-02' },
        { completion_rate: 85, month: '2025-01' }
      ];

      pool.query.mockResolvedValueOnce({ rows: mockTrendData });

      const result = await analyticsService.analyzePerformanceTrend({
        child_id: 1,
        family_id: 1,
        period: 'monthly'
      });

      expect(result.success).toBe(true);
      expect(result.data.trend_direction).toBe('Declining');
      expect(parseFloat(result.data.rate_of_change)).toBeLessThan(0);
    });

    test('should identify stable trend', async () => {
      const mockTrendData = [
        { completion_rate: 75, month: '2025-03' },
        { completion_rate: 74, month: '2025-02' },
        { completion_rate: 76, month: '2025-01' }
      ];

      pool.query.mockResolvedValueOnce({ rows: mockTrendData });

      const result = await analyticsService.analyzePerformanceTrend({
        child_id: 1,
        family_id: 1,
        period: 'monthly'
      });

      expect(result.success).toBe(true);
      expect(result.data.trend_direction).toBe('Stable');
    });

  });

  // ==========================================================================
  // COMPARATIVE ANALYSIS TESTS
  // ==========================================================================

  describe('compareChildrenPerformance', () => {
    
    test('should compare multiple children correctly', async () => {
      const mockChildrenData = [
        { 
          user_id: 1, 
          full_name: 'John', 
          completion_rate: 85,
          tasks_completed: 17 
        },
        { 
          user_id: 2, 
          full_name: 'Jane', 
          completion_rate: 75,
          tasks_completed: 15 
        }
      ];

      pool.query.mockResolvedValueOnce({ rows: mockChildrenData });

      const result = await analyticsService.compareChildrenPerformance({
        family_id: 1
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('rankings');
      expect(result.data.rankings).toBeInstanceOf(Array);
      expect(result.data.rankings.length).toBe(2);
      expect(result.data).toHaveProperty('family_averages');
      expect(result.data).toHaveProperty('top_performer');
    });

    test('should handle single child family', async () => {
      const mockChildData = [
        { 
          user_id: 1, 
          full_name: 'John', 
          completion_rate: 80,
          tasks_completed: 16 
        }
      ];

      pool.query.mockResolvedValueOnce({ rows: mockChildData });

      const result = await analyticsService.compareChildrenPerformance({
        family_id: 1
      });

      expect(result.success).toBe(true);
      expect(result.data.rankings.length).toBe(1);
    });

    test('should handle family with no children', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await analyticsService.compareChildrenPerformance({
        family_id: 1
      });

      expect(result.success).toBe(true);
      expect(result.data.message).toContain('No children');
    });

  });

  // ==========================================================================
  // PREDICTIVE ANALYTICS TESTS
  // ==========================================================================

  describe('predictTaskCompletion', () => {
    
    test('should predict high completion probability for consistent performer', async () => {
      const mockTaskData = {
        assignment_id: 1,
        child_id: 1,
        family_id: 1,
        priority: 'medium'
      };

      const mockChildHistory = [
        { status: 'approved' },
        { status: 'approved' },
        { status: 'approved' },
        { status: 'approved' },
        { status: 'rejected' }
      ];

      pool.query.mockResolvedValueOnce({ rows: [mockTaskData] });
      pool.query.mockResolvedValueOnce({ rows: mockChildHistory });

      const result = await analyticsService.predictTaskCompletion({
        assignment_id: 1
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('completion_probability');
      expect(result.data).toHaveProperty('confidence_level');
      expect(parseFloat(result.data.completion_probability)).toBeGreaterThan(50);
    });

  });

  // ==========================================================================
  // ERROR HANDLING TESTS
  // ==========================================================================

  describe('Error Handling', () => {
    
    test('should handle database errors gracefully', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      await expect(
        analyticsService.calculatePerformanceScore({
          child_id: 1,
          family_id: 1
        })
      ).rejects.toThrow('Database error');
    });

    test('should handle invalid input parameters', async () => {
      await expect(
        analyticsService.calculatePerformanceScore({})
      ).rejects.toThrow();
    });

  });

  // ==========================================================================
  // CALCULATION ACCURACY TESTS
  // ==========================================================================

  describe('Score Calculation Accuracy', () => {
    
    test('should calculate completion score accurately', async () => {
      const mockMetrics = {
        total_tasks: 20,
        completed_tasks: 16,
        rejected_tasks: 2,
        overdue_tasks: 2,
        ontime_completions: 14,
        active_days: 10
      };

      pool.query.mockResolvedValueOnce({ rows: [mockMetrics] });

      const result = await analyticsService.calculatePerformanceScore({
        child_id: 1,
        family_id: 1
      });

      // 16/20 = 80% completion rate
      expect(parseFloat(result.data.breakdown.completion.score)).toBe(80.00);
    });

    test('should weight scores correctly in overall calculation', async () => {
      const mockMetrics = {
        total_tasks: 10,
        completed_tasks: 10,  // 100% completion (35% weight)
        rejected_tasks: 0,
        overdue_tasks: 0,
        ontime_completions: 10,  // 100% punctuality (25% weight)
        active_days: 10  // High consistency (15% weight)
      };

      pool.query.mockResolvedValueOnce({ rows: [mockMetrics] });

      const result = await analyticsService.calculatePerformanceScore({
        child_id: 1,
        family_id: 1
      });

      // With perfect scores, overall should be very high
      expect(parseFloat(result.data.overall_score)).toBeGreaterThanOrEqual(90);
    });

  });

});
