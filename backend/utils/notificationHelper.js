const Notification = require('../models/Notification');

const createNotification = async ({
  user,
  type,
  message,
  relatedProject = null,
  relatedTask = null,
  io = null,
}) => {
  try {
    const notification = await Notification.create({
      user,
      type,
      message,
      relatedProject,
      relatedTask,
      isRead: false,
    });

    const populated = await Notification.findById(notification._id)
      .populate('relatedProject', 'name')
      .populate('relatedTask', 'title');

    if (io && user) {
      io.to(`user:${user.toString()}`).emit('new_notification', populated);
    }

    return populated;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

module.exports = createNotification;
