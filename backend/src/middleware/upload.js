const multer = require('multer');
const logger = require('../utils/logger');

// Configure multer for memory storage (files stored in memory before uploading to S3)
const storage = multer.memoryStorage();

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Text
    'text/plain',
    'text/csv',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.warn('File upload rejected - invalid type:', { mimetype: file.mimetype });
    cb(new Error(`File type not allowed. Allowed types: images, PDFs, documents, CSV, and text files.`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB default
  },
});

// Error handler for multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File Too Large',
        message: 'File size exceeds the maximum allowed size of 10MB',
      });
    }
    return res.status(400).json({
      error: 'Upload Error',
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      error: 'Upload Error',
      message: err.message,
    });
  }

  next();
};

module.exports = {
  upload,
  handleMulterError,
};
