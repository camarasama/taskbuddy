// ============================================================================
// User Controller
// Handles user profile management and user-related operations
// ============================================================================

const pool = require('../config/database');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');

// ============================================================================
// GET USER PROFILE
// ============================================================================
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const result = await pool.query(
      `SELECT user_id, email, full_name, role, profile_picture, date_of_birth,
              phone_number, is_active, email_verified, created_at, updated_at, last_login
       FROM users 
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
};

// ============================================================================
// UPDATE USER PROFILE
// ============================================================================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { full_name, date_of_birth, phone_number } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (full_name) {
      updates.push(`full_name = $${paramCount}`);
      values.push(full_name);
      paramCount++;
    }

    if (date_of_birth) {
      updates.push(`date_of_birth = $${paramCount}`);
      values.push(date_of_birth);
      paramCount++;
    }

    if (phone_number) {
      updates.push(`phone_number = $${paramCount}`);
      values.push(phone_number);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Add updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING user_id, email, full_name, role, profile_picture, date_of_birth, 
                phone_number, updated_at
    `;

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// ============================================================================
// UPLOAD PROFILE AVATAR
// ============================================================================
exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.user_id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get old profile picture to delete it
    const oldProfile = await pool.query(
      'SELECT profile_picture FROM users WHERE user_id = $1',
      [userId]
    );

    // Construct file URL (adjust based on your server setup)
    const fileUrl = `/uploads/avatars/${req.file.filename}`;

    // Update database with new avatar URL
    const result = await pool.query(
      `UPDATE users 
       SET profile_picture = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING user_id, email, full_name, profile_picture`,
      [fileUrl, userId]
    );

    // Delete old avatar file if it exists
    if (oldProfile.rows[0].profile_picture) {
      const oldFilePath = path.join(__dirname, '..', oldProfile.rows[0].profile_picture);
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.error('Failed to delete old avatar:', err);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        user: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message
    });
  }
};

// ============================================================================
// DELETE PROFILE AVATAR
// ============================================================================
exports.deleteAvatar = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Get current profile picture
    const result = await pool.query(
      'SELECT profile_picture FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const profilePicture = result.rows[0].profile_picture;

    if (!profilePicture) {
      return res.status(400).json({
        success: false,
        message: 'No profile picture to delete'
      });
    }

    // Remove profile picture from database
    await pool.query(
      `UPDATE users 
       SET profile_picture = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [userId]
    );

    // Delete file from storage
    const filePath = path.join(__dirname, '..', profilePicture);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error('Failed to delete avatar file:', err);
    }

    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully'
    });

  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile picture',
      error: error.message
    });
  }
};

// ============================================================================
// GET USER BY ID
// ============================================================================
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user.user_id;

    // Check if users are in the same family
    const familyCheck = await pool.query(
      `SELECT fm1.family_id 
       FROM family_members fm1
       INNER JOIN family_members fm2 ON fm1.family_id = fm2.family_id
       WHERE fm1.user_id = $1 AND fm2.user_id = $2`,
      [requesterId, userId]
    );

    if (familyCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You can only view profiles of users in your family'
      });
    }

    // Get user profile
    const result = await pool.query(
      `SELECT user_id, email, full_name, role, profile_picture, 
              date_of_birth, phone_number, created_at
       FROM users 
       WHERE user_id = $1 AND is_active = TRUE`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};

// ============================================================================
// DELETE ACCOUNT (Soft Delete)
// ============================================================================
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Soft delete by setting is_active to false
    await pool.query(
      `UPDATE users 
       SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
};

// ============================================================================
// GET ALL USERS (Admin Only)
// ============================================================================
exports.getAllUsers = async (req, res) => {
  try {
    const { role, isActive, search, page = 1, limit = 20 } = req.query;
    
    const offset = (page - 1) * limit;
    let query = `SELECT user_id, email, full_name, role, profile_picture, 
                        is_active, email_verified, created_at, last_login
                 FROM users WHERE 1=1`;
    const values = [];
    let paramCount = 1;

    // Add filters
    if (role) {
      query += ` AND role = $${paramCount}`;
      values.push(role);
      paramCount++;
    }

    if (isActive !== undefined) {
      query += ` AND is_active = $${paramCount}`;
      values.push(isActive === 'true');
      paramCount++;
    }

    if (search) {
      query += ` AND (full_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }

    // Get total count
    const countQuery = query.replace('SELECT user_id, email, full_name, role, profile_picture, is_active, email_verified, created_at, last_login', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, values);
    const totalUsers = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      data: {
        users: result.rows,
        pagination: {
          total: totalUsers,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalUsers / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
};

// ============================================================================
// TOGGLE USER STATUS (Admin Only)
// ============================================================================
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET is_active = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING user_id, email, full_name, is_active`,
      [isActive, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

// ============================================================================
// PERMANENTLY DELETE USER (Admin Only)
// ============================================================================
exports.permanentlyDeleteUser = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { userId } = req.params;

    await client.query('BEGIN');

    // Check if user exists
    const userCheck = await client.query(
      'SELECT user_id, profile_picture FROM users WHERE user_id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userCheck.rows[0];

    // Delete profile picture file if exists
    if (user.profile_picture) {
      const filePath = path.join(__dirname, '..', user.profile_picture);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error('Failed to delete profile picture:', err);
      }
    }

    // Delete user (CASCADE will handle related records)
    await client.query('DELETE FROM users WHERE user_id = $1', [userId]);

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'User permanently deleted'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Permanently delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  } finally {
    client.release();
  }
};
