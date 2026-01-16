const { query, transaction } = require('../config/database');

class TaskModel {
    static async create(taskData) {
        const text = `
            INSERT INTO tasks (
                family_id, created_by, title, description, category, tags,
                priority, points_reward, photo_required, deadline, 
                is_recurring, recurrence_pattern, recurrence_days, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        `;
        const values = [
            taskData.familyId,
            taskData.createdBy,
            taskData.title,
            taskData.description || null,
            taskData.category || null,
            taskData.tags || null,
            taskData.priority || 'medium',
            taskData.pointsReward,
            taskData.photoRequired || false,
            taskData.deadline || null,
            taskData.isRecurring || false,
            taskData.recurrencePattern || null,
            taskData.recurrenceDays || null,
            taskData.status || 'active'
        ];
        const result = await query(text, values);
        return result.rows[0];
    }

    static async findById(taskId) {
        const text = `
            SELECT t.*, u.full_name as creator_name
            FROM tasks t
            LEFT JOIN users u ON t.created_by = u.user_id
            WHERE t.task_id = $1
        `;
        const result = await query(text, [taskId]);
        return result.rows[0];
    }

    static async getByFamily(familyId, filters = {}) {
        let text = `
            SELECT t.*, u.full_name as creator_name,
                   COUNT(ta.assignment_id) as assignment_count
            FROM tasks t
            LEFT JOIN users u ON t.created_by = u.user_id
            LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
            WHERE t.family_id = $1
        `;
        const values = [familyId];
        let paramCount = 2;

        if (filters.status) {
            text += ` AND t.status = $${paramCount++}`;
            values.push(filters.status);
        }
        if (filters.priority) {
            text += ` AND t.priority = $${paramCount++}`;
            values.push(filters.priority);
        }

        text += ` GROUP BY t.task_id, u.full_name ORDER BY t.created_at DESC`;

        const result = await query(text, values);
        return result.rows;
    }

    static async update(taskId, updateData) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        if (updateData.title !== undefined) {
            fields.push(`title = $${paramCount++}`);
            values.push(updateData.title);
        }
        if (updateData.description !== undefined) {
            fields.push(`description = $${paramCount++}`);
            values.push(updateData.description);
        }
        if (updateData.priority !== undefined) {
            fields.push(`priority = $${paramCount++}`);
            values.push(updateData.priority);
        }
        if (updateData.pointsReward !== undefined) {
            fields.push(`points_reward = $${paramCount++}`);
            values.push(updateData.pointsReward);
        }
        if (updateData.status !== undefined) {
            fields.push(`status = $${paramCount++}`);
            values.push(updateData.status);
        }

        if (fields.length === 0) return null;

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(taskId);

        const text = `
            UPDATE tasks 
            SET ${fields.join(', ')}
            WHERE task_id = $${paramCount}
            RETURNING *
        `;
        const result = await query(text, values);
        return result.rows[0];
    }

    static async delete(taskId) {
        const text = 'DELETE FROM tasks WHERE task_id = $1 RETURNING *';
        const result = await query(text, [taskId]);
        return result.rows[0];
    }

    static async exists(taskId) {
        const text = 'SELECT EXISTS(SELECT 1 FROM tasks WHERE task_id = $1)';
        const result = await query(text, [taskId]);
        return result.rows[0].exists;
    }
}

module.exports = TaskModel;
