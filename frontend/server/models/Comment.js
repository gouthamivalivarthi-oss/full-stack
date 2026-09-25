const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Comment message cannot be empty'],
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({ task: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', commentSchema);
