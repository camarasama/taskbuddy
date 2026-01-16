// ============================================================================
// Task Controller
// Handles task creation, updates, deletion, and retrieval
// ============================================================================

const pool = require('../config/database');

// ============================================================================
// CREATE TASK
// ============================================================================
exports.createTask = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      family_id, title, description, category, tags, priority,
      points_reward, photo_required, deadline, is_recurring,
      recurrence_pattern, recurrence_days
    } = req.body;
    const creatorId = req.user.user_id;

    await client.query('BEGIN');

    // Verify user has permission in this family
    const memberCheck = await client.query(
      `SELECT relationship FROM family_members 
       WHERE family_id = $1 AND user_id = $2 AND relationship IN ('parent', 'spouse')`,
      [family_id, creatorId]
    );

    if (memberCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create tasks in this family'
      });
    }

    // Create task
    const result = await client.query(
      `INSERT INTO tasks (
        family_id, created_by, title, description, category, tags, priority,
        points_reward, photo_required, deadline, is_recurring, 
        recurrence_pattern, recurrence_days
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        family_id, creatorId, title, description, category, tags, priority,
        points_reward, photo_required, deadline, is_recurring,
        recurrence_pattern, recurrence_days
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: {
        task: result.rows[0]
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  } finally {
    client.release();
  }
};

// ============================================================================
// GET TASKS (with filters)
// ============================================================================
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { familyId, status, category, assignedTo, priority, page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;
    let query = `
      SELECT DISTINCT t.*, 
             u.full_name as creator_name,
             f.family_name,
             COUNT(ta.assignment_id) FILTER (WHERE ta.status = 'approved') as completed_count,
             COUNT(ta.assignment_id) as total_assignments
      FROM tasks t
      INNER JOIN users u ON t.created_by = u.user_id
      INNER JOIN families f ON t.family_id = f.family_id
      INNER JOIN family_members fm ON t.family_id = fm.family_id
      LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
      WHERE fm.user_id = $1
    `;
    const values = [userId];
    let paramCount = 2;

    // Add filters
    if (familyId) {
      query += ` AND t.family_id = $${paramCount}`;
      values.push(familyId);
      paramCount++;
    }

    if (status) {
      query += ` AND t.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    if (category) {
      query += ` AND t.category = $${paramCount}`;
      values.push(category);
      paramCount++;
    }

    if (priority) {
      query += ` AND t.priority = $${paramCount}`;
      values.push(priority);
      paramCount++;
    }

    if (assignedTo) {
      query += ` AND EXISTS (
        SELECT 1 FROM task_assignments 
        WHERE task_id = t.task_id AND assigned_to = $${paramCount}
      )`;
      values.push(assignedTo);
      paramCount++;
    }

    query += ` GROUP BY t.task_id, u.full_name, f.family_name
               ORDER BY t.created_at DESC 
               LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    // Get total count
    let countQuery = `
      SELECT COUNT(DISTINCT t.task_id) 
      FROM tasks t
      INNER JOIN family_members fm ON t.family_id = fm.family_id
      WHERE fm.user_id = $1
    `;
    const countValues = [userId];
    let countParam = 2;

    if (familyId) {
      countQuery += ` AND t.family_id = $${countParam}`;
      countValues.push(familyId);
      countParam++;
    }
    if (status) {
      countQuery += ` AND t.status = $${countParam}`;
      countValues.push(status);
      countParam++;
    }

    const countResult = await pool.query(countQuery, countValues);
    const totalTasks = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      data: {
        tasks: result.rows,
        pagination: {
          total: totalTasks,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalTasks / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tasks',
      error: error.message
    });
  }
};

// ============================================================================
// GET TASK BY ID
// ============================================================================
exports.getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.user_id;

    // Get task with creator and family info
    const result = await pool.query(
      `SELECT t.*, 
              u.full_name as creator_name,
              f.family_name
       FROM tasks t
       INNER JOIN users u ON t.created_by = u.user_id
       INNER JOIN families f ON t.family_id = f.family_id
       INNER JOIN family_members fm ON t.family_id = fm.family_id
       WHERE t.task_id = $1 AND fm.user_id = $2`,
      [taskId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have access to it'
      });
    }

    // Get assignment statistics
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_assignments,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'pending_review') as pending_review,
        COUNT(*) FILTER (WHERE status = 'approved') as completed,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE status = 'overdue') as overdue
       FROM task_assignments
       WHERE task_id = $1`,
      [taskId]
    );

    const task = {
      ...result.rows[0],
      statistics: statsResult.rows[0]
    };

    res.status(200).json({
      success: true,
      data: {
        task
      }
    });

  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get task',
      error: error.message
    });
  }
};

