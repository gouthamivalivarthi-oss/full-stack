const express = require('express');
const router = express.Router();
const { editComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/:id')
  .put(editComment)
  .delete(deleteComment);

module.exports = router;
