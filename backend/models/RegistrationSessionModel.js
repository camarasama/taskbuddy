const { query } = require('../config/database');

/**
 * RegistrationSessionModel
 * 
 * This model handles temporary storage of registration data until email verification.
 * In Phase 3, this will be implemented using either:
 * 1. A separate registration_sessions database table, OR
 * 2. Redis for temporary session storage
 * 
 * For now, this is a placeholder. The registration flow will be:
 * 1. User submits registration form
 * 2. Data stored in session (not in users table)
 * 3. Verification email sent
 * 4. User clicks verification link
 * 5. Data moved from session to users/families tables
 * 6. Session deleted
 */

class RegistrationSessionModel {
    // To be implemented in Phase 3
    
    static async create(sessionData) {
        // Store registration data temporarily
        // sessionData = { email, passwordHash, fullName, familyName, verificationToken, expiresAt }
        throw new Error('RegistrationSessionModel not yet implemented - will be done in Phase 3');
    }

    static async findByToken(token) {
        // Find session by verification token
        throw new Error('RegistrationSessionModel not yet implemented - will be done in Phase 3');
    }

    static async delete(sessionId) {
        // Delete session after successful verification
        throw new Error('RegistrationSessionModel not yet implemented - will be done in Phase 3');
    }

    static async cleanExpired() {
        // Clean up expired sessions
        throw new Error('RegistrationSessionModel not yet implemented - will be done in Phase 3');
    }
}

module.exports = RegistrationSessionModel;
