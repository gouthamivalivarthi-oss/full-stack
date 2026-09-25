const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a project name'],
      trim: true,
      maxlength: [120, 'Project name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a project description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      default: 'Web Development',
      trim: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      required: [true, 'Please specify a project deadline'],
    },
    status: {
      type: String,
      enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Archived'],
      default: 'Active',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for searching and filtering
projectSchema.index({ name: 'text', description: 'text', category: 'text' });
projectSchema.index({ owner: 1, status: 1 });

module.exports = mongoose.model('Project', projectSchema);
