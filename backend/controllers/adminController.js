const User = require('../models/User');
const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const File = require('../models/File');

// @desc    Get system-wide platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });

    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'Active' });
    const completedProjects = await Project.countDocuments({ status: 'Completed' });
    const planningProjects = await Project.countDocuments({ status: 'Planning' });

    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'COMPLETED' });
    const inProgressTasks = await Task.countDocuments({ status: 'IN PROGRESS' });

    const totalFiles = await File.countDocuments();

    // Role breakdown
    const studentsCount = await User.countDocuments({ role: { $in: ['student', 'user'] } });
    const managersCount = await User.countDocuments({ role: 'manager' });
    const adminsCount = await User.countDocuments({ role: 'admin' });

    // Category breakdown
    const categoryStats = await Project.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
          roles: {
            students: studentsCount,
            managers: managersCount,
            admins: adminsCount,
          },
        },
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          planning: planningProjects,
          categories: categoryStats,
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          inProgress: inProgressTasks,
        },
        files: {
          total: totalFiles,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search, filter, pagination
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'All') {
      if (role === 'student' || role === 'user') {
        query.role = { $in: ['student', 'user'] };
      } else {
        query.role = role;
      }
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort(sort).skip(skip).limit(parseInt(limit));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (active / inactive / suspended)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own account status',
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `User status changed to ${status}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['student', 'user', 'manager', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role value',
      });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own admin role',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: role === 'user' ? 'student' : role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `User role changed to ${role}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Clean up memberships
    await ProjectMember.deleteMany({ user: user._id });
    await Task.updateMany({ assignedTo: user._id }, { assignedTo: null });
    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      success: true,
      message: 'User account removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects for admin
// @route   GET /api/admin/projects
// @access  Private (Admin only)
exports.getAllProjects = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Project.countDocuments(query);

    const projects = await Project.find(query)
      .populate('owner', 'name email profilePicture')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const memberCount = await ProjectMember.countDocuments({ project: project._id });
        const taskCount = await Task.countDocuments({ project: project._id });
        const obj = project.toObject();
        obj.memberCount = memberCount;
        obj.taskCount = taskCount;
        return obj;
      })
    );

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: projectsWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project (admin action)
// @route   DELETE /api/admin/projects/:id
// @access  Private (Admin only)
exports.deleteProjectAdmin = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    await ProjectMember.deleteMany({ project: project._id });
    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully by administrator',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform-wide activity logs
// @route   GET /api/admin/activity
// @access  Private (Admin only)
exports.getPlatformActivity = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await ActivityLog.countDocuments();
    const activities = await ActivityLog.find()
      .populate('user', 'name email role profilePicture')
      .populate('project', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      total,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};
