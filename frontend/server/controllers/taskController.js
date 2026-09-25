const Task = require('../models/Task');
const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const User = require('../models/User');
const Comment = require('../models/Comment');
const logActivity = require('../utils/activityLogger');
const createNotification = require('../utils/notificationHelper');

// Helper to recalculate project progress
const updateProjectProgress = async (projectId) => {
  try {
    const total = await Task.countDocuments({ project: projectId });
    if (total === 0) {
      await Project.findByIdAndUpdate(projectId, { progress: 0 });
      return 0;
    }
    const completed = await Task.countDocuments({ project: projectId, status: 'COMPLETED' });
    const progress = Math.round((completed / total) * 100);
    await Project.findByIdAndUpdate(projectId, { progress });
    return progress;
  } catch (err) {
    console.error('Error updating project progress:', err.message);
  }
};

// @desc    Get all tasks for a project
// @route   GET /api/projects/:id/tasks
// @access  Private
exports.getProjectTasks = async (req, res, next) => {
  try {
    const { id: projectId } = req.params;
    const { search, status, priority, assignedTo } = req.query;

    let query = { project: projectId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (assignedTo && assignedTo !== 'All') {
      query.assignedTo = assignedTo;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email profilePicture role')
      .populate('createdBy', 'name email profilePicture role')
      .populate('attachments', 'originalName fileUrl fileSize fileType')
      .sort('order createdAt');

    // Attach comments count to each task
    const tasksWithCommentCount = await Promise.all(
      tasks.map(async (task) => {
        const commentCount = await Comment.countDocuments({ task: task._id });
        const doc = task.toObject();
        doc.commentCount = commentCount;
        return doc;
      })
    );

    res.status(200).json({
      success: true,
      count: tasksWithCommentCount.length,
      data: tasksWithCommentCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a task
// @route   POST /api/projects/:id/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    const { id: projectId } = req.params;
    const { title, description, assignedTo, priority, status, startDate, deadline } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Get highest current order in this column to place at the bottom
    const taskStatus = status || 'TODO';
    const lastTask = await Task.findOne({ project: projectId, status: taskStatus }).sort('-order');
    const order = lastTask ? (lastTask.order || 0) + 1 : 0;

    const task = await Task.create({
      title: title.trim(),
      description: description || '',
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority: priority || 'Medium',
      status: taskStatus,
      startDate: startDate || Date.now(),
      deadline: deadline || null,
      order,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email profilePicture role')
      .populate('createdBy', 'name email profilePicture role');

    // Notify assigned user if specified and not self
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      await createNotification({
        user: assignedTo,
        type: 'task_assignment',
        message: `${req.user.name} assigned you a task: "${task.title}" in ${project.name}`,
        relatedProject: projectId,
        relatedTask: task._id,
        io: req.app.get('io'),
      });
    }

    // Update progress
    await updateProjectProgress(projectId);

    // Log Activity
    await logActivity({
      project: projectId,
      user: req.user._id,
      action: 'task_created',
      details: `Task "${task.title}" created by ${req.user.name}`,
      metadata: { taskId: task._id, priority: task.priority },
      io: req.app.get('io'),
    });

    // Real-time broadcast to project room
    const io = req.app.get('io');
    if (io) {
      io.to(`project:${projectId}`).emit('task_created', populatedTask);
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name owner category deadline status')
      .populate('assignedTo', 'name email profilePicture role skills')
      .populate('createdBy', 'name email profilePicture role')
      .populate('attachments');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const comments = await Comment.find({ task: task._id })
      .populate('user', 'name email profilePicture role')
      .sort('createdAt');

    const taskObj = task.toObject();
    taskObj.comments = comments;

    res.status(200).json({
      success: true,
      data: taskObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const previousAssignee = task.assignedTo ? task.assignedTo.toString() : null;
    const { title, description, assignedTo, priority, status, startDate, deadline } = req.body;

    const updates = {};
    if (title) updates.title = title.trim();
    if (description !== undefined) updates.description = description;
    if (priority) updates.priority = priority;
    if (status) updates.status = status;
    if (startDate) updates.startDate = startDate;
    if (deadline !== undefined) updates.deadline = deadline;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo || null;

    task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email profilePicture role')
      .populate('createdBy', 'name email profilePicture role');

    // If assignee was changed to someone new
    if (
      assignedTo &&
      assignedTo.toString() !== previousAssignee &&
      assignedTo.toString() !== req.user._id.toString()
    ) {
      const project = await Project.findById(task.project);
      await createNotification({
        user: assignedTo,
        type: 'task_assignment',
        message: `${req.user.name} assigned you the task "${task.title}"`,
        relatedProject: task.project,
        relatedTask: task._id,
        io: req.app.get('io'),
      });
    }

    await updateProjectProgress(task.project);

    await logActivity({
      project: task.project,
      user: req.user._id,
      action: 'task_updated',
      details: `Task "${task.title}" was updated by ${req.user.name}`,
      io: req.app.get('io'),
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${task.project.toString()}`).emit('task_updated', task);
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status & order (Kanban drag and drop)
// @route   PATCH /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status, order } = req.body;

    if (!['TODO', 'IN PROGRESS', 'REVIEW', 'COMPLETED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task status',
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const oldStatus = task.status;
    task.status = status;
    if (order !== undefined) task.order = order;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email profilePicture role')
      .populate('createdBy', 'name email profilePicture role');

    // Recalculate project progress
    const progress = await updateProjectProgress(task.project);

    // If status changed to COMPLETED or another state, notify creator/assignee
    if (oldStatus !== status) {
      await logActivity({
        project: task.project,
        user: req.user._id,
        action: status === 'COMPLETED' ? 'task_completed' : 'task_status_changed',
        details: `Task "${task.title}" moved from ${oldStatus} to ${status} by ${req.user.name}`,
        io: req.app.get('io'),
      });

      // Notify task creator if different from updater
      if (task.createdBy.toString() !== req.user._id.toString()) {
        await createNotification({
          user: task.createdBy,
          type: 'task_status',
          message: `${req.user.name} moved task "${task.title}" to ${status}`,
          relatedProject: task.project,
          relatedTask: task._id,
          io: req.app.get('io'),
        });
      }
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${task.project.toString()}`).emit('task_moved', {
        task: populatedTask,
        projectId: task.project,
        progress,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: {
        task: populatedTask,
        progress,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const projectId = task.project;
    const taskTitle = task.title;

    await Comment.deleteMany({ task: task._id });
    await Task.findByIdAndDelete(task._id);

    const progress = await updateProjectProgress(projectId);

    await logActivity({
      project: projectId,
      user: req.user._id,
      action: 'task_deleted',
      details: `Task "${taskTitle}" was deleted by ${req.user.name}`,
      io: req.app.get('io'),
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${projectId.toString()}`).emit('task_deleted', {
        taskId: req.params.id,
        projectId,
        progress,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's assigned tasks across all projects
// @route   GET /api/tasks/my-tasks
// @access  Private
exports.getMyTasks = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;

    let query = { assignedTo: req.user._id };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const tasks = await Task.find(query)
      .populate('project', 'name category deadline status')
      .populate('createdBy', 'name email profilePicture')
      .sort('deadline createdAt');

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};
