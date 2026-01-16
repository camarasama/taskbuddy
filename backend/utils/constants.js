// ============================================================================
// Application Constants
// Centralized constants used across the application
// ============================================================================

// ============================================================================
// USER ROLES
// ============================================================================
exports.ROLES = {
  ADMIN: 'admin',
  PARENT: 'parent',
  SPOUSE: 'spouse',
  CHILD: 'child'
};

// ============================================================================
// TASK STATUSES
// ============================================================================
exports.TASK_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived'
};

// ============================================================================
// TASK PRIORITIES
// ============================================================================
exports.TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// ============================================================================
// ASSIGNMENT STATUSES
// ============================================================================
exports.ASSIGNMENT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  OVERDUE: 'overdue'
};

// ============================================================================
// REWARD STATUSES
// ============================================================================
exports.REWARD_STATUS = {
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
  ARCHIVED: 'archived'
};

// ============================================================================
// REDEMPTION STATUSES
// ============================================================================
exports.REDEMPTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DENIED: 'denied',
  CANCELLED: 'cancelled'
};

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================
exports.NOTIFICATION_TYPES = {
  // Task notifications
  TASK_ASSIGNED: 'task_assigned',
  DEADLINE_REMINDER: 'deadline_reminder',
  TASK_OVERDUE: 'task_overdue',
  TASK_SUBMITTED: 'task_submitted',
  TASK_APPROVED: 'task_approved',
  TASK_REJECTED: 'task_rejected',
  
  // Reward notifications
  REWARD_REQUESTED: 'reward_requested',
  REWARD_APPROVED: 'reward_approved',
  REWARD_DENIED: 'reward_denied',
  
  // Points notifications
  POINTS_EARNED: 'points_earned',
  
  // General notifications
  GENERAL: 'general'
};

// ============================================================================
// POINTS TRANSACTION TYPES
// ============================================================================
exports.TRANSACTION_TYPES = {
  EARNED: 'earned',
  SPENT: 'spent',
  ADJUSTED: 'adjusted'
};

// ============================================================================
// REFERENCE TYPES
// ============================================================================
exports.REFERENCE_TYPES = {
  TASK: 'task',
  REWARD: 'reward',
  ASSIGNMENT: 'assignment',
  REDEMPTION: 'redemption',
  MANUAL: 'manual'
};

// ============================================================================
// RECURRENCE PATTERNS
// ============================================================================
exports.RECURRENCE_PATTERNS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

// ============================================================================
// FAMILY RELATIONSHIPS
// ============================================================================
exports.FAMILY_RELATIONSHIPS = {
  PARENT: 'parent',
  SPOUSE: 'spouse',
  CHILD: 'child'
};

// ============================================================================
// FILE UPLOAD LIMITS
// ============================================================================
exports.FILE_LIMITS = {
  MAX_AVATAR_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_TASK_PHOTO_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_REWARD_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
};

// ============================================================================
// PAGINATION DEFAULTS
// ============================================================================
exports.PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// ============================================================================
// VALIDATION RULES
// ============================================================================
exports.VALIDATION = {
  // Password rules
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_NUMBER: true,
  PASSWORD_REQUIRE_SPECIAL_CHAR: false,
  
  // Name rules
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  
  // Task rules
  TASK_TITLE_MIN_LENGTH: 3,
  TASK_TITLE_MAX_LENGTH: 255,
  TASK_DESCRIPTION_MAX_LENGTH: 1000,
  MIN_POINTS_REWARD: 1,
  MAX_POINTS_REWARD: 10000,
  
  // Reward rules
  REWARD_NAME_MIN_LENGTH: 2,
  REWARD_NAME_MAX_LENGTH: 255,
  REWARD_DESCRIPTION_MAX_LENGTH: 500,
  
  // Family rules
  FAMILY_NAME_MIN_LENGTH: 2,
  FAMILY_NAME_MAX_LENGTH: 100,
  FAMILY_CODE_LENGTH: 8
};

// ============================================================================
// DATE/TIME CONSTANTS
// ============================================================================
exports.TIME = {
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
  ONE_MONTH: 30 * 24 * 60 * 60 * 1000
};

// ============================================================================
// JWT SETTINGS
// ============================================================================
exports.JWT = {
  ACCESS_TOKEN_EXPIRY: '24h',
  REFRESH_TOKEN_EXPIRY: '7d',
  RESET_TOKEN_EXPIRY: '1h',
  VERIFICATION_TOKEN_EXPIRY: '24h'
};

