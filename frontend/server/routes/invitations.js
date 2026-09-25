const express = require('express');
const router = express.Router();
const {
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
} = require('../controllers/invitationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/my-invitations', getMyInvitations);
router.post('/:id/accept', acceptInvitation);
router.post('/:id/reject', rejectInvitation);

module.exports = router;
