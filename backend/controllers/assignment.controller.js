// ============================================================================
// Assignment Controller
// Handles task assignments, submissions, and reviews
// ============================================================================

const pool = require('../config/database');
const notificationService = require('../services/notification.service');
const pointsService = require('../services/points.service');

// Assign task to child(ren)
exports.assignTask = async (req, res) => {
  const client = await pool.connect();
  try {
    const { task_id, child_ids, due_date } = req.body;
    const assignedBy = req.user.user_id;

    await client.query('BEGIN');

    // Verify task exists and user has permission
    const taskCheck = await client.query(
      `SELECT t.* FROM tasks t
       INNER JOIN family_members fm ON t.family_id = fm.family_id
       WHERE t.task_id = $1 AND fm.user_id = $2 AND fm.relationship IN ('parent', 'spouse')`,
      [task_id, assignedBy]
    );

    if (taskCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    const assignments = [];
    for (const childId of child_ids) {
      const result = await client.query(
        `INSERT INTO task_assignments (task_id, assigned_to, assigned_by, due_date)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [task_id, childId, assignedBy, due_date]
      );
      assignments.push(result.rows[0]);

      // Send notification
      await notificationService.createNotification(childId, 'task_assigned', 
        'New Task Assigned', `You have been assigned a new task`, 'task', task_id);
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: { assignments } });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Assign task error:', error);
    res.status(500).json({ success: false, message: 'Failed to assign task', error: error.message });
  } finally {
    client.release();
  }
};

// Get assignments with filters
exports.getAssignments = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { familyId, status, childId, taskId } = req.query;

    let query = `
      SELECT ta.*, t.title, t.description, t.points_reward, t.photo_required,
             u.full_name as child_name, u2.full_name as assigned_by_name
      FROM task_assignments ta
      INNER JOIN tasks t ON ta.task_id = t.task_id
      INNER JOIN users u ON ta.assigned_to = u.user_id
      INNER JOIN users u2 ON ta.assigned_by = u2.user_id
      INNER JOIN family_members fm ON t.family_id = fm.family_id
      WHERE fm.user_id = $1
    `;
    const values = [userId];
    let paramCount = 2;

    if (familyId) {
      query += ` AND t.family_id = $${paramCount}`;
      values.push(familyId);
      paramCount++;
    }
    if (status) {
      query += ` AND ta.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }
    if (childId) {
      query += ` AND ta.assigned_to = $${paramCount}`;
      values.push(childId);
      paramCount++;
    }
    if (taskId) {
      query += ` AND ta.task_id = $${paramCount}`;
      values.push(taskId);
      paramCount++;
    }

    query += ' ORDER BY ta.assigned_at DESC';
    const result = await pool.query(query, values);

    res.status(200).json({ success: true, data: { assignments: result.rows } });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ success: false, message: 'Failed to get assignments', error: error.message });
  }
};

// Get assignment by ID
exports.getAssignmentById = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user.user_id;

    const result = await pool.query(
      `SELECT ta.*, t.*, u.full_name as child_name
       FROM task_assignments ta
       INNER JOIN tasks t ON ta.task_id = t.task_id
       INNER JOIN users u ON ta.assigned_to = u.user_id
       WHERE ta.assignment_id = $1 AND (ta.assigned_to = $2 OR t.created_by = $2)`,
      [assignmentId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.status(200).json({ success: true, data: { assignment: result.rows[0] } });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to get assignment', error: error.message });
  }
};

// Get child's assignments
exports.getChildAssignments = async (req, res) => {
  try {
    const { childId } = req.params;
    const userId = req.user.user_id;

    // Check permission
    if (userId !== parseInt(childId) && req.user.role !== 'parent' && req.user.role !== 'spouse') {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    const result = await pool.query(
      `SELECT ta.*, t.title, t.description, t.points_reward, t.photo_required, t.deadline
       FROM task_assignments ta
       INNER JOIN tasks t ON ta.task_id = t.task_id
       WHERE ta.assigned_to = $1
       ORDER BY ta.due_date ASC, ta.assigned_at DESC`,
      [childId]
    );

    res.status(200).json({ success: true, data: { assignments: result.rows } });
  } catch (error) {
    console.error('Get child assignments error:', error);
    res.status(500).json({ success: false, message: 'Failed to get assignments', error: error.message });
  }
};

// Get task assignments
exports.getTaskAssignments = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const result = await pool.query(
      `SELECT ta.*, u.full_name as child_name
       FROM task_assignments ta
       INNER JOIN users u ON ta.assigned_to = u.user_id
       WHERE ta.task_id = $1
       ORDER BY ta.assigned_at DESC`,
      [taskId]
    );

    res.status(200).json({ success: true, data: { assignments: result.rows } });
  } catch (error) {
    console.error('Get task assignments error:', error);
    res.status(500).json({ success: false, message: 'Failed to get assignments', error: error.message });
  }
};

// Delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    await pool.query('DELETE FROM task_assignments WHERE assignment_id = $1', [assignmentId]);
    res.status(200).json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete assignment', error: error.message });
  }
};

// Start assignment (child marks as in progress)
exports.startAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user.user_id;

    const result = await pool.query(
      `UPDATE task_assignments
       SET status = 'in_progress', started_at = CURRENT_TIMESTAMP
       WHERE assignment_id = $1 AND assigned_to = $2
       RETURNING *`,
      [assignmentId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.status(200).json({ success: true, message: 'Assignment started', data: { assignment: result.rows[0] } });
  } catch (error) {
    console.error('Start assignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to start assignment', error: error.message });
  }
};

// Submit assignment
exports.submitAssignment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { assignmentId } = req.params;
    const { submission_notes } = req.body;
    const userId = req.user.user_id;

    await client.query('BEGIN');

    // Get assignment and task info
    const assignmentResult = await client.query(
      `SELECT ta.*, t.photo_required, t.family_id FROM task_assignments ta
       INNER JOIN tasks t ON ta.task_id = t.task_id
       WHERE ta.assignment_id = $1 AND ta.assigned_to = $2`,
      [assignmentId, userId]
    );

    if (assignmentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const assignment = assignmentResult.rows[0];

    // Check if photo is required
    if (assignment.photo_required && !req.file) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Photo is required for this task' });
    }

    const photoUrl = req.file ? `/uploads/tasks/${req.file.filename}` : null;

    // Create submission
    await client.query(
      `INSERT INTO task_submissions (assignment_id, photo_url, submission_notes)
       VALUES ($1, $2, $3)`,
      [assignmentId, photoUrl, submission_notes]
    );

    // Update assignment status
    await client.query(
      `UPDATE task_assignments
       SET status = 'pending_review', completed_at = CURRENT_TIMESTAMP
       WHERE assignment_id = $1`,
      [assignmentId]
    );

    // Notify parents
    const parentsResult = await client.query(
      `SELECT fm.user_id FROM family_members fm
       WHERE fm.family_id = $1 AND fm.relationship IN ('parent', 'spouse')`,
      [assignment.family_id]
    );

    for (const parent of parentsResult.rows) {
      await notificationService.createNotification(parent.user_id, 'task_submitted',
        'Task Submitted for Review', 'A child has submitted a task for review', 'assignment', assignmentId);
    }

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Task submitted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Submit assignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit assignment', error: error.message });
  } finally {
    client.release();
  }
};

// Get submissions
exports.getSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const result = await pool.query(
      `SELECT * FROM task_submissions WHERE assignment_id = $1 ORDER BY submitted_at DESC`,
      [assignmentId]
    );

    res.status(200).json({ success: true, data: { submissions: result.rows } });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ success: false, message: 'Failed to get submissions', error: error.message });
  }
};

// Resubmit assignment
exports.resubmitAssignment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { assignmentId } = req.params;
    const { submission_notes } = req.body;
    const userId = req.user.user_id;

    await client.query('BEGIN');

    // Mark previous submissions as not latest
    await client.query(
      'UPDATE task_submissions SET is_latest = FALSE WHERE assignment_id = $1',
      [assignmentId]
    );

    const photoUrl = req.file ? `/uploads/tasks/${req.file.filename}` : null;

    // Create new submission
    await client.query(
      `INSERT INTO task_submissions (assignment_id, photo_url, submission_notes, is_latest)
       VALUES ($1, $2, $3, TRUE)`,
      [assignmentId, photoUrl, submission_notes]
    );

    // Update assignment status
    await client.query(
      `UPDATE task_assignments
       SET status = 'pending_review', completed_at = CURRENT_TIMESTAMP
       WHERE assignment_id = $1 AND assigned_to = $2`,
      [assignmentId, userId]
    );

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Task resubmitted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Resubmit assignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to resubmit assignment', error: error.message });
  } finally {
    client.release();
  }
};

