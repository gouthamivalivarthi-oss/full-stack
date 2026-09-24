const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/conversations', getConversations);
router.post('/', sendMessage);
router.get('/:targetUserId', getMessages);
router.put('/read/:conversationId', markAsRead);

module.exports = router;
