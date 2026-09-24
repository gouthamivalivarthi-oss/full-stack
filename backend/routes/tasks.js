const express = require('express');
const router = express.Router();
const {
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getMyTasks,
} = require('../controllers/taskController');
const { getTaskComments, addComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/my-tasks', getMyTasks);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

router.patch('/:id/status', updateTaskStatus);

router.route('/:id/comments')
  .get(getTaskComments)
  .post(addComment);

module.exports = router;
