// ============================================================================
// Authentication Validator - NEW FILE
// Validates authentication-related requests
// ============================================================================

// ============================================================================
// VALIDATE PARENT REGISTRATION
// Only validates parent registration (no role selection)
// ============================================================================
exports.validateParentRegistration = (req, res, next) => {
  const { email, password, full_name, date_of_birth } = req.body;
  const errors = [];
  
  // Validate required fields
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (!full_name) errors.push('Full name is required');
  if (!date_of_birth) errors.push('Date of birth is required');
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }
  
  // Validate password strength
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long'
    });
  }
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return res.status(400).json({
      success: false,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    });
  }
  
  // Validate full name
  if (full_name.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Full name must be at least 2 characters long'
    });
  }
  
  // Validate date of birth format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date_of_birth)) {
    return res.status(400).json({
      success: false,
      message: 'Date of birth must be in YYYY-MM-DD format'
    });
  }
  
  // Validate age (18+)
  const age = calculateAge(date_of_birth);
  if (age < 18) {
    return res.status(400).json({
      success: false,
      message: 'You must be at least 18 years old to register'
    });
  }
  
  next();
};

// ============================================================================
// VALIDATE ADMIN REGISTRATION
// Validates admin registration with secret key
// ============================================================================
exports.validateAdminRegistration = (req, res, next) => {
  const { email, password, full_name, date_of_birth, admin_secret } = req.body;
  const errors = [];
  
  // Validate required fields
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (!full_name) errors.push('Full name is required');
  if (!date_of_birth) errors.push('Date of birth is required');
  if (!admin_secret) errors.push('Admin secret key is required');
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }
  
  // Validate password strength
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long'
    });
  }
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return res.status(400).json({
      success: false,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    });
  }
  
  // Validate full name
  if (full_name.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Full name must be at least 2 characters long'
    });
  }
  
  // Validate date of birth format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date_of_birth)) {
    return res.status(400).json({
      success: false,
      message: 'Date of birth must be in YYYY-MM-DD format'
    });
  }
  
  next();
};

// ============================================================================
// VALIDATE CHILD CREATION
// Validates child account creation by parent
// ============================================================================
exports.validateChildCreation = (req, res, next) => {
  const { full_name, date_of_birth, email } = req.body;
  const errors = [];
  
  // Validate required fields
  if (!full_name) errors.push('Full name is required');
  if (!date_of_birth) errors.push('Date of birth is required');
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  // Validate email format (if provided)
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }
  }
  
  // Validate full name
  if (full_name.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Full name must be at least 2 characters long'
    });
  }
  
  // Validate date of birth format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date_of_birth)) {
    return res.status(400).json({
      success: false,
      message: 'Date of birth must be in YYYY-MM-DD format'
    });
  }
  
  // Validate age (10-16)
  const age = calculateAge(date_of_birth);
  if (age < 10 || age > 16) {
    return res.status(400).json({
      success: false,
      message: 'Child must be between 10 and 16 years old'
    });
  }
  
  next();
};

// ============================================================================
// VALIDATE SPOUSE CREATION
// Validates spouse account creation by parent
// ============================================================================
exports.validateSpouseCreation = (req, res, next) => {
  const { full_name, date_of_birth, email } = req.body;
  const errors = [];
  
  // Validate required fields
  if (!full_name) errors.push('Full name is required');
  if (!date_of_birth) errors.push('Date of birth is required');
  if (!email) errors.push('Email is required');
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }
  
  // Validate full name
  if (full_name.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Full name must be at least 2 characters long'
    });
  }
  
  // Validate date of birth format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date_of_birth)) {
    return res.status(400).json({
      success: false,
      message: 'Date of birth must be in YYYY-MM-DD format'
    });
  }
  
  // Validate age (18+)
  const age = calculateAge(date_of_birth);
  if (age < 18) {
    return res.status(400).json({
      success: false,
      message: 'Spouse must be at least 18 years old'
    });
  }
  
  next();
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