// ============================================================================
// EMAIL SETTINGS
// ============================================================================
exports.EMAIL = {
  FROM_NAME: 'TaskBuddy',
  SUPPORT_EMAIL: 'support@taskbuddy.com',
  NO_REPLY_EMAIL: 'noreply@taskbuddy.com'
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================
exports.ERROR_MESSAGES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_INACTIVE: 'Your account has been deactivated',
  EMAIL_NOT_VERIFIED: 'Please verify your email before logging in',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  UNAUTHORIZED: 'Access denied. Authentication required.',
  FORBIDDEN: 'Access denied. Insufficient permissions.',
  
  // User errors
  USER_NOT_FOUND: 'User not found',
  EMAIL_EXISTS: 'Email already in use',
  
  // Family errors
  FAMILY_NOT_FOUND: 'Family not found',
  NOT_FAMILY_MEMBER: 'You are not a member of this family',
  INVALID_FAMILY_CODE: 'Invalid family code',
  
  // Task errors
  TASK_NOT_FOUND: 'Task not found',
  TASK_INACTIVE: 'Task is not active',
  
  // Assignment errors
  ASSIGNMENT_NOT_FOUND: 'Assignment not found',
  PHOTO_REQUIRED: 'Photo is required for this task',
  
  // Reward errors
  REWARD_NOT_FOUND: 'Reward not found',
  REWARD_UNAVAILABLE: 'Reward is not available',
  INSUFFICIENT_POINTS: 'Insufficient points balance',
  
  // General errors
  SERVER_ERROR: 'An error occurred. Please try again.',
  VALIDATION_ERROR: 'Validation failed',
  FILE_UPLOAD_ERROR: 'File upload failed'
};

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================
exports.SUCCESS_MESSAGES = {
  // Authentication
  REGISTRATION_SUCCESS: 'Registration successful. Please check your email to verify your account.',
  LOGIN_SUCCESS: 'Login successful',
  EMAIL_VERIFIED: 'Email verified successfully. You can now login.',
  PASSWORD_RESET_EMAIL_SENT: 'Password reset email sent successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  
  // User
  PROFILE_UPDATED: 'Profile updated successfully',
  AVATAR_UPLOADED: 'Profile picture uploaded successfully',
  
  // Family
  FAMILY_CREATED: 'Family created successfully',
  FAMILY_UPDATED: 'Family updated successfully',
  MEMBER_ADDED: 'Family member added successfully',
  
  // Task
  TASK_CREATED: 'Task created successfully',
  TASK_UPDATED: 'Task updated successfully',
  TASK_DELETED: 'Task deleted successfully',
  
  // Assignment
  TASK_ASSIGNED: 'Task assigned successfully',
  TASK_SUBMITTED: 'Task submitted successfully',
  TASK_APPROVED: 'Task approved successfully',
  
  // Reward
  REWARD_CREATED: 'Reward created successfully',
  REWARD_UPDATED: 'Reward updated successfully',
  REDEMPTION_REQUESTED: 'Redemption requested successfully',
  REDEMPTION_APPROVED: 'Redemption approved successfully',
  
  // Points
  POINTS_AWARDED: 'Points awarded successfully',
  POINTS_ADJUSTED: 'Points adjusted successfully'
};

// ============================================================================
// HTTP STATUS CODES
// ============================================================================
exports.HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};

// ============================================================================
// REGEX PATTERNS
// ============================================================================
exports.REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-()]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  ALPHA_ONLY: /^[a-zA-Z\s]+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/
};

// ============================================================================
// RATE LIMITING
// ============================================================================
exports.RATE_LIMITS = {
  LOGIN_ATTEMPTS: 5,
  LOGIN_WINDOW: 15 * 60 * 1000, // 15 minutes
  API_REQUESTS: 100,
  API_WINDOW: 15 * 60 * 1000 // 15 minutes
};

// ============================================================================
// SOCKET.IO EVENTS
// ============================================================================
exports.SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  NOTIFICATION: 'notification',
  TASK_ASSIGNED: 'task_assigned',
  TASK_UPDATED: 'task_updated',
  POINTS_UPDATED: 'points_updated',
  REWARD_UPDATED: 'reward_updated'
};

// ============================================================================
// CACHE KEYS
// ============================================================================
exports.CACHE_KEYS = {
  USER_PREFIX: 'user:',
  FAMILY_PREFIX: 'family:',
  TASK_PREFIX: 'task:',
  LEADERBOARD_PREFIX: 'leaderboard:'
};

// ============================================================================
// CACHE TTL (Time To Live)
// ============================================================================
exports.CACHE_TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 15 * 60, // 15 minutes
  LONG: 60 * 60 // 1 hour
};
