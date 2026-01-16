const { query, transaction } = require('../config/database');
const FamilyMemberModel = require('./FamilyMemberModel');

class TaskAssignmentModel {
    static async create(assignmentData) {
        const text = `
            INSERT INTO task_assignments (
                task_id, assigned_to, assigned_by, due_date
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [
            assignmentData.taskId,
            assignmentData.assignedTo,
            assignmentData.assignedBy,
            assignmentData.dueDate || null
        ];
        const result = await query(text, values);
        return result.rows[0];
    }

    static async findById(assignmentId) {
        const text = `
            SELECT ta.*, 
                   t.title as task_title, t.points_reward, t.photo_required,
                   child.full_name as child_name,
                   assigner.full_name as assigner_name
            FROM task_assignments ta
            JOIN tasks t ON ta.task_id = t.task_id
            JOIN users child ON ta.assigned_to = child.user_id
            LEFT JOIN users assigner ON ta.assigned_by = assigner.user_id
            WHERE ta.assignment_id = $1
        `;
        const result = await query(text, [assignmentId]);
        return result.rows[0];
    }

    static async getByChild(childId, filters = {}) {
        let text = `
            SELECT ta.*, 
                   t.title as task_title, t.description, t.points_reward,
                   t.photo_required, t.priority
            FROM task_assignments ta
            JOIN tasks t ON ta.task_id = t.task_id
            WHERE ta.assigned_to = $1
        `;
        const values = [childId];
        let paramCount = 2;

        if (filters.status) {
            text += ` AND ta.status = $${paramCount++}`;
            values.push(filters.status);
        }

        text += ` ORDER BY ta.due_date ASC NULLS LAST, ta.assigned_at DESC`;

        const result = await query(text, values);
        return result.rows;
    }

    static async getByFamily(familyId, filters = {}) {
        let text = `
            SELECT ta.*, 
                   t.title as task_title, t.priority, t.points_reward,
                   child.full_name as child_name
            FROM task_assignments ta
            JOIN tasks t ON ta.task_id = t.task_id
            JOIN users child ON ta.assigned_to = child.user_id
            JOIN family_members fm ON child.user_id = fm.user_id
            WHERE fm.family_id = $1
        `;
        const values = [familyId];
        let paramCount = 2;

        if (filters.status) {
            text += ` AND ta.status = $${paramCount++}`;
            values.push(filters.status);
        }

        text += ` ORDER BY ta.assigned_at DESC`;

        const result = await query(text, values);
        return result.rows;
    }

    static async updateStatus(assignmentId, status, additionalData = {}) {
        const fields = ['status = $1'];
        const values = [status, assignmentId];

        if (status === 'in_progress') {
            fields.push(`started_at = CURRENT_TIMESTAMP`);
        } else if (status === 'pending_review') {
            fields.push(`completed_at = CURRENT_TIMESTAMP`);
        }

        const text = `
            UPDATE task_assignments 
            SET ${fields.join(', ')}
            WHERE assignment_id = $2
            RETURNING *
        `;
        const result = await query(text, values);
        return result.rows[0];
    }

    static async review(assignmentId, reviewData) {
        return await transaction(async (client) => {
            // Update assignment status
            const assignmentText = `
                UPDATE task_assignments 
                SET status = $1,
                    reviewed_by = $2,
                    reviewed_at = CURRENT_TIMESTAMP,
                    review_comments = $3
                WHERE assignment_id = $4
                RETURNING *
            `;
            const assignmentResult = await client.query(assignmentText, [
                reviewData.status,
                reviewData.reviewedBy,
                reviewData.comments || null,
                assignmentId
            ]);

            const assignment = assignmentResult.rows[0];

            // If approved, award points
            if (reviewData.status === 'approved') {
                // Get task points
                const taskResult = await client.query(
                    'SELECT points_reward FROM tasks WHERE task_id = $1',
                    [assignment.task_id]
                );
                const pointsReward = taskResult.rows[0].points_reward;

                // Get family member
                const memberResult = await client.query(
                    `SELECT member_id, family_id FROM family_members 
                     WHERE user_id = $1`,
                    [assignment.assigned_to]
                );
                const member = memberResult.rows[0];

                // Award points
                await FamilyMemberModel.updatePoints(
                    member.member_id,
                    pointsReward,
                    `Task completed: ${reviewData.taskTitle || 'Task'}`,
                    assignmentId,
                    'task',
                    reviewData.reviewedBy
                );
            }

            return assignment;
        });
    }

    static async delete(assignmentId) {
        const text = 'DELETE FROM task_assignments WHERE assignment_id = $1 RETURNING *';
        const result = await query(text, [assignmentId]);
        return result.rows[0];
    }

    static async markOverdue() {
        const text = `
            UPDATE task_assignments 
            SET status = 'overdue'
            WHERE status IN ('pending', 'in_progress')
            AND due_date < CURRENT_TIMESTAMP
            RETURNING assignment_id
        `;
        const result = await query(text);
        return result.rows;
    }
}

module.exports = TaskAssignmentModel;
