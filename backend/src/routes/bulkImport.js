const express = require('express');
const router = express.Router();
const bulkImportController = require('../controllers/bulkImportController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @route   POST /api/expenses/bulk-import
 * @desc    Upload files and extract invoice data
 * @access  Private
 */
router.post(
  '/bulk-import',
  authenticate,
  upload.array('files', 10), // Accept up to 10 files
  bulkImportController.uploadAndExtract
);

/**
 * @route   GET /api/expenses/bulk-import/:sessionId
 * @desc    Get session data for review
 * @access  Private
 */
router.get(
  '/bulk-import/:sessionId',
  authenticate,
  bulkImportController.getSessionData
);

/**
 * @route   POST /api/expenses/bulk-confirm
 * @desc    Confirm import and create expenses
 * @access  Private
 */
router.post(
  '/bulk-confirm',
  authenticate,
  bulkImportController.confirmImport
);

module.exports = router;
