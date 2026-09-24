require('dotenv').config();
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Connect to MongoDB Atlas
connectDB();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Online Project Collaboration Platform API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/files', require('./routes/files'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/invitations', require('./routes/invitations'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/admin', require('./routes/admin'));

// 404 Route handler for unknown endpoints
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Real-time Socket.IO Event Handlers
io.on('connection', (socket) => {
  // User joins their personal room for direct messages and notifications
  socket.on('join_user', (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  // User joins project room for live board changes, comments, files
  socket.on('join_project', (projectId) => {
    if (projectId) {
      socket.join(`project:${projectId}`);
    }
  });

  socket.on('leave_project', (projectId) => {
    if (projectId) {
      socket.leave(`project:${projectId}`);
    }
  });

  // Typing indicators for chat
  socket.on('typing_start', ({ conversationId, recipientId, senderName }) => {
    if (recipientId) {
      io.to(`user:${recipientId}`).emit('user_typing', { conversationId, senderName });
    }
  });

  socket.on('typing_stop', ({ conversationId, recipientId }) => {
    if (recipientId) {
      io.to(`user:${recipientId}`).emit('user_stop_typing', { conversationId });
    }
  });

  socket.on('disconnect', () => {
    // disconnected
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = { app, server };
