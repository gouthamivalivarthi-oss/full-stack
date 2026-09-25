const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');

const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

// Update io on app instance
app.set('io', io);

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

const connectDB = require('./config/db');

if (require.main === module || !process.env.VERCEL) {
  server.listen(PORT, '0.0.0.0', async () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    try {
      await connectDB();
    } catch (err) {
      console.error('Initial MongoDB connection warning:', err.message);
    }
  });
}

module.exports = { app, server };
