const { query, transaction } = require('../config/database');

class FamilyMemberModel {
    static async create(familyId, userId, relationship) {
        const text = `
            INSERT INTO family_members (family_id, user_id, relationship)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await query(text, [familyId, userId, relationship]);
        return result.rows[0];
    }

    static async findByUserAndFamily(userId, familyId) {
        const text = `
            SELECT * FROM family_members 
            WHERE user_id = $1 AND family_id = $2
        `;
        const result = await query(text, [userId, familyId]);
        return result.rows[0];
    }

    static async getPointsBalance(userId, familyId) {
        const text = `
            SELECT points_balance FROM family_members 
            WHERE user_id = $1 AND family_id = $2
        `;
        const result = await query(text, [userId, familyId]);
        return result.rows[0]?.points_balance || 0;
    }

    static async updatePoints(memberId, pointsChange, description, referenceId, referenceType, createdBy) {
        return await transaction(async (client) => {
            // Get current balance
            const balanceResult = await client.query(
                'SELECT points_balance FROM family_members WHERE member_id = $1',
                [memberId]
            );
            const currentBalance = balanceResult.rows[0]?.points_balance || 0;
            const newBalance = currentBalance + pointsChange;

            // Check for negative balance
            if (newBalance < 0) {
                throw new Error('Insufficient points');
            }

            // Update balance
            await client.query(
                `UPDATE family_members 
                 SET points_balance = $1 
                 WHERE member_id = $2`,
                [newBalance, memberId]
            );

            // Log transaction
            const historyResult = await client.query(
                `INSERT INTO points_log 
                 (family_member_id, transaction_type, points_amount, 
                  reference_type, reference_id, description, created_by)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING *`,
                [
                    memberId,
                    pointsChange > 0 ? 'earned' : 'spent',
                    pointsChange,
                    referenceType,
                    referenceId,
                    description,
                    createdBy
                ]
            );

            return {
                previousBalance: currentBalance,
                newBalance: newBalance,
                pointsChange: pointsChange,
                history: historyResult.rows[0]
            };
        });
    }

    static async delete(memberId) {
        const text = 'DELETE FROM family_members WHERE member_id = $1 RETURNING *';
        const result = await query(text, [memberId]);
        return result.rows[0];
    }
}

module.exports = FamilyMemberModel;
