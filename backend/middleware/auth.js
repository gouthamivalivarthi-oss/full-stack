const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ProjectMember = require('../models/ProjectMember');
const Project = require('../models/Project');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, no token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists',
      });
    }

    if (user.status === 'suspended' || user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated or suspended',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or has expired',
    });
  }
};

// Grant access to specific global platform roles
const authorize = (...roles) => {
  return (req, res, next) => {
    // Normalize role synonyms (e.g., student and user)
    const normalizedUserRole = req.user.role === 'user' ? 'student' : req.user.role;
    const normalizedRoles = roles.map((r) => (r === 'user' ? 'student' : r));

    if (!normalizedRoles.includes(normalizedUserRole)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Check project-level membership and role
const checkProjectAccess = (allowedRoles = ['Owner', 'Manager', 'Member']) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.projectId || req.params.id;

      // Platform admin has full access
      if (req.user.role === 'admin') {
        req.projectRole = 'Owner';
        return next();
      }

      const membership = await ProjectMember.findOne({
        project: projectId,
        user: req.user._id,
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'You are not a member of this project',
        });
      }

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({
          success: false,
          message: `Your project role (${membership.role}) does not allow this operation`,
        });
      }

      req.projectRole = membership.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  protect,
  authorize,
  checkProjectAccess,
};
