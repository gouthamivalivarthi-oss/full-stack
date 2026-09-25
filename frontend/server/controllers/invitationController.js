const Invitation = require('../models/Invitation');
const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const logActivity = require('../utils/activityLogger');
const createNotification = require('../utils/notificationHelper');

// @desc    Get pending invitations for current user email
// @route   GET /api/invitations/my-invitations
// @access  Private
exports.getMyInvitations = async (req, res, next) => {
  try {
    const invitations = await Invitation.find({
      invitedEmail: req.user.email.toLowerCase(),
      status: 'pending',
    })
      .populate('project', 'name description category deadline')
      .populate('invitedBy', 'name email profilePicture');

    res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept project invitation
// @route   POST /api/invitations/:id/accept
// @access  Private
exports.acceptInvitation = async (req, res, next) => {
  try {
    const invitation = await Invitation.findOne({
      _id: req.params.id,
      invitedEmail: req.user.email.toLowerCase(),
      status: 'pending',
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Pending invitation not found',
      });
    }

    const project = await Project.findById(invitation.project);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project no longer exists',
      });
    }

    // Check if already a member
    let member = await ProjectMember.findOne({
      project: invitation.project,
      user: req.user._id,
    });

    if (!member) {
      member = await ProjectMember.create({
        project: invitation.project,
        user: req.user._id,
        role: invitation.role,
      });
    }

    invitation.status = 'accepted';
    await invitation.save();

    // Log Activity
    await logActivity({
      project: project._id,
      user: req.user._id,
      action: 'member_joined',
      details: `${req.user.name} accepted invitation and joined as ${invitation.role}`,
      io: req.app.get('io'),
    });

    // Notify project inviter
    await createNotification({
      user: invitation.invitedBy,
      type: 'member_added',
      message: `${req.user.name} accepted your invitation to join ${project.name}`,
      relatedProject: project._id,
      io: req.app.get('io'),
    });

    res.status(200).json({
      success: true,
      message: `You have joined "${project.name}" successfully`,
      data: {
        projectId: project._id,
        member,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject project invitation
// @route   POST /api/invitations/:id/reject
// @access  Private
exports.rejectInvitation = async (req, res, next) => {
  try {
    const invitation = await Invitation.findOne({
      _id: req.params.id,
      invitedEmail: req.user.email.toLowerCase(),
      status: 'pending',
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Pending invitation not found',
      });
    }

    invitation.status = 'rejected';
    await invitation.save();

    res.status(200).json({
      success: true,
      message: 'Invitation declined',
    });
  } catch (error) {
    next(error);
  }
};
