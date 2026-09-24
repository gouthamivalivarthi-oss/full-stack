const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});

// Allowed file types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, PNG, JPG, JPEG, WEBP, ZIP, TXT, CSV
const allowedExtensions = /pdf|doc|docx|ppt|pptx|xls|xlsx|png|jpg|jpeg|webp|zip|txt|csv/i;

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).replace('.', '').toLowerCase();
  if (allowedExtensions.test(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Allowed: PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, PNG, JPG/JPEG, WEBP, ZIP, TXT, CSV'
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max
  },
  fileFilter: fileFilter,
});

module.exports = upload;
