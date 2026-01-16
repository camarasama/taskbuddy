// ============================================================================
// Helper Functions
// Utility functions used across the application
// ============================================================================

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ============================================================================
// JWT TOKEN GENERATION
// ============================================================================

/**
 * Generate JWT access token
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
exports.generateToken = (user) => {
  const payload = {
    user_id: user.user_id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * Generate JWT refresh token
 * @param {Object} user - User object
 * @returns {String} Refresh token
 */
exports.generateRefreshToken = (user) => {
  const payload = {
    user_id: user.user_id,
    email: user.email
  };

  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ============================================================================
// FAMILY CODE GENERATION
// ============================================================================

/**
 * Generate unique family code
 * @returns {String} Family code (e.g., "SMITH2024")
 */
exports.generateFamilyCode = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  let code = '';
  
  // 4 random letters
  for (let i = 0; i < 4; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // 4 random numbers
  for (let i = 0; i < 4; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return code;
};

// ============================================================================
// RANDOM TOKEN GENERATION
// ============================================================================

/**
 * Generate random token for verification/reset
 * @param {Number} length - Token length
 * @returns {String} Random token
 */
exports.generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @returns {String} Formatted date
 */
exports.formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return d.toLocaleDateString('en-US', options);
};

/**
 * Format date to simple date string (YYYY-MM-DD)
 * @param {Date} date - Date object
 * @returns {String} Date string
 */
exports.formatSimpleDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Calculate days until date
 * @param {Date} targetDate - Target date
 * @returns {Number} Days remaining
 */
exports.daysUntil = (targetDate) => {
  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Check if date is overdue
 * @param {Date} dueDate - Due date
 * @returns {Boolean} Is overdue
 */
exports.isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Capitalize first letter of string
 * @param {String} str - Input string
 * @returns {String} Capitalized string
 */
exports.capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Slugify string (for URLs)
 * @param {String} str - Input string
 * @returns {String} Slugified string
 */
exports.slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Truncate string to specified length
 * @param {String} str - Input string
 * @param {Number} length - Max length
 * @returns {String} Truncated string
 */
exports.truncate = (str, length = 100) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Remove duplicates from array
 * @param {Array} arr - Input array
 * @returns {Array} Array without duplicates
 */
exports.removeDuplicates = (arr) => {
  return [...new Set(arr)];
};

/**
 * Shuffle array
 * @param {Array} arr - Input array
 * @returns {Array} Shuffled array
 */
exports.shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate email format
 * @param {String} email - Email address
 * @returns {Boolean} Is valid email
 */
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic)
 * @param {String} phone - Phone number
 * @returns {Boolean} Is valid phone
 */
exports.isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Check if string is strong password
 * @param {String} password - Password
 * @returns {Object} Validation result
 */
exports.isStrongPassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const isStrong = password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
  
  return {
    isValid: isStrong,
    length: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  };
};

// ============================================================================
// PAGINATION HELPERS
// ============================================================================

/**
 * Calculate pagination metadata
 * @param {Number} total - Total items
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
exports.getPaginationMeta = (total, page = 1, limit = 20) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages,
    hasNextPage,
    hasPrevPage
  };
};

// ============================================================================
// RESPONSE FORMATTERS
// ============================================================================

/**
 * Success response formatter
 * @param {Object} data - Response data
 * @param {String} message - Success message
 * @returns {Object} Formatted response
 */
exports.successResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

/**
 * Error response formatter
 * @param {String} message - Error message
 * @param {Object} errors - Error details
 * @returns {Object} Formatted response
 */
exports.errorResponse = (message = 'An error occurred', errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return response;
};

// ============================================================================
// FILE UTILITIES
// ============================================================================

/**
 * Get file extension
 * @param {String} filename - File name
 * @returns {String} File extension
 */
exports.getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Generate unique filename
 * @param {String} originalName - Original filename
 * @returns {String} Unique filename
 */
exports.generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const extension = exports.getFileExtension(originalName);
  return `${timestamp}-${random}.${extension}`;
};

// ============================================================================
// NUMBER UTILITIES
// ============================================================================

/**
 * Format number with commas
 * @param {Number} num - Number to format
 * @returns {String} Formatted number
 */
exports.formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Calculate percentage
 * @param {Number} value - Value
 * @param {Number} total - Total
 * @returns {Number} Percentage
 */
exports.calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// ============================================================================
// SANITIZATION
// ============================================================================

/**
 * Sanitize user input (basic XSS prevention)
 * @param {String} input - User input
 * @returns {String} Sanitized input
 */
exports.sanitizeInput = (input) => {
  if (!input) return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// ============================================================================
// ASYNC UTILITIES
// ============================================================================

/**
 * Sleep/delay function
 * @param {Number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
exports.sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry async function
 * @param {Function} fn - Async function to retry
 * @param {Number} retries - Number of retries
 * @param {Number} delay - Delay between retries (ms)
 * @returns {Promise} Result of function
 */
exports.retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await exports.sleep(delay);
    return exports.retry(fn, retries - 1, delay);
  }
};
