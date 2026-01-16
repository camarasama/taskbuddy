// ============================================================================
// Notification Service
// Creates and manages notifications
// ============================================================================

const pool = require('../config/database');
const emailService = require('./email.service');

// ============================================================================
// CREATE NOTIFICATION
// ============================================================================
exports.createNotification = async (
  userId, 
  notificationType, 
  title, 
  message, 
  referenceType = null, 
  referenceId = null,
  sendEmail = true
) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Create in-app notification
    const result = await client.query(
      `INSERT INTO notifications (
        user_id, notification_type, title, message, 
        reference_type, reference_id, sent_via_email
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, notificationType, title, message, referenceType, referenceId, sendEmail]
    );

    const notification = result.rows[0];

    // Send email notification if enabled
    if (sendEmail) {
      try {
        // Get user details
        const userResult = await client.query(
          'SELECT email, full_name FROM users WHERE user_id = $1',
          [userId]
        );

        if (userResult.rows.length > 0) {
          const { email, full_name } = userResult.rows[0];

          // Send appropriate email based on notification type
          if (notificationType.startsWith('task_')) {
            // Extract task info if available
            let taskTitle = 'a task';
            if (referenceType === 'task' && referenceId) {
              const taskResult = await client.query(
                'SELECT title FROM tasks WHERE task_id = $1',
                [referenceId]
              );
              if (taskResult.rows.length > 0) {
                taskTitle = taskResult.rows[0].title;
              }
            }
            await emailService.sendTaskNotificationEmail(email, full_name, taskTitle, notificationType);
          }

          if (notificationType.startsWith('reward_')) {
            // Extract reward info if available
            let rewardName = 'a reward';
            if (referenceType === 'reward' && referenceId) {
              const rewardResult = await client.query(
                'SELECT reward_name FROM rewards WHERE reward_id = $1',
                [referenceId]
              );
              if (rewardResult.rows.length > 0) {
                rewardName = rewardResult.rows[0].reward_name;
              }
            }
            await emailService.sendRewardNotificationEmail(email, full_name, rewardName, notificationType);
          }
        }
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Don't fail the transaction if email fails
      }
    }

    await client.query('COMMIT');

    // Emit real-time notification via Socket.io if available
    if (global.io) {
      global.io.to(`user_${userId}`).emit('notification', notification);
    }

    return notification;

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating notification:', error);
    throw error;
  } finally {
    client.release();
  }
};

// ============================================================================
// CREATE BULK NOTIFICATIONS
// ============================================================================
exports.createBulkNotifications = async (
  userIds, 
  notificationType, 
  title, 
  message, 
  referenceType = null, 
  referenceId = null
) => {
  try {
    const notifications = [];

    for (const userId of userIds) {
      const notification = await this.createNotification(
        userId, 
        notificationType, 
        title, 
        message, 
        referenceType, 
        referenceId,
        true // Send email
      );
      notifications.push(notification);
    }

    return notifications;

  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
};

// ============================================================================
// MARK NOTIFICATION AS READ
// ============================================================================
exports.markAsRead = async (notificationId, userId) => {
  try {
    const result = await pool.query(
      `UPDATE notifications 
       SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
       WHERE notification_id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, userId]
    );

    return result.rows[0];

  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// ============================================================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================================================
exports.markAllAsRead = async (userId) => {
  try {
    await pool.query(
      `UPDATE notifications 
       SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );

    return true;

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// ============================================================================
// DELETE NOTIFICATION
// ============================================================================
exports.deleteNotification = async (notificationId, userId) => {
  try {
    await pool.query(
      'DELETE FROM notifications WHERE notification_id = $1 AND user_id = $2',
      [notificationId, userId]
    );

    return true;

  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// ============================================================================
// GET UNREAD COUNT
// ============================================================================
exports.getUnreadCount = async (userId) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );

    return parseInt(result.rows[0].count);

  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

// ============================================================================
// SEND DEADLINE REMINDERS (Scheduled task)
// ============================================================================
exports.sendDeadlineReminders = async () => {
  const client = await pool.connect();
  
  try {
    // Get assignments due in the next 24 hours that haven't been reminded
    const result = await client.query(
      `SELECT ta.*, t.title as task_title, u.user_id, u.email, u.full_name
       FROM task_assignments ta
       INNER JOIN tasks t ON ta.task_id = t.task_id
       INNER JOIN users u ON ta.assigned_to = u.user_id
       WHERE ta.due_date BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '24 hours'
         AND ta.reminder_sent = FALSE
         AND ta.status NOT IN ('approved', 'rejected')`
    );

    for (const assignment of result.rows) {
      // Create notification
      await this.createNotification(
        assignment.user_id,
        'deadline_reminder',
        'Task Deadline Reminder',
        `Your task "${assignment.task_title}" is due in less than 24 hours!`,
        'assignment',
        assignment.assignment_id,
        true
      );

      // Mark reminder as sent
      await client.query(
        'UPDATE task_assignments SET reminder_sent = TRUE WHERE assignment_id = $1',
        [assignment.assignment_id]
      );
    }

    console.log(`Sent ${result.rows.length} deadline reminders`);

  } catch (error) {
    console.error('Error sending deadline reminders:', error);
  } finally {
    client.release();
  }
};

// ============================================================================
// MARK OVERDUE TASKS (Scheduled task)
// ============================================================================
exports.markOverdueTasks = async () => {
  try {
    // Update overdue assignments
    const result = await pool.query(
      `UPDATE task_assignments 
       SET status = 'overdue'
       WHERE due_date < CURRENT_TIMESTAMP 
         AND status NOT IN ('approved', 'rejected', 'overdue')
       RETURNING assignment_id, assigned_to`
    );

    // Notify users about overdue tasks
    for (const assignment of result.rows) {
      await this.createNotification(
        assignment.assigned_to,
        'task_overdue',
        'Task Overdue',
        'You have an overdue task. Please complete it as soon as possible.',
        'assignment',
        assignment.assignment_id,
        true
      );
    }

    console.log(`Marked ${result.rows.length} tasks as overdue`);

  } catch (error) {
    console.error('Error marking overdue tasks:', error);
  }
};
