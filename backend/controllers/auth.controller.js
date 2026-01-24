// ============================================================================
// Authentication Controller - UPDATED
// Handles user registration, login, email verification, password reset
// Changes: Added registerAdmin, modified register to registerParent
// ============================================================================

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const emailService = require('../services/email.service');
const { generateToken, generateRefreshToken } = require('../utils/helpers');

// ============================================================================
// REGISTER NEW PARENT (Public Registration)
// Only parents can self-register through public route
// ============================================================================
exports.register = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, password, full_name, date_of_birth, phone_number } = req.body;

    await client.query('BEGIN');

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate age (must be 18+)
    const age = calculateAge(date_of_birth);
    if (age < 18) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'You must be at least 18 years old to register'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert new user (force role to parent)
    const result = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role, date_of_birth, phone_number)
       VALUES ($1, $2, $3, 'parent', $4, $5)
       RETURNING user_id, email, full_name, role, created_at`,
      [email, password_hash, full_name, date_of_birth, phone_number]
    );

    const user = result.rows[0];

    // Generate email verification token
    const verificationToken = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send verification email
    await emailService.sendVerificationEmail(user.email, user.full_name, verificationToken);

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  } finally {
    client.release();
  }
};

// ============================================================================
// REGISTER NEW ADMIN (Restricted Route)
// Only accessible with admin secret key
// ============================================================================
exports.registerAdmin = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, password, full_name, date_of_birth, phone_number } = req.body;

    await client.query('BEGIN');

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate age (must be 18+)
    const age = calculateAge(date_of_birth);
    if (age < 18) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Admin must be at least 18 years old'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert new admin user (email already verified, account active)
    const result = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role, date_of_birth, phone_number, email_verified, is_active)
       VALUES ($1, $2, $3, 'admin', $4, $5, true, true)
       RETURNING user_id, email, full_name, role, created_at`,
      [email, password_hash, full_name, date_of_birth, phone_number]
    );

    const admin = result.rows[0];

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      user: {
        user_id: admin.user_id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Admin registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin registration failed',
      error: error.message
    });
  } finally {
    client.release();
  }
};

// ============================================================================
// LOGIN USER
// ============================================================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = result.rows[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Check if email is verified (only for non-admin users)
    if (user.role !== 'admin' && !user.email_verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        profile_picture: user.profile_picture,
        date_of_birth: user.date_of_birth,
        phone_number: user.phone_number
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// ============================================================================
// VERIFY EMAIL
// ============================================================================
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Update user's email_verified status
    const result = await pool.query(
      `UPDATE users 
       SET email_verified = true, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND email = $2
       RETURNING user_id, email, full_name`,
      [decoded.user_id, decoded.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.full_name);

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });

  } catch (error) {
    console.error('Email verification error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Verification link has expired. Please request a new one.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: error.message
    });
  }
};

// ============================================================================
// RESEND VERIFICATION EMAIL
// ============================================================================
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const result = await pool.query(
      'SELECT user_id, email, full_name, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send verification email
    await emailService.sendVerificationEmail(user.email, user.full_name, verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
      error: error.message
    });
  }
};

// ============================================================================
// FORGOT PASSWORD
// ============================================================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const result = await pool.query(
      'SELECT user_id, email, full_name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send password reset email
    await emailService.sendPasswordResetEmail(user.email, user.full_name, resetToken);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: error.message
    });
  }
};

// ============================================================================
// RESET PASSWORD
// ============================================================================
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Update password
    const result = await pool.query(
      `UPDATE users 
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $2 AND email = $3
       RETURNING user_id`,
      [password_hash, decoded.user_id, decoded.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Reset link has expired. Please request a new one.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: error.message
    });
  }
};

// ============================================================================
// GET CURRENT USER
// ============================================================================
exports.getCurrentUser = async (req, res) => {
  try {
    const userResult = await pool.query(
      `SELECT u.user_id, u.email, u.full_name, u.role, u.profile_picture, u.date_of_birth, 
          u.phone_number, u.is_active, u.email_verified, u.created_at, u.last_login,
          fm.family_id, fm.relationship, fm.points_balance
      FROM users u
      LEFT JOIN family_members fm ON u.user_id = fm.user_id AND fm.is_active = TRUE
      WHERE u.user_id = $1`,
      [req.user.user_id]
    );
      const userData = userResult.rows[0];

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    
    res.json({
      success: true,
      data: userData  // ✅ Changed from 'user' to 'data'
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user information',
      error: error.message
    });
  }
};

// ============================================================================
// LOGOUT
// ============================================================================
exports.logout = async (req, res) => {
  try {
    // Update last login timestamp
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [req.user.user_id]
    );

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

// ============================================================================
// CHANGE PASSWORD
// ============================================================================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user's current password hash
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE user_id = $1',
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [password_hash, req.user.user_id]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password change failed',
      error: error.message
    });
  }
};

// ============================================================================
// REFRESH TOKEN
// ============================================================================
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Get user
    const result = await pool.query(
      'SELECT user_id, email, full_name, role FROM users WHERE user_id = $1 AND is_active = true',
      [decoded.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    const user = result.rows[0];

    // Generate new tokens
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      error: error.message
    });
  }
};

// ============================================================================
// HELPER FUNCTION: Calculate Age
// ============================================================================
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}