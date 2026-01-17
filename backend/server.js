const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskBuddy API is running',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// API ROUTES - Phase 3 & 4 Integration
// ============================================================================

// Phase 3: Core API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/families', require('./routes/family.routes'));
app.use('/api/tasks', require('./routes/task.routes'));
app.use('/api/assignments', require('./routes/assignment.routes'));
app.use('/api/rewards', require('./routes/reward.routes'));
app.use('/api/redemptions', require('./routes/redemption.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/points', require('./routes/points.routes'));

// Phase 4: Reports & Analytics Routes
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/export', require('./routes/export.routes'));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Join family room
  socket.on('join-family', (familyId) => {
    socket.join(`family-${familyId}`);
    console.log(`User joined family room: family-${familyId}`);
  });

  // Leave family room
  socket.on('leave-family', (familyId) => {
    socket.leave(`family-${familyId}`);
    console.log(`User left family room: family-${familyId}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║        🚀 TaskBuddy Server Running        ║
║                                           ║
║  Environment: ${process.env.NODE_ENV || 'development'}                  ║
║  Port: ${PORT}                               ║
║  URL: http://localhost:${PORT}              ║
║                                           ║
╚═══════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

module.exports = { app, io };