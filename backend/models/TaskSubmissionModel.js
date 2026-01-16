const { query } = require('../config/database');

class TaskSubmissionModel {
    static async create(submissionData) {
        const text = `
            INSERT INTO task_submissions (
                assignment_id, photo_url, submission_notes
            )
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [
            submissionData.assignmentId,
            submissionData.photoUrl || null,
            submissionData.submissionNotes || null
        ];
        const result = await query(text, values);
        return result.rows[0];
    }

    static async findByAssignmentId(assignmentId) {
        const text = `
            SELECT ts.*, ta.assigned_to, ta.task_id
            FROM task_submissions ts
            JOIN task_assignments ta ON ts.assignment_id = ta.assignment_id
            WHERE ts.assignment_id = $1
            ORDER BY ts.submitted_at DESC
        `;
        const result = await query(text, [assignmentId]);
        return result.rows;
    }

    static async getLatestByAssignment(assignmentId) {
        const text = `
            SELECT * FROM task_submissions 
            WHERE assignment_id = $1 AND is_latest = TRUE
        `;
        const result = await query(text, [assignmentId]);
        return result.rows[0];
    }

    static async getByChild(childId, limit = 50) {
        const text = `
            SELECT ts.*, ta.assignment_id, ta.status as assignment_status,
                   t.title as task_title, t.points_reward
            FROM task_submissions ts
            JOIN task_assignments ta ON ts.assignment_id = ta.assignment_id
            JOIN tasks t ON ta.task_id = t.task_id
            WHERE ta.assigned_to = $1
            ORDER BY ts.submitted_at DESC
            LIMIT $2
        `;
        const result = await query(text, [childId, limit]);
        return result.rows;
    }

    static async delete(submissionId) {
        const text = 'DELETE FROM task_submissions WHERE submission_id = $1 RETURNING *';
        const result = await query(text, [submissionId]);
        return result.rows[0];
    }
}

module.exports = TaskSubmissionModel;
