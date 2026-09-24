const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getAllProjects,
  deleteProjectAdmin,
  getPlatformActivity,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/projects', getAllProjects);
router.delete('/projects/:id', deleteProjectAdmin);
router.get('/activity', getPlatformActivity);

module.exports = router;
