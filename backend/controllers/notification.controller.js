// ============================================================================
// Notification Controller
// ============================================================================

const pool = require('../config/database');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { type, isRead, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM notifications WHERE user_id = $1';
    const values = [userId];
    let paramCount = 2;

    if (type) {
      query += ` AND notification_type = $${paramCount}`;
      values.push(type);
      paramCount++;
    }
    if (isRead !== undefined) {
      query += ` AND is_read = $${paramCount}`;
      values.push(isRead === 'true');
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    res.status(200).json({ success: true, data: { notifications: result.rows } });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to get notifications', error: error.message });
  }
};

exports.getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 AND is_read = FALSE ORDER BY created_at DESC',
      [userId]
    );

    res.status(200).json({ success: true, data: { notifications: result.rows } });
  } catch (error) {
    console.error('Get unread notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to get notifications', error: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );

    res.status(200).json({ success: true, data: { unread_count: parseInt(result.rows[0].count) } });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, message: 'Failed to get count', error: error.message });
  }
};

exports.getNotificationById = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.user_id;
    
    const result = await pool.query(
      'SELECT * FROM notifications WHERE notification_id = $1 AND user_id = $2',
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: { notification: result.rows[0] } });
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({ success: false, message: 'Failed to get notification', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.user_id;
    
    const result = await pool.query(
      'UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE notification_id = $1 AND user_id = $2 RETURNING *',
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark as read', error: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    await pool.query(
      'UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark all as read', error: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.user_id;
    
    await pool.query('DELETE FROM notifications WHERE notification_id = $1 AND user_id = $2', [notificationId, userId]);
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notification', error: error.message });
  }
};

exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.user_id;
    await pool.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
    res.status(200).json({ success: true, message: 'All notifications deleted' });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notifications', error: error.message });
  }
};

exports.deleteReadNotifications = async (req, res) => {
  try {
    const userId = req.user.user_id;
    await pool.query('DELETE FROM notifications WHERE user_id = $1 AND is_read = TRUE', [userId]);
    res.status(200).json({ success: true, message: 'Read notifications deleted' });
  } catch (error) {
    console.error('Delete read notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notifications', error: error.message });
  }
};

exports.getNotificationSettings = async (req, res) => {
  // Placeholder for notification preferences
  res.status(200).json({ 
    success: true, 
    data: { 
      settings: {
        email_notifications: true,
        push_notifications: true,
        task_reminders: true
      }
    }
  });
};

exports.updateNotificationSettings = async (req, res) => {
  // Placeholder for updating notification preferences
  res.status(200).json({ success: true, message: 'Settings updated' });
};

exports.getNotificationHistory = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { page = 1, limit = 20, type, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM notifications WHERE user_id = $1';
    const values = [userId];
    let paramCount = 2;

    if (type) {
      query += ` AND notification_type = $${paramCount}`;
      values.push(type);
      paramCount++;
    }
    if (startDate) {
      query += ` AND created_at >= $${paramCount}`;
      values.push(startDate);
      paramCount++;
    }
    if (endDate) {
      query += ` AND created_at <= $${paramCount}`;
      values.push(endDate);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    res.status(200).json({ success: true, data: { notifications: result.rows } });
  } catch (error) {
    console.error('Get notification history error:', error);
    res.status(500).json({ success: false, message: 'Failed to get history', error: error.message });
  }
};

exports.getNotificationsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user.user_id;
    
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 AND notification_type = $2 ORDER BY created_at DESC',
      [userId, type]
    );

    res.status(200).json({ success: true, data: { notifications: result.rows } });
  } catch (error) {
    console.error('Get notifications by type error:', error);
    res.status(500).json({ success: false, message: 'Failed to get notifications', error: error.message });
  }
};
