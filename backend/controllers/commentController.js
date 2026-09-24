const Comment = require('../models/Comment');
const Task = require('../models/Task');
const ProjectMember = require('../models/ProjectMember');
const logActivity = require('../utils/activityLogger');
const createNotification = require('../utils/notificationHelper');

// @desc    Get comments for a task
// @route   GET /api/tasks/:id/comments
// @access  Private
exports.getTaskComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ task: req.params.id })
      .populate('user', 'name email profilePicture role')
      .sort('createdAt');

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { message } = req.body;
    const taskId = req.params.id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment message cannot be empty',
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const comment = await Comment.create({
      user: req.user._id,
      task: taskId,
      message: message.trim(),
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'user',
      'name email profilePicture role'
    );

    // Notify task assignee if not self
    if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
      await createNotification({
        user: task.assignedTo,
        type: 'comment',
        message: `${req.user.name} commented on your task "${task.title}": "${message.slice(0, 50)}..."`,
        relatedProject: task.project,
        relatedTask: task._id,
        io: req.app.get('io'),
      });
    }

    // Log Activity
    await logActivity({
      project: task.project,
      user: req.user._id,
      action: 'comment_added',
      details: `${req.user.name} commented on task "${task.title}"`,
      io: req.app.get('io'),
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${task.project.toString()}`).emit('comment_added', {
        taskId,
        comment: populatedComment,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Comment posted',
      data: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit comment
// @route   PUT /api/comments/:id
// @access  Private
exports.editComment = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty',
      });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Only original author can edit
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own comments',
      });
    }

    comment.message = message.trim();
    await comment.save();

    const populated = await Comment.findById(comment._id).populate(
      'user',
      'name email profilePicture role'
    );

    res.status(200).json({
      success: true,
      message: 'Comment updated',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Author or admin can delete
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment',
      });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
