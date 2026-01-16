// ============================================================================
// Upload Middleware
// File upload handling using Multer
// ============================================================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================================================
// CREATE UPLOAD DIRECTORIES IF THEY DON'T EXIST
// ============================================================================
const createUploadDirs = () => {
  const dirs = [
    './uploads',
    './uploads/avatars',
    './uploads/tasks',
    './uploads/rewards'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// ============================================================================
// STORAGE CONFIGURATION
// ============================================================================

// Avatar storage
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + req.user.user_id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Task photo storage
const taskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/tasks/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'task-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Reward image storage
const rewardStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/rewards/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'reward-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// ============================================================================
// FILE FILTER (Accept only images)
// ============================================================================
const imageFileFilter = (req, file, cb) => {
  // Allowed file extensions
  const allowedExtensions = /jpeg|jpg|png|gif|webp/;
  
  // Check extension
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  
  // Check mime type
  const mimetype = allowedExtensions.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// ============================================================================
// MULTER CONFIGURATIONS
// ============================================================================

// Avatar upload
const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: imageFileFilter
});

// Task photo upload
const taskUpload = multer({
  storage: taskStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: imageFileFilter
});

// Reward image upload
const rewardUpload = multer({
  storage: rewardStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: imageFileFilter
});

// General upload (default)
const generalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'file-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const generalUpload = multer({
  storage: generalStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: imageFileFilter
});

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field in file upload.'
      });
    }

    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + err.message
    });
  }

  // Other errors
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed.'
    });
  }

  next();
};

// ============================================================================
// EXPORTS
// ============================================================================

// Export configured upload instances
exports.upload = generalUpload;
exports.uploadAvatar = avatarUpload;
exports.uploadTask = taskUpload;
exports.uploadReward = rewardUpload;

// Export error handler
exports.handleMulterError = handleMulterError;

// Export helper function to delete file
exports.deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
