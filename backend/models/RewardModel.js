const { query } = require('../config/database');

class RewardModel {
    static async create(rewardData) {
        const text = `
            INSERT INTO rewards (
                family_id, created_by, reward_name, description,
                points_required, quantity_available, reward_image, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [
            rewardData.familyId,
            rewardData.createdBy,
            rewardData.rewardName,
            rewardData.description || null,
            rewardData.pointsRequired,
            rewardData.quantityAvailable || 1,
            rewardData.rewardImage || null,
            rewardData.status || 'available'
        ];
        const result = await query(text, values);
        return result.rows[0];
    }

    static async findById(rewardId) {
        const text = `
            SELECT r.*, u.full_name as creator_name
            FROM rewards r
            LEFT JOIN users u ON r.created_by = u.user_id
            WHERE r.reward_id = $1
        `;
        const result = await query(text, [rewardId]);
        return result.rows[0];
    }

    static async getByFamily(familyId, filters = {}) {
        let text = `
            SELECT r.*, u.full_name as creator_name
            FROM rewards r
            LEFT JOIN users u ON r.created_by = u.user_id
            WHERE r.family_id = $1
        `;
        const values = [familyId];
        let paramCount = 2;

        if (filters.status) {
            text += ` AND r.status = $${paramCount++}`;
            values.push(filters.status);
        }

        text += ` ORDER BY r.points_required ASC`;

        const result = await query(text, values);
        return result.rows;
    }

    static async getAvailable(familyId) {
        const text = `
            SELECT * FROM rewards
            WHERE family_id = $1 
            AND status = 'available'
            AND (quantity_available IS NULL OR quantity_redeemed < quantity_available)
            ORDER BY points_required ASC
        `;
        const result = await query(text, [familyId]);
        return result.rows;
    }

    static async update(rewardId, updateData) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        if (updateData.rewardName !== undefined) {
            fields.push(`reward_name = $${paramCount++}`);
            values.push(updateData.rewardName);
        }
        if (updateData.description !== undefined) {
            fields.push(`description = $${paramCount++}`);
            values.push(updateData.description);
        }
        if (updateData.pointsRequired !== undefined) {
            fields.push(`points_required = $${paramCount++}`);
            values.push(updateData.pointsRequired);
        }
        if (updateData.status !== undefined) {
            fields.push(`status = $${paramCount++}`);
            values.push(updateData.status);
        }

        if (fields.length === 0) return null;

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(rewardId);

        const text = `
            UPDATE rewards 
            SET ${fields.join(', ')}
            WHERE reward_id = $${paramCount}
            RETURNING *
        `;
        const result = await query(text, values);
        return result.rows[0];
    }

    static async decreaseQuantity(rewardId) {
        const text = `
            UPDATE rewards 
            SET quantity_redeemed = quantity_redeemed + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE reward_id = $1 
            AND (quantity_available IS NULL OR quantity_redeemed < quantity_available)
            RETURNING *
        `;
        const result = await query(text, [rewardId]);
        return result.rows[0];
    }

    static async delete(rewardId) {
        const text = 'DELETE FROM rewards WHERE reward_id = $1 RETURNING *';
        const result = await query(text, [rewardId]);
        return result.rows[0];
    }

    static async isAvailable(rewardId) {
        const text = `
            SELECT 
                status = 'available' as is_active,
                (quantity_available IS NULL OR quantity_redeemed < quantity_available) as has_quantity,
                points_required
            FROM rewards 
            WHERE reward_id = $1
        `;
        const result = await query(text, [rewardId]);
        const reward = result.rows[0];
        
        if (!reward) return { available: false, reason: 'Reward not found' };
        if (!reward.is_active) return { available: false, reason: 'Reward is not available' };
        if (!reward.has_quantity) return { available: false, reason: 'Out of stock' };
        
        return { available: true, pointsRequired: reward.points_required };
    }
}

module.exports = RewardModel;
