const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const Task = require('../models/Task');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const ActivityLog = require('../models/ActivityLog');
const logActivity = require('../utils/activityLogger');
const createNotification = require('../utils/notificationHelper');

// Helper to recalculate project progress based on completed tasks
const recalculateProjectProgress = async (projectId) => {
  try {
    const totalTasks = await Task.countDocuments({ project: projectId });
    if (totalTasks === 0) {
      await Project.findByIdAndUpdate(projectId, { progress: 0 });
      return 0;
    }
    const completedTasks = await Task.countDocuments({
      project: projectId,
      status: 'COMPLETED',
    });
    const progress = Math.round((completedTasks / totalTasks) * 100);
    await Project.findByIdAndUpdate(projectId, { progress });
    return progress;
  } catch (err) {
    console.error('Failed to recalculate project progress:', err.message);
  }
};

// @desc    Get all projects for current user (or all projects for admin)
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    const { search, status, priority, category, sort = '-createdAt', page = 1, limit = 50 } = req.query;

    let query = {};

    // Non-admin users see projects they own or are members of
    if (req.user.role !== 'admin') {
      const userMemberships = await ProjectMember.find({ user: req.user._id }).select('project');
      const memberProjectIds = userMemberships.map((m) => m.project);
      query.$or = [{ owner: req.user._id }, { _id: { $in: memberProjectIds } }];
    }

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Project.countDocuments(query);

    const projects = await Project.find(query)
      .populate('owner', 'name email profilePicture role')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Attach member count and task counts
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const memberCount = await ProjectMember.countDocuments({ project: project._id });
        const taskCount = await Task.countDocuments({ project: project._id });
        const completedTaskCount = await Task.countDocuments({
          project: project._id,
          status: 'COMPLETED',
        });
        const doc = project.toObject();
        doc.memberCount = memberCount;
        doc.taskCount = taskCount;
        doc.completedTaskCount = completedTaskCount;
        return doc;
      })
    );

    res.status(200).json({
      success: true,
      count: projectsWithCounts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: projectsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, category, startDate, deadline, priority, tags } = req.body;

    if (!name || !description || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide project name, description, and deadline',
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description,
      category: category || 'Web Development',
      startDate: startDate || Date.now(),
      deadline,
      priority: priority || 'Medium',
      owner: req.user._id,
      tags: Array.isArray(tags) ? tags : [],
    });

    // Automatically create ProjectMember record for the owner
    await ProjectMember.create({
      project: project._id,
      user: req.user._id,
      role: 'Owner',
    });

    const populatedProject = await Project.findById(project._id).populate(
      'owner',
      'name email profilePicture role'
    );

    // Log Activity
    await logActivity({
      project: project._id,
      user: req.user._id,
      action: 'project_created',
      details: `Project "${project.name}" was created by ${req.user.name}`,
      io: req.app.get('io'),
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: populatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project details
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      'owner',
      'name email profilePicture role'
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check membership
    let userRole = null;
    if (req.user.role === 'admin') {
      userRole = 'Owner';
    } else {
      const membership = await ProjectMember.findOne({
        project: project._id,
        user: req.user._id,
      });

      if (!membership && project.owner._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this project',
        });
      }
      userRole = membership ? membership.role : 'Member';
    }

    // Refresh progress
    const progress = await recalculateProjectProgress(project._id);

    const members = await ProjectMember.find({ project: project._id })
      .populate('user', 'name email profilePicture role skills')
      .sort('joinedAt');

    const totalTasks = await Task.countDocuments({ project: project._id });
    const completedTasks = await Task.countDocuments({ project: project._id, status: 'COMPLETED' });
    const pendingTasks = totalTasks - completedTasks;

    const projectData = project.toObject();
    projectData.progress = progress;
    projectData.members = members;
    projectData.currentUserRole = userRole;
    projectData.stats = {
      totalTasks,
      completedTasks,
      pendingTasks,
      totalMembers: members.length,
    };

    res.status(200).json({
      success: true,
      data: projectData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check permission: Owner, Manager, or Admin
    if (req.user.role !== 'admin') {
      const member = await ProjectMember.findOne({
        project: project._id,
        user: req.user._id,
      });
      if (!member || (member.role !== 'Owner' && member.role !== 'Manager')) {
        return res.status(403).json({
          success: false,
          message: 'Only Project Owner or Manager can edit project details',
        });
      }
    }

    const { name, description, category, deadline, status, priority, tags } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (description) updates.description = description;
    if (category) updates.category = category;
    if (deadline) updates.deadline = deadline;
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (tags) updates.tags = Array.isArray(tags) ? tags : [];

    project = await Project.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('owner', 'name email profilePicture role');

    await logActivity({
      project: project._id,
      user: req.user._id,
      action: 'project_updated',
      details: `Project "${project.name}" details updated by ${req.user.name}`,
      io: req.app.get('io'),
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete or archive project
// @route   DELETE /api/projects/:id
// @access  Private (Owner or Admin)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (req.user.role !== 'admin' && project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner or system administrator can delete this project',
      });
    }

    // Clean up members, tasks, and invitations
    await ProjectMember.deleteMany({ project: project._id });
    await Task.deleteMany({ project: project._id });
    await Invitation.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);

    res.status(200).json({
      success: true,
      message: 'Project and associated data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project members
// @route   GET /api/projects/:id/members
// @access  Private
exports.getProjectMembers = async (req, res, next) => {
  try {
    const members = await ProjectMember.find({ project: req.params.id })
      .populate('user', 'name email profilePicture role skills bio phone status')
      .sort('joinedAt');

    res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Invite member to project
// @route   POST /api/projects/:id/invite
// @access  Private
exports.inviteMember = async (req, res, next) => {
  try {
    const { email, role = 'Member' } = req.body;
    const projectId = req.params.id;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user email to invite',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check inviter permissions
    if (req.user.role !== 'admin') {
      const inviterMember = await ProjectMember.findOne({
        project: projectId,
        user: req.user._id,
      });
      if (!inviterMember || (inviterMember.role !== 'Owner' && inviterMember.role !== 'Manager')) {
        return res.status(403).json({
          success: false,
          message: 'Only Project Owner or Manager can invite members',
        });
      }
    }

    const targetUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (targetUser) {
      // Check if already a member
      const existingMember = await ProjectMember.findOne({
        project: projectId,
        user: targetUser._id,
      });
      if (existingMember) {
        return res.status(409).json({
          success: false,
          message: 'This user is already a member of the project',
        });
      }

      // Add directly as project member
      const newMember = await ProjectMember.create({
        project: projectId,
        user: targetUser._id,
        role: role === 'Manager' ? 'Manager' : 'Member',
      });

      const populatedMember = await ProjectMember.findById(newMember._id).populate(
        'user',
        'name email profilePicture role skills'
      );

      // Notify the invited user
      await createNotification({
        user: targetUser._id,
        type: 'project_invite',
        message: `You were added to project "${project.name}" as ${role}`,
        relatedProject: project._id,
        io: req.app.get('io'),
      });

      // Log Activity
      await logActivity({
        project: project._id,
        user: req.user._id,
        action: 'member_joined',
        details: `${targetUser.name} (${targetUser.email}) was added as ${role} by ${req.user.name}`,
        io: req.app.get('io'),
      });

      return res.status(201).json({
        success: true,
        message: `${targetUser.name} added to project successfully`,
        data: populatedMember,
      });
    } else {
      // User does not exist yet: create pending Invitation
      const existingInvite = await Invitation.findOne({
        project: projectId,
        invitedEmail: email.toLowerCase().trim(),
        status: 'pending',
      });

      if (existingInvite) {
        return res.status(409).json({
          success: false,
          message: 'An invitation is already pending for this email address',
        });
      }

      const invite = await Invitation.create({
        project: projectId,
        invitedEmail: email.toLowerCase().trim(),
        invitedBy: req.user._id,
        role: role === 'Manager' ? 'Manager' : 'Member',
      });

      return res.status(201).json({
        success: true,
        message: `Invitation recorded for ${email}. Once they register, they can join.`,
        data: invite,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private
exports.removeMember = async (req, res, next) => {
  try {
    const { id: projectId, userId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Cannot remove project owner
    if (project.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the project owner',
      });
    }

    // Check authorization: Owner, Manager, Admin, or self-leaving
    const isSelf = req.user._id.toString() === userId;
    if (!isSelf && req.user.role !== 'admin') {
      const currentMember = await ProjectMember.findOne({
        project: projectId,
        user: req.user._id,
      });
      if (!currentMember || (currentMember.role !== 'Owner' && currentMember.role !== 'Manager')) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to remove members',
        });
      }
    }

    const removed = await ProjectMember.findOneAndDelete({
      project: projectId,
      user: userId,
    });

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in project',
      });
    }

    const removedUser = await User.findById(userId);

    // Unassign tasks from removed user
    await Task.updateMany({ project: projectId, assignedTo: userId }, { assignedTo: null });

    await logActivity({
      project: project._id,
      user: req.user._id,
      action: 'member_removed',
      details: `${removedUser ? removedUser.name : 'User'} was removed from the project`,
      io: req.app.get('io'),
    });

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project member role
// @route   PUT /api/projects/:id/members/:userId
// @access  Private
exports.updateMemberRole = async (req, res, next) => {
  try {
    const { id: projectId, userId } = req.params;
    const { role } = req.body;

    if (!['Owner', 'Manager', 'Member'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Only owner or admin can change member roles
    if (req.user.role !== 'admin' && project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner or system admin can change member roles',
      });
    }

    const member = await ProjectMember.findOneAndUpdate(
      { project: projectId, user: userId },
      { role },
      { new: true }
    ).populate('user', 'name email profilePicture role');

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in project',
      });
    }

    await logActivity({
      project: project._id,
      user: req.user._id,
      action: 'member_role_changed',
      details: `${member.user.name}'s role was updated to ${role}`,
      io: req.app.get('io'),
    });

    res.status(200).json({
      success: true,
      message: `Role updated to ${role}`,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project activity log
// @route   GET /api/projects/:id/activity
// @access  Private
exports.getProjectActivity = async (req, res, next) => {
  try {
    const activities = await ActivityLog.find({ project: req.params.id })
      .populate('user', 'name email profilePicture role')
      .sort('-createdAt')
      .limit(50);

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project stats
// @route   GET /api/projects/:id/stats
// @access  Private
exports.getProjectStats = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const tasks = await Task.find({ project: projectId });

    const statusCounts = {
      TODO: 0,
      'IN PROGRESS': 0,
      REVIEW: 0,
      COMPLETED: 0,
    };

    const priorityCounts = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0,
    };

    tasks.forEach((t) => {
      if (statusCounts[t.status] !== undefined) statusCounts[t.status]++;
      if (priorityCounts[t.priority] !== undefined) priorityCounts[t.priority]++;
    });

    const total = tasks.length;
    const progress = total > 0 ? Math.round((statusCounts.COMPLETED / total) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        total,
        statusCounts,
        priorityCounts,
        progress,
      },
    });
  } catch (error) {
    next(error);
  }
};
