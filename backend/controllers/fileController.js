const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const Project = require('../models/Project');
const Task = require('../models/Task');
const logActivity = require('../utils/activityLogger');

// @desc    Upload file to project
// @route   POST /api/files/upload
// @access  Private
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { projectId, taskId } = req.body;

    if (!projectId) {
      // Clean up uploaded file if project missing
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Project ID is required for file upload',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const newFile = await File.create({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      filePath: req.file.path,
      fileUrl,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      uploadedBy: req.user._id,
      project: projectId,
      task: taskId || null,
    });

    // If attached to a task, push to task attachments
    if (taskId) {
      await Task.findByIdAndUpdate(taskId, {
        $push: { attachments: newFile._id },
      });
    }

    const populatedFile = await File.findById(newFile._id).populate(
      'uploadedBy',
      'name email profilePicture role'
    );

    // Log Activity
    await logActivity({
      project: projectId,
      user: req.user._id,
      action: 'file_uploaded',
      details: `${req.user.name} uploaded file "${newFile.originalName}"`,
      metadata: { fileId: newFile._id, size: newFile.fileSize },
      io: req.app.get('io'),
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${projectId}`).emit('file_uploaded', populatedFile);
    }

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: populatedFile,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Get files for a project
// @route   GET /api/projects/:id/files
// @access  Private
exports.getProjectFiles = async (req, res, next) => {
  try {
    const files = await File.find({ project: req.params.id })
      .populate('uploadedBy', 'name email profilePicture role')
      .populate('task', 'title')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all user accessible files across projects
// @route   GET /api/files
// @access  Private
exports.getAllUserFiles = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      const ProjectMember = require('../models/ProjectMember');
      const memberships = await ProjectMember.find({ user: req.user._id }).select('project');
      const projectIds = memberships.map((m) => m.project);
      query.project = { $in: projectIds };
    }

    const files = await File.find(query)
      .populate('uploadedBy', 'name email profilePicture role')
      .populate('project', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download file
// @route   GET /api/files/:id/download
// @access  Private
exports.downloadFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const fullPath = path.resolve(file.filePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: 'Physical file not found on disk',
      });
    }

    res.download(fullPath, file.originalName);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
exports.deleteFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Permission check: uploader, manager, or admin
    if (file.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this file',
      });
    }

    const fullPath = path.resolve(file.filePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (err) {
        console.error('Failed to delete file from disk:', err);
      }
    }

    // Remove from task attachments if any
    if (file.task) {
      await Task.findByIdAndUpdate(file.task, {
        $pull: { attachments: file._id },
      });
    }

    await File.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${file.project.toString()}`).emit('file_deleted', {
        fileId: req.params.id,
        projectId: file.project,
      });
    }

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
