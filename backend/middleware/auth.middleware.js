// ============================================================================
// Authentication Middleware
// Verifies JWT tokens and authenticates users
// ============================================================================

const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// ============================================================================
// AUTHENTICATE USER (Verify JWT Token)
// ============================================================================
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists and is active
    const result = await pool.query(
      'SELECT user_id, email, full_name, role, is_active FROM users WHERE user_id = $1',
      [decoded.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated.'
      });
    }

    // Attach user to request object
    req.user = {
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    };

    next();

  } catch (error) {
    console.error('Authentication error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed.',
      error: error.message
    });
  }
};

// ============================================================================
// OPTIONAL AUTHENTICATION (For routes that work with or without auth)
// ============================================================================
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      'SELECT user_id, email, full_name, role, is_active FROM users WHERE user_id = $1',
      [decoded.user_id]
    );

    if (result.rows.length > 0 && result.rows[0].is_active) {
      req.user = {
        user_id: result.rows[0].user_id,
        email: result.rows[0].email,
        full_name: result.rows[0].full_name,
        role: result.rows[0].role
      };
    } else {
      req.user = null;
    }

    next();

  } catch (error) {
    // If token verification fails, continue without user
    req.user = null;
    next();
  }
};
