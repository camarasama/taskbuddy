const { query } = require('../config/database');

class NotificationModel {
    static async create(notificationData) {
        const text = `
            INSERT INTO notifications (
                user_id, notification_type, title, message, 
                reference_type, reference_id
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            notificationData.userId,
            notificationData.notificationType,
            notificationData.title,
            notificationData.message,
            notificationData.referenceType || null,
            notificationData.referenceId || null
        ];
        const result = await query(text, values);
        return result.rows[0];
    }

    static async getByUser(userId, filters = {}) {
        let text = 'SELECT * FROM notifications WHERE user_id = $1';
        const values = [userId];
        let paramCount = 2;

        if (filters.isRead !== undefined) {
            text += ` AND is_read = $${paramCount++}`;
            values.push(filters.isRead);
        }

        if (filters.notificationType) {
            text += ` AND notification_type = $${paramCount++}`;
            values.push(filters.notificationType);
        }

        text += ` ORDER BY created_at DESC`;

        if (filters.limit) {
            text += ` LIMIT $${paramCount++}`;
            values.push(filters.limit);
        }

        const result = await query(text, values);
        return result.rows;
    }

    static async getUnread(userId) {
        const text = `
            SELECT * FROM notifications
            WHERE user_id = $1 AND is_read = FALSE
            ORDER BY created_at DESC
        `;
        const result = await query(text, [userId]);
        return result.rows;
    }

    static async getUnreadCount(userId) {
        const text = `
            SELECT COUNT(*) as unread_count
            FROM notifications
            WHERE user_id = $1 AND is_read = FALSE
        `;
        const result = await query(text, [userId]);
        return parseInt(result.rows[0].unread_count);
    }

    static async markAsRead(notificationId) {
        const text = `
            UPDATE notifications 
            SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
            WHERE notification_id = $1
            RETURNING *
        `;
        const result = await query(text, [notificationId]);
        return result.rows[0];
    }

    static async markAllAsRead(userId) {
        const text = `
            UPDATE notifications 
            SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
            WHERE user_id = $1 AND is_read = FALSE
            RETURNING notification_id
        `;
        const result = await query(text, [userId]);
        return result.rows;
    }

    static async markEmailSent(notificationId) {
        const text = `
            UPDATE notifications 
            SET sent_via_email = TRUE
            WHERE notification_id = $1
            RETURNING *
        `;
        const result = await query(text, [notificationId]);
        return result.rows[0];
    }

    static async delete(notificationId) {
        const text = 'DELETE FROM notifications WHERE notification_id = $1 RETURNING *';
        const result = await query(text, [notificationId]);
        return result.rows[0];
    }

    static async deleteAll(userId) {
        const text = 'DELETE FROM notifications WHERE user_id = $1 RETURNING notification_id';
        const result = await query(text, [userId]);
        return result.rows;
    }

    // Helper methods for creating common notifications
    static async createTaskAssigned(childId, taskTitle, taskId) {
        return await this.create({
            userId: childId,
            notificationType: 'task_assigned',
            title: 'New Task Assigned',
            message: `You have been assigned: ${taskTitle}`,
            referenceType: 'task',
            referenceId: taskId
        });
    }

    static async createTaskApproved(childId, taskTitle, pointsEarned, assignmentId) {
        return await this.create({
            userId: childId,
            notificationType: 'task_approved',
            title: 'Task Approved!',
            message: `Your task "${taskTitle}" has been approved. You earned ${pointsEarned} points!`,
            referenceType: 'assignment',
            referenceId: assignmentId
        });
    }

    static async createTaskRejected(childId, taskTitle, reason, assignmentId) {
        return await this.create({
            userId: childId,
            notificationType: 'task_rejected',
            title: 'Task Needs Revision',
            message: `Your task "${taskTitle}" needs revision. ${reason ? 'Reason: ' + reason : ''}`,
            referenceType: 'assignment',
            referenceId: assignmentId
        });
    }

    static async createRewardRequested(parentId, childName, rewardName, redemptionId) {
        return await this.create({
            userId: parentId,
            notificationType: 'reward_requested',
            title: 'Reward Request',
            message: `${childName} wants to redeem: ${rewardName}`,
            referenceType: 'redemption',
            referenceId: redemptionId
        });
    }

    static async createRewardApproved(childId, rewardName, redemptionId) {
        return await this.create({
            userId: childId,
            notificationType: 'reward_approved',
            title: 'Reward Approved!',
            message: `Your reward "${rewardName}" has been approved!`,
            referenceType: 'redemption',
            referenceId: redemptionId
        });
    }

    static async createDeadlineReminder(childId, taskTitle, hoursRemaining, assignmentId) {
        return await this.create({
            userId: childId,
            notificationType: 'deadline_reminder',
            title: 'Task Deadline Approaching',
            message: `Reminder: "${taskTitle}" is due in ${hoursRemaining} hours`,
            referenceType: 'assignment',
            referenceId: assignmentId
        });
    }
}

module.exports = NotificationModel;
