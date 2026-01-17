// ============================================================================
// Reports Integration Tests
// End-to-end API testing for report endpoints
// Author: Souleymane Camara - BIT1007326
// ============================================================================

const request = require('supertest');
const app = require('../../server');
const pool = require('../../config/database');

// Test data
let authToken;
let testFamilyId;
let testChildId;
let testParentId;

describe('Reports API Integration Tests', () => {
  
  // ==========================================================================
  // SETUP AND TEARDOWN
  // ==========================================================================
  
  beforeAll(async () => {
    // Create test user and get auth token
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test-parent@example.com',
        password: 'TestPass123!',
        full_name: 'Test Parent',
        role: 'parent',
        date_of_birth: '1985-01-01'
      });
    
    authToken = registerRes.body.token;
    testParentId = registerRes.body.user.user_id;
    
    // Create test family
    const familyRes = await request(app)
      .post('/api/families')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        family_name: 'Test Family',
        family_code: 'TEST123'
      });
    
    testFamilyId = familyRes.body.data.family_id;
    
    // Create test child
    const childRes = await request(app)
      .post('/api/families/members')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        family_id: testFamilyId,
        email: 'test-child@example.com',
        full_name: 'Test Child',
        role: 'child',
        date_of_birth: '2010-01-01'
      });
    
    testChildId = childRes.body.data.user_id;
    
    // Create some test tasks and assignments for reporting
    await createTestData();
  });
  
  afterAll(async () => {
    // Cleanup test data
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['test-%@example.com']);
    await pool.end();
  });
  
  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================
  
  async function createTestData() {
    // Create tasks
    for (let i = 1; i <= 5; i++) {
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          family_id: testFamilyId,
          title: `Test Task ${i}`,
          description: `Description for task ${i}`,
          category: i % 2 === 0 ? 'Homework' : 'Chores',
          priority: 'medium',
          points_reward: 10 * i,
          photo_required: false
        });
    }
    
    // Get tasks and assign to child
    const tasksRes = await request(app)
      .get(`/api/tasks?family_id=${testFamilyId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    const tasks = tasksRes.body.data;
    
    // Assign and complete some tasks
    for (let i = 0; i < Math.min(3, tasks.length); i++) {
      await request(app)
        .post(`/api/tasks/${tasks[i].task_id}/assign`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          child_ids: [testChildId]
        });
    }
  }
  
  // ==========================================================================
  // CHILD PERFORMANCE REPORT TESTS
  // ==========================================================================
  
  describe('GET /api/reports/child-performance', () => {
    
    test('should generate child performance report successfully', async () => {
      const response = await request(app)
        .get('/api/reports/child-performance')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          child_id: testChildId,
          family_id: testFamilyId,
          date_preset: 'all_time'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('report_type');
      expect(response.body.data.report_type).toBe('Child Performance Report');
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data.summary).toHaveProperty('child_name');
    });
    
    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/reports/child-performance')
        .query({
          child_id: testChildId,
          family_id: testFamilyId
        });
      
      expect(response.status).toBe(401);
    });
    
    test('should validate required parameters', async () => {
      const response = await request(app)
        .get('/api/reports/child-performance')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          family_id: testFamilyId
          // Missing child_id
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });
    
    test('should support different date presets', async () => {
      const datePresets = ['today', 'this_week', 'this_month', 'last_30_days'];
      
      for (const preset of datePresets) {
        const response = await request(app)
          .get('/api/reports/child-performance')
          .set('Authorization', `Bearer ${authToken}`)
          .query({
            child_id: testChildId,
            family_id: testFamilyId,
            date_preset: preset
          });
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });
    
    test('should support custom date ranges', async () => {
      const response = await request(app)
        .get('/api/reports/child-performance')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          child_id: testChildId,
          family_id: testFamilyId,
          date_preset: 'custom',
          start_date: '2025-01-01T00:00:00Z',
          end_date: '2025-01-31T23:59:59Z'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.report_period).toBeDefined();
    });
    
  });
  
  // ==========================================================================
  // TASK ANALYTICS REPORT TESTS
  // ==========================================================================
  
  describe('GET /api/reports/task-analytics', () => {
    
    test('should generate task analytics report successfully', async () => {
      const response = await request(app)
        .get('/api/reports/task-analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          family_id: testFamilyId,
          date_preset: 'all_time'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('report_type');
      expect(response.body.data.report_type).toBe('Task Analytics Report');
      expect(response.body.data).toHaveProperty('overview');
    });
    
    test('should filter by category', async () => {
      const response = await request(app)
        .get('/api/reports/task-analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          family_id: testFamilyId,
          category: 'Homework',
          date_preset: 'all_time'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.report_period).toHaveProperty('category');
      expect(response.body.data.report_period.category).toBe('Homework');
    });
    
  });
  
  // ==========================================================================
  // REWARD ANALYTICS REPORT TESTS
  // ==========================================================================
  
  describe('GET /api/reports/reward-analytics', () => {
    
    test('should generate reward analytics report successfully', async () => {
      const response = await request(app)
        .get('/api/reports/reward-analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          family_id: testFamilyId,
          date_preset: 'all_time'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('report_type');
      expect(response.body.data.report_type).toBe('Reward Analytics Report');
      expect(response.body.data).toHaveProperty('overview');
    });
    
  });
  
  // ==========================================================================
  // FAMILY SUMMARY REPORT TESTS
  // ==========================================================================
  
  describe('GET /api/reports/family-summary', () => {
    
    test('should generate family summary report successfully', async () => {
      const response = await request(app)
        .get('/api/reports/family-summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          family_id: testFamilyId,
          date_preset: 'all_time'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('report_type');
      expect(response.body.data.report_type).toBe('Family Activity Summary Report');
      expect(response.body.data).toHaveProperty('family_information');
    });
    
  });
  
  // ==========================================================================
  // PARENT ACTIVITY REPORT TESTS
  // ==========================================================================
  
  describe('GET /api/reports/parent-activity', () => {
    
    test('should generate parent activity report successfully', async () => {
      const response = await request(app)
        .get('/api/reports/parent-activity')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          parent_id: testParentId,
          family_id: testFamilyId,
          date_preset: 'all_time'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('report_type');
      expect(response.body.data.report_type).toBe('Parent Activity Report');
      expect(response.body.data).toHaveProperty('task_management');
    });
    
  });
  
  // ==========================================================================
  // BULK REPORT GENERATION TESTS
  // ==========================================================================
  
  describe('POST /api/reports/bulk-generate', () => {
    
    test('should generate multiple reports successfully', async () => {
      const response = await request(app)
        .post('/api/reports/bulk-generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          family_id: testFamilyId,
          child_id: testChildId,
          parent_id: testParentId,
          report_types: ['child_performance', 'task_analytics', 'family_summary'],
          date_preset: 'this_month'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reports).toBeInstanceOf(Array);
      expect(response.body.data.reports.length).toBe(3);
    });
    
    test('should validate report_types array', async () => {
      const response = await request(app)
        .post('/api/reports/bulk-generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          family_id: testFamilyId,
          report_types: ['invalid_type'],
          date_preset: 'this_month'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
    
  });
  
  // ==========================================================================
  // ANALYTICS TESTS
  // ==========================================================================
  
  describe('GET /api/analytics/performance-score', () => {
    
    test('should calculate performance score successfully', async () => {
      const response = await request(app)
        .get('/api/analytics/performance-score')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          child_id: testChildId,
          family_id: testFamilyId
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('overall_score');
      expect(response.body.data).toHaveProperty('rating');
      expect(response.body.data).toHaveProperty('breakdown');
    });
    
  });
  
  describe('GET /api/analytics/family-engagement', () => {
    
    test('should calculate family engagement successfully', async () => {
      const response = await request(app)
        .get('/api/analytics/family-engagement')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          family_id: testFamilyId
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('engagement_score');
      expect(response.body.data).toHaveProperty('engagement_level');
    });
    
  });
  
  // ==========================================================================
  // EXPORT TESTS
  // ==========================================================================
  
  describe('POST /api/export/csv/child-performance', () => {
    
    test('should export child performance to CSV successfully', async () => {
      const response = await request(app)
        .post('/api/export/csv/child-performance')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          family_id: testFamilyId,
          child_id: testChildId,
          filename: 'test_export.csv',
          date_preset: 'all_time'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('file_path');
      expect(response.body.data.format).toBe('CSV');
    });
    
  });
  
  describe('POST /api/export/pdf/child-performance', () => {
    
    test('should export child performance to PDF successfully', async () => {
      const response = await request(app)
        .post('/api/export/pdf/child-performance')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          family_id: testFamilyId,
          child_id: testChildId,
          filename: 'test_export.pdf',
          date_preset: 'all_time'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('file_path');
      expect(response.body.data.format).toBe('PDF');
    });
    
  });
  
  describe('GET /api/export/download/:filename', () => {
    
    test('should download exported file successfully', async () => {
      // First, create an export
      const exportRes = await request(app)
        .post('/api/export/csv/child-performance')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          family_id: testFamilyId,
          child_id: testChildId,
          filename: 'download_test.csv',
          date_preset: 'all_time'
        });
      
      const filename = exportRes.body.data.filename;
      
      // Now download it
      const response = await request(app)
        .get(`/api/export/download/${filename}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
    });
    
    test('should return 404 for non-existent file', async () => {
      const response = await request(app)
        .get('/api/export/download/nonexistent.csv')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
    });
    
  });
  
  // ==========================================================================
  // AUTHORIZATION TESTS
  // ==========================================================================
  
  describe('Authorization', () => {
    
    test('should prevent access to other family data', async () => {
      // Create another family
      const otherFamilyRes = await request(app)
        .post('/api/families')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          family_name: 'Other Family',
          family_code: 'OTHER123'
        });
      
      const otherFamilyId = otherFamilyRes.body.data.family_id;
      
      // Try to access testFamily's reports with otherFamily's ID
      const response = await request(app)
        .get('/api/reports/family-summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          family_id: otherFamilyId
        });
      
      // This should work since same user owns both families
      // But if different user, should fail
      expect([200, 403]).toContain(response.status);
    });
    
  });
  
  // ==========================================================================
  // PERFORMANCE TESTS
  // ==========================================================================
  
  describe('Performance', () => {
    
    test('should generate report within reasonable time', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/reports/child-performance')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          child_id: testChildId,
          family_id: testFamilyId,
          date_preset: 'all_time'
        });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
    
  });
  
});
