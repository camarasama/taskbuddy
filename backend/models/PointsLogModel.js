const { query } = require('../config/database');

class PointsLogModel {
    static async getByMember(memberId, limit = 50, offset = 0) {
        const text = `
            SELECT pl.*, u.full_name as created_by_name
            FROM points_log pl
            LEFT JOIN users u ON pl.created_by = u.user_id
            WHERE pl.family_member_id = $1
            ORDER BY pl.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const result = await query(text, [memberId, limit, offset]);
        return result.rows;
    }

    static async getByUser(userId, familyId, limit = 50) {
        const text = `
            SELECT pl.*, u.full_name as created_by_name
            FROM points_log pl
            JOIN family_members fm ON pl.family_member_id = fm.member_id
            LEFT JOIN users u ON pl.created_by = u.user_id
            WHERE fm.user_id = $1 AND fm.family_id = $2
            ORDER BY pl.created_at DESC
            LIMIT $3
        `;
        const result = await query(text, [userId, familyId, limit]);
        return result.rows;
    }

    static async getByFamily(familyId, limit = 100, offset = 0) {
        const text = `
            SELECT pl.*, 
                   fm.user_id, 
                   u.full_name,
                   creator.full_name as created_by_name
            FROM points_log pl
            JOIN family_members fm ON pl.family_member_id = fm.member_id
            JOIN users u ON fm.user_id = u.user_id
            LEFT JOIN users creator ON pl.created_by = creator.user_id
            WHERE fm.family_id = $1
            ORDER BY pl.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const result = await query(text, [familyId, limit, offset]);
        return result.rows;
    }

    static async getByType(memberId, transactionType, limit = 50) {
        const text = `
            SELECT pl.*, u.full_name as created_by_name
            FROM points_log pl
            LEFT JOIN users u ON pl.created_by = u.user_id
            WHERE pl.family_member_id = $1 AND pl.transaction_type = $2
            ORDER BY pl.created_at DESC
            LIMIT $3
        `;
        const result = await query(text, [memberId, transactionType, limit]);
        return result.rows;
    }

    static async getTotalEarned(memberId) {
        const text = `
            SELECT COALESCE(SUM(points_amount), 0) as total_earned
            FROM points_log
            WHERE family_member_id = $1 AND transaction_type = 'earned'
        `;
        const result = await query(text, [memberId]);
        return parseInt(result.rows[0].total_earned);
    }

    static async getTotalSpent(memberId) {
        const text = `
            SELECT COALESCE(SUM(ABS(points_amount)), 0) as total_spent
            FROM points_log
            WHERE family_member_id = $1 AND transaction_type = 'spent'
        `;
        const result = await query(text, [memberId]);
        return parseInt(result.rows[0].total_spent);
    }

    static async getStatistics(memberId) {
        const text = `
            SELECT 
                COALESCE(SUM(CASE WHEN transaction_type = 'earned' THEN points_amount ELSE 0 END), 0) as total_earned,
                COALESCE(SUM(CASE WHEN transaction_type = 'spent' THEN ABS(points_amount) ELSE 0 END), 0) as total_spent,
                COALESCE(SUM(CASE WHEN transaction_type = 'adjusted' THEN points_amount ELSE 0 END), 0) as total_adjusted,
                COUNT(*) as total_transactions
            FROM points_log
            WHERE family_member_id = $1
        `;
        const result = await query(text, [memberId]);
        return result.rows[0];
    }

    static async deleteOld(daysOld = 365) {
        const text = `
            DELETE FROM points_log 
            WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '${daysOld} days'
            RETURNING log_id
        `;
        const result = await query(text);
        return result.rows.length;
    }
}

module.exports = PointsLogModel;
