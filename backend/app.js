// ============================================================================
// TaskBuddy - Main Application Entry Point
// Author: Souleymane Camara - BIT1007326
// Regional Maritime University
// ============================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const familyRoutes = require('./routes/family.routes');
const taskRoutes = require('./routes/task.routes');
const assignmentRoutes = require('./routes/assignment.routes');
const rewardRoutes = require('./routes/reward.routes');
const redemptionRoutes = require('./routes/redemption.routes');
const notificationRoutes = require('./routes/notification.routes');
const pointsRoutes = require('./routes/points.routes');
const reportRoutes = require('./routes/report.routes');

// Import services (for scheduled tasks)
const notificationService = require('./services/notification.service');
const taskService = require('./services/task.service');

// ============================================================================
// CREATE EXPRESS APP
// ============================================================================
const app = express();
const server = http.createServer(app);

// ============================================================================
// SOCKET.IO SETUP - Enhanced CORS
// ============================================================================

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible globally
global.io = io;
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Join user-specific room
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`✅ User ${userId} joined their room`);
  });

  // Join family room
  socket.on('join-family', (familyId) => {
    socket.join(`family_${familyId}`);
    console.log(`✅ User joined family room: ${familyId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('👋 Client disconnected:', socket.id);
  });
});

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enhanced CORS configuration - MUST BE BEFORE ROUTES
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS Warning - Origin not in whitelist:', origin);
      // In development, still allow it
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight for 10 minutes
}));

// Handle preflight requests
app.options('*', cors());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files middleware (for uploaded files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - Origin: ${req.get('origin') || 'No origin'}`);
  next();
});

// ============================================================================
// API ROUTES
// ============================================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskBuddy API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: {
      allowedOrigins: allowedOrigins.length,
      currentOrigin: req.get('origin') || 'No origin header'
    }
  });
});

// API version info
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to TaskBuddy API',
    version: '1.0.0',
    student: 'Souleymane Camara - BIT1007326',
    institution: 'Regional Maritime University',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      families: '/api/families',
      tasks: '/api/tasks',
      assignments: '/api/assignments',
      rewards: '/api/rewards',
      redemptions: '/api/redemptions',
      notifications: '/api/notifications',
      points: '/api/points',
      reports: '/api/reports'
    }
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/redemptions', redemptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/reports', reportRoutes);

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// 404 handler - Route not found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error caught:', err);

  // Multer file upload errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: err.message
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Database errors
  if (err.code === '23505') { // Unique constraint violation
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry',
      error: err.detail
    });
  }

  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({
      success: false,
      message: 'Invalid reference',
      error: err.detail
    });
  }

  if (err.code === '23502') { // Not null violation
    return res.status(400).json({
      success: false,
      message: 'Required field missing',
      error: err.detail
    });
  }

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation',
      origin: req.get('origin')
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================================================
// SCHEDULED TASKS
// ============================================================================

// Run deadline reminders every hour
if (process.env.ENABLE_SCHEDULED_TASKS === 'true') {
  console.log('⏰ Scheduled tasks enabled');
  
  setInterval(() => {
    console.log('📧 Running deadline reminders...');
    notificationService.sendDeadlineReminders().catch(err => {
      console.error('❌ Error in deadline reminders:', err);
    });
  }, 60 * 60 * 1000); // Every hour

  // Mark overdue tasks every 30 minutes
  setInterval(() => {
    console.log('⏰ Checking for overdue tasks...');
    notificationService.markOverdueTasks().catch(err => {
      console.error('❌ Error marking overdue tasks:', err);
    });
  }, 30 * 60 * 1000); // Every 30 minutes
}

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log('\n============================================');
  console.log('🚀 TaskBuddy API Server');
  console.log('============================================');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server running on port ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Socket.IO: Enabled`);
  console.log(`CORS Origins: ${allowedOrigins.length} whitelisted`);
  console.log('============================================');
  console.log('📝 Allowed Origins:');
  allowedOrigins.forEach((origin, i) => {
    console.log(`   ${i + 1}. ${origin}`);
  });
  console.log('============================================');
  console.log(`✅ Started at ${new Date().toLocaleString()}`);
  console.log('🔧 Ready for connections...\n');
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGTERM', () => {
  console.log('\n📥 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n📥 SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('❌ Reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('❌ Stack:', error.stack);
  process.exit(1);
});

module.exports = app;