const express = require('express');
const AttachmentController = require('../controllers/attachmentController');
const { authenticate } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Upload file(s) - supports multiple files
router.post(
  '/upload',
  upload.array('files', 10), // Max 10 files per request
  handleMulterError,
  AttachmentController.upload
);

// Get attachments for an entity
router.get('/:entityType/:entityId', AttachmentController.getByEntity);

// Get download URL for specific attachment
router.get('/:id/download', AttachmentController.getDownloadUrl);

// Get user storage usage
router.get('/storage/usage', AttachmentController.getStorageUsage);

// Delete attachment
router.delete('/:id', AttachmentController.delete);

module.exports = router;