// Review assignment (approve/reject)
exports.reviewAssignment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { assignmentId } = req.params;
    const { status, review_comments } = req.body;  // status: 'approved' or 'rejected'
    const reviewerId = req.user.user_id;

    await client.query('BEGIN');

    // Get assignment details
    const assignmentResult = await client.query(
      `SELECT ta.*, t.points_reward, t.family_id FROM task_assignments ta
       INNER JOIN tasks t ON ta.task_id = t.task_id
       WHERE ta.assignment_id = $1`,
      [assignmentId]
    );

    if (assignmentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const assignment = assignmentResult.rows[0];

    // Update assignment
    await client.query(
      `UPDATE task_assignments
       SET status = $1, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $2, review_comments = $3
       WHERE assignment_id = $4`,
      [status, reviewerId, review_comments, assignmentId]
    );

    // If approved, award points
    if (status === 'approved') {
      await pointsService.awardPoints(assignment.assigned_to, assignment.family_id, 
        assignment.points_reward, 'task', assignment.task_id, 'Task completed');

      // Notify child - approved
      await notificationService.createNotification(assignment.assigned_to, 'task_approved',
        'Task Approved!', `Your task has been approved. You earned ${assignment.points_reward} points!`,
        'assignment', assignmentId);
    } else {
      // Notify child - rejected
      await notificationService.createNotification(assignment.assigned_to, 'task_rejected',
        'Task Needs Revision', review_comments || 'Your task submission needs revision',
        'assignment', assignmentId);
    }

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: `Task ${status}` });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Review assignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to review assignment', error: error.message });
  } finally {
    client.release();
  }
};

// Get pending reviews
exports.getPendingReviews = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    const result = await pool.query(
      `SELECT ta.*, t.title, u.full_name as child_name
       FROM task_assignments ta
       INNER JOIN tasks t ON ta.task_id = t.task_id
       INNER JOIN users u ON ta.assigned_to = u.user_id
       WHERE t.family_id = $1 AND ta.status = 'pending_review'
       ORDER BY ta.completed_at ASC`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { assignments: result.rows } });
  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to get pending reviews', error: error.message });
  }
};

// Get overdue assignments
exports.getOverdueAssignments = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    const result = await pool.query(
      `SELECT ta.*, t.title, u.full_name as child_name
       FROM task_assignments ta
       INNER JOIN tasks t ON ta.task_id = t.task_id
       INNER JOIN users u ON ta.assigned_to = u.user_id
       WHERE t.family_id = $1 AND ta.due_date < CURRENT_TIMESTAMP 
         AND ta.status NOT IN ('approved', 'rejected')
       ORDER BY ta.due_date ASC`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { assignments: result.rows } });
  } catch (error) {
    console.error('Get overdue assignments error:', error);
    res.status(500).json({ success: false, message: 'Failed to get overdue assignments', error: error.message });
  }
};

// Extend deadline
exports.extendDeadline = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { new_due_date } = req.body;
    
    const result = await pool.query(
      `UPDATE task_assignments SET due_date = $1 WHERE assignment_id = $2 RETURNING *`,
      [new_due_date, assignmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.status(200).json({ success: true, message: 'Deadline extended', data: { assignment: result.rows[0] } });
  } catch (error) {
    console.error('Extend deadline error:', error);
    res.status(500).json({ success: false, message: 'Failed to extend deadline', error: error.message });
  }
};

// Get child statistics
exports.getChildStatistics = async (req, res) => {
  try {
    const { childId } = req.params;
    
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_assignments,
        COUNT(*) FILTER (WHERE status = 'approved') as completed,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'overdue') as overdue
       FROM task_assignments
       WHERE assigned_to = $1`,
      [childId]
    );

    res.status(200).json({ success: true, data: { statistics: result.rows[0] } });
  } catch (error) {
    console.error('Get child statistics error:', error);
    res.status(500).json({ success: false, message: 'Failed to get statistics', error: error.message });
  }
};

// Get family statistics
exports.getFamilyStatistics = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_assignments,
        COUNT(*) FILTER (WHERE status = 'approved') as completed,
        COUNT(*) FILTER (WHERE status = 'pending_review') as pending_review
       FROM task_assignments ta
       INNER JOIN tasks t ON ta.task_id = t.task_id
       WHERE t.family_id = $1`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { statistics: result.rows[0] } });
  } catch (error) {
    console.error('Get family statistics error:', error);
    res.status(500).json({ success: false, message: 'Failed to get statistics', error: error.message });
  }
};
