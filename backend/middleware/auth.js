const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verify JWT token
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      req.user = user; // Attach user info to request
      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

// Check if user is parent or spouse (admin roles)
const isParentOrSpouse = (req, res, next) => {
  if (req.user.role === 'parent' || req.user.role === 'spouse') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Parent or Spouse role required.'
    });
  }
};

// Check if user is child
const isChild = (req, res, next) => {
  if (req.user.role === 'child') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Child role required.'
    });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
};

// Check if user belongs to the same family
const checkFamilyAccess = (req, res, next) => {
  const familyId = req.params.familyId || req.body.familyId;
  
  if (req.user.familyId !== parseInt(familyId)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You do not belong to this family.'
    });
  }
  
  next();
};

module.exports = {
  authenticateToken,
  isParentOrSpouse,
  isChild,
  isAdmin,
  checkFamilyAccess
};
