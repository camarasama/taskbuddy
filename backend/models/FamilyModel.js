const { query, transaction } = require('../config/database');

class FamilyModel {
    static async create(familyName, createdBy, familyCode) {
        const text = `
            INSERT INTO families (family_name, created_by, family_code)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await query(text, [familyName, createdBy, familyCode]);
        return result.rows[0];
    }

    static async findById(familyId) {
        const text = 'SELECT * FROM families WHERE family_id = $1';
        const result = await query(text, [familyId]);
        return result.rows[0];
    }

    static async findByCode(familyCode) {
        const text = 'SELECT * FROM families WHERE family_code = $1';
        const result = await query(text, [familyCode]);
        return result.rows[0];
    }

    static async update(familyId, familyName) {
        const text = `
            UPDATE families 
            SET family_name = $1, updated_at = CURRENT_TIMESTAMP
            WHERE family_id = $2
            RETURNING *
        `;
        const result = await query(text, [familyName, familyId]);
        return result.rows[0];
    }

    static async delete(familyId) {
        const text = 'DELETE FROM families WHERE family_id = $1 RETURNING *';
        const result = await query(text, [familyId]);
        return result.rows[0];
    }

    static async getMembers(familyId) {
        const text = `
            SELECT fm.*, u.email, u.full_name, u.role, u.profile_picture
            FROM family_members fm
            JOIN users u ON fm.user_id = u.user_id
            WHERE fm.family_id = $1 AND fm.is_active = TRUE
            ORDER BY 
                CASE u.role 
                    WHEN 'parent' THEN 1 
                    WHEN 'spouse' THEN 2 
                    WHEN 'child' THEN 3 
                END
        `;
        const result = await query(text, [familyId]);
        return result.rows;
    }

    static async exists(familyId) {
        const text = 'SELECT EXISTS(SELECT 1 FROM families WHERE family_id = $1)';
        const result = await query(text, [familyId]);
        return result.rows[0].exists;
    }
}

module.exports = FamilyModel;
