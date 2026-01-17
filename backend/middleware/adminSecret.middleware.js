// ============================================================================
// Admin Secret Middleware - NEW FILE
// Verifies admin registration secret token
// ============================================================================

require('dotenv').config();

// ============================================================================
// VERIFY ADMIN REGISTRATION SECRET
// ============================================================================
exports.verifyAdminSecret = (req, res, next) => {
  try {
    const { admin_secret } = req.body;
    const validSecret = process.env.ADMIN_REGISTRATION_SECRET;
    
    if (!validSecret) {
      console.error('ADMIN_REGISTRATION_SECRET not configured in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Admin registration is not properly configured'
      });
    }
    
    if (!admin_secret) {
      return res.status(400).json({
        success: false,
        message: 'Admin secret key is required'
      });
    }
    
    if (admin_secret !== validSecret) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin registration secret'
      });
    }
    
    // Secret is valid, proceed to next middleware/controller
    next();
    
  } catch (error) {
    console.error('Admin secret verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify admin secret',
      error: error.message
    });
  }
};
