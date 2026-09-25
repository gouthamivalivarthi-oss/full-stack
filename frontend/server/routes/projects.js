const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
  inviteMember,
  removeMember,
  updateMemberRole,
  getProjectActivity,
  getProjectStats,
} = require('../controllers/projectController');
const { getProjectTasks, createTask } = require('../controllers/taskController');
const { getProjectFiles } = require('../controllers/fileController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

router.route('/:id/members')
  .get(getProjectMembers);

router.post('/:id/invite', inviteMember);
router.delete('/:id/members/:userId', removeMember);
router.put('/:id/members/:userId', updateMemberRole);

router.route('/:id/tasks')
  .get(getProjectTasks)
  .post(createTask);

router.get('/:id/files', getProjectFiles);
router.get('/:id/activity', getProjectActivity);
router.get('/:id/stats', getProjectStats);

module.exports = router;
