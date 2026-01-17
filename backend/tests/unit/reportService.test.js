// ============================================================================
// Report Service Unit Tests
// Author: Souleymane Camara - BIT1007326
// ============================================================================

const reportService = require('../../services/report.service');
const pool = require('../../config/database');

// Mock the database pool
jest.mock('../../config/database');

describe('Report Service', () => {
  
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // CHILD PERFORMANCE REPORT TESTS
  // ==========================================================================

  describe('generateChildPerformanceReport', () => {
    
    test('should generate child performance report successfully', async () => {
      // Mock query results
      const mockChildData = {
        user_id: 1,
        full_name: 'John Doe',
        profile_picture: null,
        current_points: 150,
        total_tasks_assigned: '10',
        tasks_completed: '8',
        tasks_rejected: '1',
        tasks_pending: '1',
        tasks_in_progress: '0',
        tasks_overdue: '0',
        completion_rate: '80.00',
        total_points_earned: '150',
        avg_points_per_task: '18.75',
        avg_completion_time_hours: '24.50'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockChildData] });
      pool.query.mockResolvedValueOnce({ rows: [] }); // recent activity
      pool.query.mockResolvedValueOnce({ rows: [] }); // priority distribution
      pool.query.mockResolvedValueOnce({ rows: [] }); // monthly trends

      const result = await reportService.generateChildPerformanceReport({
        child_id: 1,
        family_id: 1,
        start_date: null,
        end_date: null
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('child');
      expect(result.data.child.full_name).toBe('John Doe');
      expect(pool.query).toHaveBeenCalledTimes(4);
    });

    test('should handle invalid child_id', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        reportService.generateChildPerformanceReport({
          child_id: 999,
          family_id: 1
        })
      ).rejects.toThrow();
    });

    test('should apply date filters correctly', async () => {
      const mockChildData = {
        user_id: 1,
        full_name: 'John Doe',
        current_points: 150,
        total_tasks_assigned: '5',
        tasks_completed: '4',
        completion_rate: '80.00'
      };

      pool.query.mockResolvedValue({ rows: [mockChildData] });

      await reportService.generateChildPerformanceReport({
        child_id: 1,
        family_id: 1,
        start_date: '2025-01-01',
        end_date: '2025-01-31'
      });

      // Verify date filter was applied
      expect(pool.query).toHaveBeenCalled();
      const firstCall = pool.query.mock.calls[0];
      expect(firstCall[0]).toContain('2025-01-01');
    });

  });

  // ==========================================================================
  // TASK ANALYTICS REPORT TESTS
  // ==========================================================================

  describe('generateTaskAnalyticsReport', () => {
    
    test('should generate task analytics report successfully', async () => {
      const mockOverview = {
        total_tasks_created: '20',
        total_assignments: '50',
        completed_assignments: '40',
        overall_completion_rate: '80.00',
        total_points_awarded: '800'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockOverview] });
      pool.query.mockResolvedValueOnce({ rows: [] }); // category breakdown
      pool.query.mockResolvedValueOnce({ rows: [] }); // top tasks
      pool.query.mockResolvedValueOnce({ rows: [] }); // status distribution

      const result = await reportService.generateTaskAnalyticsReport({
        family_id: 1,
        start_date: null,
        end_date: null
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('overview');
      expect(result.data.overview.total_tasks_created).toBe('20');
    });

    test('should filter by category when provided', async () => {
      pool.query.mockResolvedValue({ rows: [{}] });

      await reportService.generateTaskAnalyticsReport({
        family_id: 1,
        category: 'Homework'
      });

      const firstCall = pool.query.mock.calls[0];
      expect(firstCall[0]).toContain('Homework');
    });

  });

  // ==========================================================================
  // REWARD ANALYTICS REPORT TESTS
  // ==========================================================================

  describe('generateRewardAnalyticsReport', () => {
    
    test('should generate reward analytics report successfully', async () => {
      const mockOverview = {
        total_rewards_available: '10',
        total_redemption_requests: '25',
        approved_redemptions: '20',
        approval_rate: '80.00',
        total_points_spent: '500'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockOverview] });
      pool.query.mockResolvedValueOnce({ rows: [] }); // popular rewards
      pool.query.mockResolvedValueOnce({ rows: [] }); // child stats
      pool.query.mockResolvedValueOnce({ rows: [] }); // reward status

      const result = await reportService.generateRewardAnalyticsReport({
        family_id: 1
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('overview');
      expect(result.data.overview.approval_rate).toBe('80.00');
    });

  });

  // ==========================================================================
  // FAMILY SUMMARY REPORT TESTS
  // ==========================================================================

  describe('generateFamilySummaryReport', () => {
    
    test('should generate family summary report successfully', async () => {
      const mockFamilyInfo = {
        family_id: 1,
        family_name: 'The Doe Family',
        total_members: '4',
        children_count: '2',
        total_family_points: '300'
      };

      const mockActivityStats = {
        total_tasks_created: '20',
        completed_tasks: '15',
        total_points_earned: '300'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockFamilyInfo] });
      pool.query.mockResolvedValueOnce({ rows: [mockActivityStats] });
      pool.query.mockResolvedValueOnce({ rows: [] }); // top children
      pool.query.mockResolvedValueOnce({ rows: [] }); // recent activity
      pool.query.mockResolvedValueOnce({ rows: [] }); // weekly trend

      const result = await reportService.generateFamilySummaryReport({
        family_id: 1
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('family_info');
      expect(result.data.family_info.family_name).toBe('The Doe Family');
    });

    test('should handle non-existent family', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        reportService.generateFamilySummaryReport({ family_id: 999 })
      ).rejects.toThrow('Family not found');
    });

  });

  // ==========================================================================
  // PARENT ACTIVITY REPORT TESTS
  // ==========================================================================

  describe('generateParentActivityReport', () => {
    
    test('should generate parent activity report successfully', async () => {
      const mockParentData = {
        user_id: 2,
        full_name: 'Jane Doe',
        role: 'parent',
        tasks_created: '20',
        tasks_reviewed: '15',
        tasks_approved: '12',
        approval_rate: '80.00'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockParentData] });
      pool.query.mockResolvedValueOnce({ rows: [] }); // recent actions
      pool.query.mockResolvedValueOnce({ rows: [] }); // tasks by category

      const result = await reportService.generateParentActivityReport({
        parent_id: 2,
        family_id: 1
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('parent');
      expect(result.data.parent.full_name).toBe('Jane Doe');
    });

  });

  // ==========================================================================
  // ERROR HANDLING TESTS
  // ==========================================================================

  describe('Error Handling', () => {
    
    test('should handle database errors gracefully', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(
        reportService.generateChildPerformanceReport({
          child_id: 1,
          family_id: 1
        })
      ).rejects.toThrow('Database connection failed');
    });

    test('should handle missing required parameters', async () => {
      await expect(
        reportService.generateChildPerformanceReport({})
      ).rejects.toThrow();
    });

  });

  // ==========================================================================
  // DATE RANGE TESTS
  // ==========================================================================

  describe('Date Range Handling', () => {
    
    test('should handle all-time reports (no date filters)', async () => {
      pool.query.mockResolvedValue({ rows: [{}] });

      await reportService.generateTaskAnalyticsReport({
        family_id: 1,
        start_date: null,
        end_date: null
      });

      const firstCall = pool.query.mock.calls[0];
      // Should not contain date filters
      expect(firstCall[0]).not.toContain('BETWEEN');
    });

    test('should handle custom date ranges', async () => {
      pool.query.mockResolvedValue({ rows: [{}] });

      await reportService.generateTaskAnalyticsReport({
        family_id: 1,
        start_date: '2025-01-01',
        end_date: '2025-01-31'
      });

      const firstCall = pool.query.mock.calls[0];
      expect(firstCall[0]).toContain('2025-01-01');
      expect(firstCall[0]).toContain('2025-01-31');
    });

  });

});
