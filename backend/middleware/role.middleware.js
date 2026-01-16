// ============================================================================
// Role Middleware
// Role-based access control
// ============================================================================

// ============================================================================
// REQUIRE SPECIFIC ROLE(S)
// ============================================================================
exports.requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
      }

      // Check if user has required role
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.',
          required_roles: allowedRoles,
          your_role: req.user.role
        });
      }

      next();

    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization failed.',
        error: error.message
      });
    }
  };
};

// ============================================================================
// CHECK IF USER IS ADMIN
// ============================================================================
exports.isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();

  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization failed.',
      error: error.message
    });
  }
};

// ============================================================================
// CHECK IF USER IS PARENT OR SPOUSE
// ============================================================================
exports.isParentOrSpouse = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!['parent', 'spouse'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Parent or spouse privileges required.'
      });
    }

    next();

  } catch (error) {
    console.error('Parent/Spouse check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization failed.',
      error: error.message
    });
  }
};

// ============================================================================
// CHECK IF USER IS CHILD
// ============================================================================
exports.isChild = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (req.user.role !== 'child') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This action is only available to children.'
      });
    }

    next();

  } catch (error) {
    console.error('Child check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization failed.',
      error: error.message
    });
  }
};

// ============================================================================
// CHECK IF USER CAN ACCESS RESOURCE (Self or Parent/Spouse)
// ============================================================================
exports.canAccessChild = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const targetChildId = parseInt(req.params.childId) || parseInt(req.body.child_id);

    // Allow if user is accessing their own data
    if (req.user.user_id === targetChildId) {
      return next();
    }

    // Allow if user is parent or spouse
    if (['parent', 'spouse', 'admin'].includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own data.'
    });

  } catch (error) {
    console.error('Access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization failed.',
      error: error.message
    });
  }
};
