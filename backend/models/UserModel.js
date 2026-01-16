const { query, transaction } = require('../config/database');

class UserModel {
    static async create(userData) {
        const text = `
            INSERT INTO users (
                email, password_hash, full_name, role, 
                date_of_birth, phone_number, profile_picture, 
                is_active, email_verified
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING user_id, email, full_name, role, date_of_birth, 
                      phone_number, profile_picture, is_active, 
                      email_verified, created_at
        `;
        const values = [
            userData.email,
            userData.passwordHash,
            userData.fullName,
            userData.role,
            userData.dateOfBirth || null,
            userData.phoneNumber || null,
            userData.profilePicture || null,
            userData.isActive !== undefined ? userData.isActive : true,
            userData.emailVerified !== undefined ? userData.emailVerified : false
        ];
        const result = await query(text, values);
        return result.rows[0];
    }

    static async findByEmail(email) {
        const text = 'SELECT * FROM users WHERE email = $1';
        const result = await query(text, [email]);
        return result.rows[0];
    }

    static async findById(userId) {
        const text = `
            SELECT user_id, email, full_name, role, profile_picture,
                   date_of_birth, phone_number, is_active, email_verified,
                   created_at, updated_at, last_login
            FROM users 
            WHERE user_id = $1
        `;
        const result = await query(text, [userId]);
        return result.rows[0];
    }

    static async findByIdWithPassword(userId) {
        const text = 'SELECT * FROM users WHERE user_id = $1';
        const result = await query(text, [userId]);
        return result.rows[0];
    }

    static async verifyEmail(userId) {
        const text = `
            UPDATE users 
            SET email_verified = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $1
            RETURNING user_id, email, email_verified
        `;
        const result = await query(text, [userId]);
        return result.rows[0];
    }

    static async updatePassword(userId, passwordHash) {
        const text = `
            UPDATE users 
            SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $2
            RETURNING user_id
        `;
        const result = await query(text, [passwordHash, userId]);
        return result.rows[0];
    }

    static async updateProfile(userId, updateData) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        if (updateData.fullName !== undefined) {
            fields.push(`full_name = $${paramCount++}`);
            values.push(updateData.fullName);
        }
        if (updateData.dateOfBirth !== undefined) {
            fields.push(`date_of_birth = $${paramCount++}`);
            values.push(updateData.dateOfBirth);
        }
        if (updateData.phoneNumber !== undefined) {
            fields.push(`phone_number = $${paramCount++}`);
            values.push(updateData.phoneNumber);
        }
        if (updateData.profilePicture !== undefined) {
            fields.push(`profile_picture = $${paramCount++}`);
            values.push(updateData.profilePicture);
        }

        if (fields.length === 0) return null;

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(userId);

        const text = `
            UPDATE users 
            SET ${fields.join(', ')}
            WHERE user_id = $${paramCount}
            RETURNING user_id, email, full_name, role, profile_picture,
                      date_of_birth, phone_number, created_at, updated_at
        `;
        const result = await query(text, values);
        return result.rows[0];
    }

    static async updateLastLogin(userId) {
        const text = `
            UPDATE users 
            SET last_login = CURRENT_TIMESTAMP
            WHERE user_id = $1
            RETURNING last_login
        `;
        const result = await query(text, [userId]);
        return result.rows[0];
    }

    static async delete(userId) {
        const text = 'DELETE FROM users WHERE user_id = $1 RETURNING user_id';
        const result = await query(text, [userId]);
        return result.rows[0];
    }

    static async exists(userId) {
        const text = 'SELECT EXISTS(SELECT 1 FROM users WHERE user_id = $1)';
        const result = await query(text, [userId]);
        return result.rows[0].exists;
    }

    static async emailExists(email) {
        const text = 'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)';
        const result = await query(text, [email]);
        return result.rows[0].exists;
    }
}

module.exports = UserModel;
