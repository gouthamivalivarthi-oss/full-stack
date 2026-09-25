const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

// @desc    Get comprehensive dashboard metrics and data for user
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    // 1. Projects query: owned or member of
    let projectFilter = {};
    if (!isAdmin) {
      const userMemberships = await ProjectMember.find({ user: userId }).select('project');
      const memberProjectIds = userMemberships.map((m) => m.project);
      projectFilter = {
        $or: [{ owner: userId }, { _id: { $in: memberProjectIds } }],
      };
    }

    const userProjects = await Project.find(projectFilter)
      .populate('owner', 'name email profilePicture')
      .sort('-updatedAt');

    const projectIds = userProjects.map((p) => p._id);

    const totalProjects = userProjects.length;
    const activeProjects = userProjects.filter((p) => p.status === 'Active').length;
    const completedProjects = userProjects.filter((p) => p.status === 'Completed').length;
    const planningProjects = userProjects.filter((p) => p.status === 'Planning').length;

    // 2. Tasks metrics
    const userTasks = await Task.find({
      $or: [{ assignedTo: userId }, { project: { $in: projectIds } }],
    }).populate('project', 'name category deadline');

    const myAssignedTasks = await Task.find({ assignedTo: userId })
      .populate('project', 'name category deadline')
      .populate('createdBy', 'name')
      .sort('deadline createdAt')
      .limit(6);

    const pendingTasks = myAssignedTasks.filter((t) => t.status !== 'COMPLETED').length;
    const completedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: 'COMPLETED',
    });

    // 3. Upcoming deadlines (within next 14 days)
    const now = new Date();
    const upcomingDeadlines = await Task.find({
      $or: [{ assignedTo: userId }, { project: { $in: projectIds } }],
      deadline: { $gte: now },
      status: { $ne: 'COMPLETED' },
    })
      .populate('project', 'name')
      .populate('assignedTo', 'name email profilePicture')
      .sort('deadline')
      .limit(5);

    // 4. Recent project activities
    const recentActivity = await ActivityLog.find({
      $or: [{ project: { $in: projectIds } }, { user: userId }],
    })
      .populate('user', 'name email profilePicture role')
      .populate('project', 'name')
      .sort('-createdAt')
      .limit(8);

    // 5. Project progress cards with task statistics
    const projectCards = await Promise.all(
      userProjects.slice(0, 4).map(async (project) => {
        const total = await Task.countDocuments({ project: project._id });
        const completed = await Task.countDocuments({
          project: project._id,
          status: 'COMPLETED',
        });
        const members = await ProjectMember.countDocuments({ project: project._id });
        return {
          id: project._id,
          _id: project._id,
          name: project.name,
          category: project.category,
          status: project.status,
          priority: project.priority,
          deadline: project.deadline,
          progress: project.progress,
          totalTasks: total,
          completedTasks: completed,
          memberCount: members,
        };
      })
    );

    // 6. Task breakdown by status for chart visualization
    const taskStatusCounts = {
      TODO: 0,
      'IN PROGRESS': 0,
      REVIEW: 0,
      COMPLETED: 0,
    };
    userTasks.forEach((t) => {
      if (taskStatusCounts[t.status] !== undefined) {
        taskStatusCounts[t.status]++;
      }
    });

    // 7. Recent notifications
    const recentNotifications = await Notification.find({ user: userId })
      .sort('-createdAt')
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalProjects,
          activeProjects,
          completedProjects,
          planningProjects,
          pendingTasks,
          completedTasks,
          myAssignedCount: myAssignedTasks.length,
        },
        taskStatusCounts,
        projectCards,
        upcomingDeadlines,
        myAssignedTasks,
        recentActivity,
        recentNotifications,
      },
    });
  } catch (error) {
    next(error);
  }
};
