const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// @desc    Get user conversations list with unread counts
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .populate('participants', 'name email profilePicture role status')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name' },
      })
      .sort('-updatedAt');

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          recipient: currentUserId,
          isRead: false,
        });

        // Filter the other participant
        const otherUser = conv.participants.find(
          (p) => p._id.toString() !== currentUserId.toString()
        );

        const convObj = conv.toObject();
        convObj.unreadCount = unreadCount;
        convObj.otherUser = otherUser;
        return convObj;
      })
    );

    res.status(200).json({
      success: true,
      data: conversationsWithUnread,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages between current user and target user
// @route   GET /api/messages/:targetUserId
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const { targetUserId } = req.params;

    // Find conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, targetUserId] },
    });

    if (!conversation) {
      return res.status(200).json({
        success: true,
        data: [],
        conversationId: null,
      });
    }

    // Mark unread messages sent to current user as read
    await Message.updateMany(
      {
        conversation: conversation._id,
        recipient: currentUserId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'name email profilePicture')
      .populate('recipient', 'name email profilePicture')
      .sort('createdAt');

    res.status(200).json({
      success: true,
      conversationId: conversation._id,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message to a user
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user._id;

    if (!recipientId || !content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Recipient and message content are required',
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found',
      });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recipientId],
      });
    }

    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      conversation: conversation._id,
      content: content.trim(),
    });

    // Update conversation's lastMessage and updatedAt
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email profilePicture')
      .populate('recipient', 'name email profilePicture');

    // Real-time socket emission
    const io = req.app.get('io');
    if (io) {
      // Emit to recipient's room
      io.to(`user:${recipientId.toString()}`).emit('new_message', populatedMessage);
      // Also emit to sender (in case they have multiple tabs)
      io.to(`user:${senderId.toString()}`).emit('message_sent', populatedMessage);
    }

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark conversation as read
// @route   PUT /api/messages/read/:conversationId
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    await Message.updateMany(
      {
        conversation: conversationId,
        recipient: currentUserId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    next(error);
  }
};