// ============================================================================
// UPDATE TASK
// ============================================================================
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.user_id;
    const {
      title, description, category, tags, priority, points_reward,
      photo_required, deadline, is_recurring, recurrence_pattern, recurrence_days
    } = req.body;

    // Check permission
    const permissionCheck = await pool.query(
      `SELECT t.family_id FROM tasks t
       INNER JOIN family_members fm ON t.family_id = fm.family_id
       WHERE t.task_id = $1 AND fm.user_id = $2 
         AND fm.relationship IN ('parent', 'spouse')`,
      [taskId, userId]
    );

    if (permissionCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this task'
      });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`);
      values.push(title);
      paramCount++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount}`);
      values.push(category);
      paramCount++;
    }
    if (tags !== undefined) {
      updates.push(`tags = $${paramCount}`);
      values.push(tags);
      paramCount++;
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramCount}`);
      values.push(priority);
      paramCount++;
    }
    if (points_reward !== undefined) {
      updates.push(`points_reward = $${paramCount}`);
      values.push(points_reward);
      paramCount++;
    }
    if (photo_required !== undefined) {
      updates.push(`photo_required = $${paramCount}`);
      values.push(photo_required);
      paramCount++;
    }
    if (deadline !== undefined) {
      updates.push(`deadline = $${paramCount}`);
      values.push(deadline);
      paramCount++;
    }
    if (is_recurring !== undefined) {
      updates.push(`is_recurring = $${paramCount}`);
      values.push(is_recurring);
      paramCount++;
    }
    if (recurrence_pattern !== undefined) {
      updates.push(`recurrence_pattern = $${paramCount}`);
      values.push(recurrence_pattern);
      paramCount++;
    }
    if (recurrence_days !== undefined) {
      updates.push(`recurrence_days = $${paramCount}`);
      values.push(recurrence_days);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(taskId);

    const query = `
      UPDATE tasks 
      SET ${updates.join(', ')}
      WHERE task_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: {
        task: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
};

// ============================================================================
// DELETE TASK
// ============================================================================
exports.deleteTask = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { taskId } = req.params;
    const userId = req.user.user_id;

    await client.query('BEGIN');

    // Check permission
    const permissionCheck = await client.query(
      `SELECT t.family_id FROM tasks t
       INNER JOIN family_members fm ON t.family_id = fm.family_id
       WHERE t.task_id = $1 AND fm.user_id = $2 
         AND fm.relationship IN ('parent', 'spouse')`,
      [taskId, userId]
    );

    if (permissionCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this task'
      });
    }

    // Delete task (CASCADE will handle related records)
    const result = await client.query(
      'DELETE FROM tasks WHERE task_id = $1 RETURNING task_id',
      [taskId]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  } finally {
    client.release();
  }
};

// ============================================================================
// UPDATE TASK STATUS
// ============================================================================
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user.user_id;

    // Check permission
    const permissionCheck = await pool.query(
      `SELECT t.family_id FROM tasks t
       INNER JOIN family_members fm ON t.family_id = fm.family_id
       WHERE t.task_id = $1 AND fm.user_id = $2 
         AND fm.relationship IN ('parent', 'spouse')`,
      [taskId, userId]
    );

    if (permissionCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this task'
      });
    }

    const result = await pool.query(
      `UPDATE tasks 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE task_id = $2
       RETURNING *`,
      [status, taskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: {
        task: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task status',
      error: error.message
    });
  }
};

// ============================================================================
// GET FAMILY TASKS
// ============================================================================
exports.getFamilyTasks = async (req, res) => {
  try {
    const { familyId } = req.params;
    const userId = req.user.user_id;

    // Check if user is family member
    const memberCheck = await pool.query(
      'SELECT member_id FROM family_members WHERE family_id = $1 AND user_id = $2',
      [familyId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this family'
      });
    }

    const result = await pool.query(
      `SELECT t.*, 
              u.full_name as creator_name,
              COUNT(ta.assignment_id) as total_assignments,
              COUNT(ta.assignment_id) FILTER (WHERE ta.status = 'approved') as completed_count
       FROM tasks t
       INNER JOIN users u ON t.created_by = u.user_id
       LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
       WHERE t.family_id = $1
       GROUP BY t.task_id, u.full_name
       ORDER BY t.created_at DESC`,
      [familyId]
    );

    res.status(200).json({
      success: true,
      data: {
        tasks: result.rows
      }
    });

  } catch (error) {
    console.error('Get family tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get family tasks',
      error: error.message
    });
  }
};

