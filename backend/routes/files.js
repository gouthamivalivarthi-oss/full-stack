const express = require('express');
const router = express.Router();
const {
  uploadFile,
  getAllUserFiles,
  downloadFile,
  deleteFile,
} = require('../controllers/fileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.route('/')
  .get(getAllUserFiles);

router.post('/upload', upload.single('file'), uploadFile);
router.get('/:id/download', downloadFile);
router.delete('/:id', deleteFile);

module.exports = router;
