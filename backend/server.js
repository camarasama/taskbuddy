const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler.middleware');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io with enhanced CORS
const io = socketIo(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// ============================================================================
// MIDDLEWARE - Enhanced CORS Configuration
// ============================================================================

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

// CORS middleware - MUST BE BEFORE ROUTES
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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight requests for 10 minutes
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - Origin: ${req.get('origin') || 'No origin'}`);
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskBuddy API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: {
      allowedOrigins: allowedOrigins,
      currentOrigin: req.get('origin') || 'No origin header'
    }
  });
});

// ============================================================================
// API ROUTES - Phase 3 & 4 Integration
// ============================================================================

// Phase 3: Core API Routes
app.use('/api/auth', require('./routes/Auth.routes'));
app.use('/api/users', require('./routes/User.routes'));
app.use('/api/families', require('./routes/Family.routes'));
app.use('/api/tasks', require('./routes/Task.routes'));
app.use('/api/assignments', require('./routes/Assignment.routes'));
app.use('/api/rewards', require('./routes/Reward.routes'));
app.use('/api/redemptions', require('./routes/Redemption.routes'));
app.use('/api/notifications', require('./routes/Notification.routes'));
app.use('/api/points', require('./routes/Points.routes'));

// Phase 4: Reports & Analytics Routes
app.use('/api/reports', require('./routes/Report.routes'));
app.use('/api/analytics', require('./routes/Analytics.routes'));
app.use('/api/export', require('./routes/Export.routes'));

// ============================================================================
// SOCKET.IO CONNECTION HANDLING
// ============================================================================

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Join family room
  socket.on('join-family', (familyId) => {
    socket.join(`family-${familyId}`);
    console.log(`✅ User joined family room: family-${familyId}`);
  });

  // Leave family room
  socket.on('leave-family', (familyId) => {
    socket.leave(`family-${familyId}`);
    console.log(`👋 User left family room: family-${familyId}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// 404 handler - Must be AFTER all routes
app.use(notFound);

// Global error handler - Must be last
app.use(errorHandler);

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║        🚀 TaskBuddy Server Running        ║
║                                           ║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(27)} ║
║  Port: ${PORT.toString().padEnd(34)} ║
║  URL: http://localhost:${PORT}              ║
║                                           ║
║  📡 Socket.IO: Enabled                    ║
║  🌐 CORS: ${allowedOrigins.length} origins whitelisted        ║
║                                           ║
║  Health Check:                            ║
║  http://localhost:${PORT}/api/health        ║
║                                           ║
╚═══════════════════════════════════════════╝

✅ Server started successfully at ${new Date().toLocaleString()}

📝 Allowed CORS Origins:
${allowedOrigins.map((origin, i) => `   ${i + 1}. ${origin}`).join('\n')}

🔧 Ready for connections...
  `);
});

// ============================================================================
// GRACEFUL SHUTDOWN HANDLERS
// ============================================================================

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('❌ Reason:', err);
  // Close server gracefully
  server.close(() => {
    console.log('🛑 Server closed due to unhandled rejection');
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error('❌ Stack:', err.stack);
  // Exit immediately
  process.exit(1);
});

// Handle SIGTERM (for graceful shutdown)
process.on('SIGTERM', () => {
  console.log('📥 SIGTERM received. Closing server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n📥 SIGINT received. Closing server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = { app, io };