// ============================================================================
// GET ACTIVE FAMILY TASKS
// ============================================================================
exports.getActiveFamilyTasks = async (req, res) => {
  try {
    const { familyId } = req.params;
    const userId = req.user.user_id;

    // Check if user is family member
    const memberCheck = await pool.query(
      'SELECT member_id FROM family_members WHERE family_id = $1 AND user_id = $2',
      [familyId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this family'
      });
    }

    const result = await pool.query(
      `SELECT t.*, u.full_name as creator_name
       FROM tasks t
       INNER JOIN users u ON t.created_by = u.user_id
       WHERE t.family_id = $1 AND t.status = 'active'
       ORDER BY t.priority DESC, t.deadline ASC`,
      [familyId]
    );

    res.status(200).json({
      success: true,
      data: {
        tasks: result.rows
      }
    });

  } catch (error) {
    console.error('Get active family tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active tasks',
      error: error.message
    });
  }
};

// ============================================================================
// GET RECURRING TASKS
// ============================================================================
exports.getRecurringTasks = async (req, res) => {
  try {
    const { familyId } = req.params;
    const userId = req.user.user_id;

    // Check if user is family member
    const memberCheck = await pool.query(
      'SELECT member_id FROM family_members WHERE family_id = $1 AND user_id = $2',
      [familyId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this family'
      });
    }

    const result = await pool.query(
      `SELECT t.*, u.full_name as creator_name
       FROM tasks t
       INNER JOIN users u ON t.created_by = u.user_id
       WHERE t.family_id = $1 AND t.is_recurring = TRUE AND t.status = 'active'
       ORDER BY t.created_at DESC`,
      [familyId]
    );

    res.status(200).json({
      success: true,
      data: {
        tasks: result.rows
      }
    });

  } catch (error) {
    console.error('Get recurring tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recurring tasks',
      error: error.message
    });
  }
};

// ============================================================================
// DUPLICATE TASK
// ============================================================================
exports.duplicateTask = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { taskId } = req.params;
    const userId = req.user.user_id;

    await client.query('BEGIN');

    // Get original task
    const taskResult = await client.query(
      `SELECT t.* FROM tasks t
       INNER JOIN family_members fm ON t.family_id = fm.family_id
       WHERE t.task_id = $1 AND fm.user_id = $2 
         AND fm.relationship IN ('parent', 'spouse')`,
      [taskId, userId]
    );

    if (taskResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission'
      });
    }

    const originalTask = taskResult.rows[0];

    // Create duplicate
    const duplicateResult = await client.query(
      `INSERT INTO tasks (
        family_id, created_by, title, description, category, tags, priority,
        points_reward, photo_required, deadline, is_recurring, 
        recurrence_pattern, recurrence_days, status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
        originalTask.recurrence_days,
        'active'
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Task duplicated successfully',
      data: {
        task: duplicateResult.rows[0]
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Duplicate task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate task',
      error: error.message
    });
  } finally {
    client.release();
  }
};

// ============================================================================
// GET TASK STATISTICS
// ============================================================================
exports.getTaskStatistics = async (req, res) => {
  try {
    const { familyId } = req.params;
    const userId = req.user.user_id;

    // Check permission
    const permissionCheck = await pool.query(
      `SELECT relationship FROM family_members 
       WHERE family_id = $1 AND user_id = $2 AND relationship IN ('parent', 'spouse')`,
      [familyId, userId]
    );

    if (permissionCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view these statistics'
      });
    }

    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE status = 'active') as active_tasks,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive_tasks,
        COUNT(*) FILTER (WHERE is_recurring = TRUE) as recurring_tasks,
        AVG(points_reward) as avg_points,
        COUNT(*) FILTER (WHERE photo_required = TRUE) as tasks_requiring_photo
       FROM tasks
       WHERE family_id = $1`,
      [familyId]
    );

    res.status(200).json({
      success: true,
      data: {
        statistics: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Get task statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get task statistics',
      error: error.message
    });
  }
};
