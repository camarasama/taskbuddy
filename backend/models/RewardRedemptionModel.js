const { query, transaction } = require('../config/database');
const FamilyMemberModel = require('./FamilyMemberModel');
const RewardModel = require('./RewardModel');

class RewardRedemptionModel {
    static async create(redemptionData) {
        const text = `
            INSERT INTO reward_redemptions (
                reward_id, child_id, family_id, points_spent
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [
            redemptionData.rewardId,
            redemptionData.childId,
            redemptionData.familyId,
            redemptionData.pointsSpent
        ];
        const result = await query(text, values);
        return result.rows[0];
    }

    static async findById(redemptionId) {
        const text = `
            SELECT rr.*, 
                   r.reward_name, r.points_required,
                   u.full_name as child_name
            FROM reward_redemptions rr
            JOIN rewards r ON rr.reward_id = r.reward_id
            JOIN users u ON rr.child_id = u.user_id
            WHERE rr.redemption_id = $1
        `;
        const result = await query(text, [redemptionId]);
        return result.rows[0];
    }

    static async getByChild(childId, filters = {}) {
        let text = `
            SELECT rr.*, r.reward_name, r.reward_image
            FROM reward_redemptions rr
            JOIN rewards r ON rr.reward_id = r.reward_id
            WHERE rr.child_id = $1
        `;
        const values = [childId];
        let paramCount = 2;

        if (filters.status) {
            text += ` AND rr.status = $${paramCount++}`;
            values.push(filters.status);
        }

        text += ` ORDER BY rr.requested_at DESC`;

        const result = await query(text, values);
        return result.rows;
    }

    static async getByFamily(familyId, filters = {}) {
        let text = `
            SELECT rr.*, 
                   r.reward_name,
                   u.full_name as child_name
            FROM reward_redemptions rr
            JOIN rewards r ON rr.reward_id = r.reward_id
            JOIN users u ON rr.child_id = u.user_id
            WHERE rr.family_id = $1
        `;
        const values = [familyId];
        let paramCount = 2;

        if (filters.status) {
            text += ` AND rr.status = $${paramCount++}`;
            values.push(filters.status);
        }

        text += ` ORDER BY rr.requested_at DESC`;

        const result = await query(text, values);
        return result.rows;
    }

    static async getPending(familyId) {
        const text = `
            SELECT rr.*, 
                   r.reward_name, r.points_required,
                   u.full_name as child_name,
                   fm.points_balance as child_current_points
            FROM reward_redemptions rr
            JOIN rewards r ON rr.reward_id = r.reward_id
            JOIN users u ON rr.child_id = u.user_id
            JOIN family_members fm ON u.user_id = fm.user_id AND fm.family_id = $1
            WHERE rr.family_id = $1 AND rr.status = 'pending'
            ORDER BY rr.requested_at ASC
        `;
        const result = await query(text, [familyId]);
        return result.rows;
    }

    static async approve(redemptionId, reviewedBy, comments = null) {
        return await transaction(async (client) => {
            // Get redemption details
            const redemptionResult = await client.query(
                'SELECT * FROM reward_redemptions WHERE redemption_id = $1',
                [redemptionId]
            );
            const redemption = redemptionResult.rows[0];

            if (!redemption) {
                throw new Error('Redemption not found');
            }

            // Update redemption status
            await client.query(
                `UPDATE reward_redemptions 
                 SET status = 'approved',
                     reviewed_by = $1,
                     reviewed_at = CURRENT_TIMESTAMP,
                     review_notes = $2
                 WHERE redemption_id = $3`,
                [reviewedBy, comments, redemptionId]
            );

            // Get family member
            const memberResult = await client.query(
                `SELECT member_id FROM family_members 
                 WHERE user_id = $1 AND family_id = $2`,
                [redemption.child_id, redemption.family_id]
            );

            // Deduct points
            await FamilyMemberModel.updatePoints(
                memberResult.rows[0].member_id,
                -redemption.points_spent,
                'Reward redeemed',
                redemptionId,
                'reward',
                reviewedBy
            );

            // Decrease reward quantity
            await RewardModel.decreaseQuantity(redemption.reward_id);

            return { redemptionId, status: 'approved' };
        });
    }

    static async deny(redemptionId, reviewedBy, comments = null) {
        const text = `
            UPDATE reward_redemptions 
            SET status = 'denied',
                reviewed_by = $1,
                reviewed_at = CURRENT_TIMESTAMP,
                review_notes = $2
            WHERE redemption_id = $3
            RETURNING *
        `;
        const result = await query(text, [reviewedBy, comments, redemptionId]);
        return result.rows[0];
    }

    static async cancel(redemptionId) {
        const text = `
            UPDATE reward_redemptions 
            SET status = 'cancelled'
            WHERE redemption_id = $1 AND status = 'pending'
            RETURNING *
        `;
        const result = await query(text, [redemptionId]);
        return result.rows[0];
    }

    static async delete(redemptionId) {
        const text = `
            DELETE FROM reward_redemptions 
            WHERE redemption_id = $1 AND status = 'pending'
            RETURNING *
        `;
        const result = await query(text, [redemptionId]);
        return result.rows[0];
    }
}

module.exports = RewardRedemptionModel;
