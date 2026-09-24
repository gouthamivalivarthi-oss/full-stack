const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ project, user, action, details, metadata = {}, io = null }) => {
  try {
    const activity = await ActivityLog.create({
      project,
      user,
      action,
      details,
      metadata,
    });

    const populated = await ActivityLog.findById(activity._id).populate('user', 'name email profilePicture role');

    if (io && project) {
      io.to(`project:${project.toString()}`).emit('activity_added', populated);
    }

    return populated;
  } catch (error) {
    console.error('Failed to log activity:', error.message);
  }
};

module.exports = logActivity;
