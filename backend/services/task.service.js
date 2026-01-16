// ============================================================================
// Task Service
// Task-related business logic and utilities
// ============================================================================

const pool = require('../config/database');
const notificationService = require('./notification.service');

// ============================================================================
// CREATE RECURRING TASK INSTANCES
// ============================================================================
exports.createRecurringInstances = async (taskId, startDate, endDate) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get task details
    const taskResult = await client.query(
      'SELECT * FROM tasks WHERE task_id = $1 AND is_recurring = TRUE',
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      throw new Error('Recurring task not found');
    }

    const task = taskResult.rows[0];
    const instances = [];

    // Generate instances based on recurrence pattern
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      // Create task instance (you might want to create a separate table for instances)
      // For now, we'll create assignments directly

      // Get children assigned to this task
      const childrenResult = await client.query(
        `SELECT DISTINCT assigned_to FROM task_assignments WHERE task_id = $1`,
        [taskId]
      );

      for (const child of childrenResult.rows) {
        const dueDate = new Date(currentDate);
        dueDate.setHours(23, 59, 59); // End of day

        // Create assignment
        await client.query(
          `INSERT INTO task_assignments (task_id, assigned_to, assigned_by, due_date)
           VALUES ($1, $2, $3, $4)`,
          [taskId, child.assigned_to, task.created_by, dueDate]
        );

        instances.push({ taskId, childId: child.assigned_to, dueDate });
      }

      // Move to next occurrence
      switch (task.recurrence_pattern) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        default:
          currentDate = end; // Stop if pattern is unknown
      }
    }

    await client.query('COMMIT');
    return instances;

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating recurring instances:', error);
    throw error;
  } finally {
    client.release();
  }
};

// ============================================================================
// DUPLICATE TASK
// ============================================================================
exports.duplicateTask = async (taskId, userId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get original task
    const taskResult = await client.query(
      'SELECT * FROM tasks WHERE task_id = $1',
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      throw new Error('Task not found');
    }

    const originalTask = taskResult.rows[0];

    // Create duplicate
    const duplicateResult = await client.query(
      `INSERT INTO tasks (
        family_id, created_by, title, description, category, tags, 
        priority, points_reward, photo_required, deadline, 
        is_recurring, recurrence_pattern, recurrence_days, status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'active')
       RETURNING *`,
      [
        originalTask.family_id,
        userId,
        `${originalTask.title} (Copy)`,
        originalTask.description,
        originalTask.category,
        originalTask.tags,
        originalTask.priority,
        originalTask.points_reward,
        originalTask.photo_required,
        originalTask.deadline,
        originalTask.is_recurring,
        originalTask.recurrence_pattern,
        originalTask.recurrence_days
      ]
    );

    await client.query('COMMIT');
    return duplicateResult.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error duplicating task:', error);
    throw error;
  } finally {
    client.release();
  }
};

// ============================================================================
// ARCHIVE COMPLETED TASKS
// ============================================================================
exports.archiveCompletedTasks = async (familyId, olderThanDays = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await pool.query(
      `UPDATE tasks 
       SET status = 'archived'
       WHERE family_id = $1 
         AND status = 'active'
         AND task_id IN (
           SELECT DISTINCT task_id FROM task_assignments 
           WHERE status = 'approved' 
           AND reviewed_at < $2
         )
       RETURNING task_id`,
      [familyId, cutoffDate]
    );

    console.log(`Archived ${result.rows.length} completed tasks`);
    return result.rows.length;

  } catch (error) {
    console.error('Error archiving tasks:', error);
    throw error;
  }
};

