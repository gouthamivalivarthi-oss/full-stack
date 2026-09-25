require('dotenv').config();
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

// Ensure fallback JWT secret
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'collab_platform_jwt_secret_super_secure_key_2026_xyz';

const path = require('path');
const os = require('os');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

const app = express();

// Safe fallback io object for serverless invocation
const dummyIo = {
  to: () => ({ emit: () => {} }),
  emit: () => {},
  in: () => ({ emit: () => {} }),
};
app.set('io', dummyIo);

// Enable CORS
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

// Ensure database is connected before handling any API request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error in request middleware:', error.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure MongoDB Atlas IP whitelist allows connections (0.0.0.0/0).',
      error: error.message,
    });
  }
});

// Serve uploaded static files
const uploadsDir = process.env.VERCEL
  ? path.join(os.tmpdir(), 'uploads')
  : path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
const healthHandler = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Online Project Collaboration Platform API is running smoothly',
    timestamp: new Date().toISOString(),
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Mount API routes supporting both /api prefix and root prefix
const mountRoutes = (prefix = '') => {
  app.use(`${prefix}/auth`, require('./routes/auth'));
  app.use(`${prefix}/users`, require('./routes/users'));
  app.use(`${prefix}/projects`, require('./routes/projects'));
  app.use(`${prefix}/tasks`, require('./routes/tasks'));
  app.use(`${prefix}/comments`, require('./routes/comments'));
  app.use(`${prefix}/files`, require('./routes/files'));
  app.use(`${prefix}/messages`, require('./routes/messages'));
  app.use(`${prefix}/notifications`, require('./routes/notifications'));
  app.use(`${prefix}/invitations`, require('./routes/invitations'));
  app.use(`${prefix}/dashboard`, require('./routes/dashboard'));
  app.use(`${prefix}/admin`, require('./routes/admin'));
};

mountRoutes('/api');
mountRoutes('');

// 404 Route handler for unknown endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