// ============================================================================
// GET TASK STATISTICS
// ============================================================================
exports.getTaskStatistics = async (familyId) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE status = 'active') as active_tasks,
        COUNT(*) FILTER (WHERE is_recurring = TRUE) as recurring_tasks,
        AVG(points_reward) as avg_points,
        COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_tasks,
        COUNT(*) FILTER (WHERE priority = 'high') as high_priority_tasks
       FROM tasks
       WHERE family_id = $1`,
      [familyId]
    );

    return result.rows[0];

  } catch (error) {
    console.error('Error getting task statistics:', error);
    throw error;
  }
};

// ============================================================================
// GET OVERDUE TASKS
// ============================================================================
exports.getOverdueTasks = async (familyId) => {
  try {
    const result = await pool.query(
      `SELECT t.*, ta.assignment_id, ta.assigned_to, u.full_name as child_name
       FROM tasks t
       INNER JOIN task_assignments ta ON t.task_id = ta.task_id
       INNER JOIN users u ON ta.assigned_to = u.user_id
       WHERE t.family_id = $1 
         AND ta.due_date < CURRENT_TIMESTAMP
         AND ta.status NOT IN ('approved', 'rejected')
       ORDER BY ta.due_date ASC`,
      [familyId]
    );

    return result.rows;

  } catch (error) {
    console.error('Error getting overdue tasks:', error);
    throw error;
  }
};

// ============================================================================
// NOTIFY ABOUT OVERDUE TASKS
// ============================================================================
exports.notifyOverdueTasks = async () => {
  try {
    const overdueTasks = await pool.query(
      `SELECT ta.*, t.title, t.family_id, u.user_id, u.full_name
       FROM task_assignments ta
       INNER JOIN tasks t ON ta.task_id = t.task_id
       INNER JOIN users u ON ta.assigned_to = u.user_id
       WHERE ta.due_date < CURRENT_TIMESTAMP
         AND ta.status NOT IN ('approved', 'rejected', 'overdue')`
    );

    for (const task of overdueTasks.rows) {
      // Mark as overdue
      await pool.query(
        'UPDATE task_assignments SET status = $1 WHERE assignment_id = $2',
        ['overdue', task.assignment_id]
      );

      // Send notification
      await notificationService.createNotification(
        task.user_id,
        'task_overdue',
        'Task Overdue',
        `Your task "${task.title}" is now overdue. Please complete it as soon as possible.`,
        'assignment',
        task.assignment_id,
        true
      );

      // Notify parents
      const parentsResult = await pool.query(
        `SELECT user_id FROM family_members 
         WHERE family_id = $1 AND relationship IN ('parent', 'spouse')`,
        [task.family_id]
      );

      for (const parent of parentsResult.rows) {
        await notificationService.createNotification(
          parent.user_id,
          'task_overdue',
          'Child Task Overdue',
          `${task.full_name}'s task "${task.title}" is overdue.`,
          'assignment',
          task.assignment_id,
          false // Don't send email to parents for this
        );
      }
    }

    console.log(`Processed ${overdueTasks.rows.length} overdue tasks`);

  } catch (error) {
    console.error('Error notifying overdue tasks:', error);
  }
};

// ============================================================================
// CALCULATE TASK COMPLETION RATE
// ============================================================================
exports.calculateCompletionRate = async (familyId, childId = null) => {
  try {
    let query = `
      SELECT 
        COUNT(*) as total_assignments,
        COUNT(*) FILTER (WHERE status = 'approved') as completed,
        ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'approved') / 
          NULLIF(COUNT(*), 0), 2) as completion_rate
      FROM task_assignments ta
      INNER JOIN tasks t ON ta.task_id = t.task_id
      WHERE t.family_id = $1
    `;

    const params = [familyId];

    if (childId) {
      query += ' AND ta.assigned_to = $2';
      params.push(childId);
    }

    const result = await pool.query(query, params);
    return result.rows[0];

  } catch (error) {
    console.error('Error calculating completion rate:', error);
    throw error;
  }
};

// ============================================================================
// GET TASK CATEGORIES
// ============================================================================
exports.getTaskCategories = async (familyId) => {
  try {
    const result = await pool.query(
      `SELECT category, COUNT(*) as count
       FROM tasks
       WHERE family_id = $1 AND category IS NOT NULL
       GROUP BY category
       ORDER BY count DESC`,
      [familyId]
    );

    return result.rows;

  } catch (error) {
    console.error('Error getting task categories:', error);
    throw error;
  }
};

// ============================================================================
// VALIDATE TASK ASSIGNMENT
// ============================================================================
exports.validateTaskAssignment = async (taskId, childId) => {
  try {
    // Check if task exists and is active
    const taskResult = await pool.query(
      'SELECT family_id, status FROM tasks WHERE task_id = $1',
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return { valid: false, message: 'Task not found' };
    }

    if (taskResult.rows[0].status !== 'active') {
      return { valid: false, message: 'Task is not active' };
    }

    // Check if child is in the same family
    const memberResult = await pool.query(
      'SELECT member_id FROM family_members WHERE user_id = $1 AND family_id = $2',
      [childId, taskResult.rows[0].family_id]
    );

    if (memberResult.rows.length === 0) {
      return { valid: false, message: 'Child is not a member of this family' };
    }

    return { valid: true };

  } catch (error) {
    console.error('Error validating task assignment:', error);
    throw error;
  }
};
