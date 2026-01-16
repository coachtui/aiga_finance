const invoiceProcessingService = require('../services/invoiceProcessingService');
const expenseService = require('../services/expenseService');
const Attachment = require('../models/Attachment');
const logger = require('../utils/logger');
const db = require('../config/database');
const s3 = require('../config/s3');
const path = require('path');
const fs = require('fs').promises;

/**
 * Upload files and extract invoice data
 * POST /api/expenses/bulk-import
 */
exports.uploadAndExtract = async (req, res) => {
  try {
    const userId = req.user.id;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    // Validate file count (max 10)
    if (files.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 files allowed per upload'
      });
    }

    // Parse options from request body (if provided)
    let options = {};
    if (req.body.options) {
      try {
        options = typeof req.body.options === 'string'
          ? JSON.parse(req.body.options)
          : req.body.options;
      } catch (error) {
        logger.warn('Error parsing options', { error: error.message });
      }
    }

    logger.info(`Bulk import started: ${files.length} files uploaded by user ${userId}`);

    // Process files and extract data
    const result = await invoiceProcessingService.processUploadedFiles(files, userId, options);

    res.json({
      success: true,
      message: `Successfully processed ${files.length} files`,
      data: result
    });
  } catch (error) {
    logger.error('Error in uploadAndExtract', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Failed to process uploaded files',
      message: error.message
    });
  }
};

/**
 * Get session data for review
 * GET /api/expenses/bulk-import/:sessionId
 */
exports.getSessionData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const sessionData = await invoiceProcessingService.getSessionData(sessionId, userId);

    if (!sessionData) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or expired'
      });
    }

    // Return extracted expenses (without file buffers)
    res.json({
      success: true,
      data: {
        sessionId,
        extractedExpenses: sessionData.extractedExpenses,
        createdAt: sessionData.createdAt
      }
    });
  } catch (error) {
    logger.error('Error in getSessionData', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve session data',
      message: error.message
    });
  }
};

/**
 * Confirm import and create expenses
 * POST /api/expenses/bulk-confirm
 */
exports.confirmImport = async (req, res) => {
  const client = await db.pool.connect();

  try {
    const userId = req.user.id;
    const { sessionId, expenses } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Expenses array is required'
      });
    }

    // Retrieve session data with file buffers
    const sessionData = await invoiceProcessingService.getSessionData(sessionId, userId);

    if (!sessionData) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or expired'
      });
    }

    logger.info(`Confirming bulk import: ${expenses.length} expenses for user ${userId}`);

    // Start transaction
    await client.query('BEGIN');

    const createdExpenses = [];
    const errors = [];

    // Process each expense
    for (let i = 0; i < expenses.length; i++) {
      const expenseData = expenses[i];

      try {
        // Find the corresponding file for this expense
        const originalExpense = sessionData.extractedExpenses.find(e => e.tempId === expenseData.tempId);
        const fileData = sessionData.files.find(f => f.originalname === originalExpense?.fileName);

        // Create expense using existing expense service
        const newExpense = await expenseService.createExpense(userId, {
          amount: expenseData.amount,
          transactionDate: expenseData.transactionDate,
          vendorName: expenseData.vendorName,
          description: expenseData.description,
          categoryId: expenseData.categoryId || null,
          paymentMethodId: expenseData.paymentMethodId || null,
          currency: expenseData.currency || 'USD',
          notes: expenseData.notes || originalExpense?.lineItems || null,
          tags: expenseData.tags || [],
          status: expenseData.status || 'pending',
          isReimbursable: expenseData.isReimbursable || false,
          isBillable: expenseData.isBillable || false,
          isTaxDeductible: expenseData.isTaxDeductible !== undefined ? expenseData.isTaxDeductible : true
        });

        // Attach file to expense if available
        if (fileData && originalExpense) {
          try {
            const fileBuffer = Buffer.from(fileData.buffer, 'base64');
            const attachment = await uploadAttachment(
              userId,
              'expense',
              newExpense.id,
              fileData.originalname,
              fileBuffer,
              fileData.mimetype
            );

            logger.info(`Attached file to expense`, {
              expenseId: newExpense.id,
              attachmentId: attachment.id,
              fileName: fileData.originalname
            });
          } catch (attachError) {
            logger.error('Error attaching file to expense', {
              expenseId: newExpense.id,
              error: attachError.message
            });
            // Don't fail the expense creation if attachment fails
          }
        }

        createdExpenses.push(newExpense);
      } catch (error) {
        logger.error('Error creating expense from bulk import', {
          expenseData,
          error: error.message
        });
        errors.push({
          tempId: expenseData.tempId,
          vendorName: expenseData.vendorName,
          error: error.message
        });
      }
    }

    // Commit transaction
    await client.query('COMMIT');

    // Clean up session data
    await invoiceProcessingService.deleteSessionData(sessionId);

    logger.info(`Bulk import completed`, {
      userId,
      sessionId,
      created: createdExpenses.length,
      failed: errors.length
    });

    res.json({
      success: true,
      message: `Successfully created ${createdExpenses.length} expenses`,
      data: {
        created: createdExpenses.length,
        failed: errors.length,
        expenses: createdExpenses,
        errors
      }
    });
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    logger.error('Error in confirmImport', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Failed to create expenses',
      message: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Upload attachment file to S3 or local storage
 * @param {string} userId - User ID
 * @param {string} entityType - Entity type (expense, invoice, etc.)
 * @param {string} entityId - Entity ID
 * @param {string} fileName - Original file name
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} mimeType - MIME type
 * @returns {Promise<object>} Attachment record
 */
async function uploadAttachment(userId, entityType, entityId, fileName, fileBuffer, mimeType) {
  try {
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `${entityType}/${entityId}/${uniqueFileName}`;

    let storageProvider = 'local';
    let finalPath = filePath;

    // Try to upload to S3 if configured
    if (s3.isConfigured()) {
      try {
        const s3Result = await s3.uploadFile(fileBuffer, filePath, mimeType);
        storageProvider = 's3';
        finalPath = s3Result.key;
        logger.info('File uploaded to S3', { filePath: finalPath });
      } catch (s3Error) {
        logger.warn('S3 upload failed, falling back to local storage', { error: s3Error.message });
      }
    }

    // Fallback to local storage if S3 not configured or failed
    if (storageProvider === 'local') {
      const uploadDir = path.join(__dirname, '../../uploads', entityType, entityId);
      await fs.mkdir(uploadDir, { recursive: true });
      const localPath = path.join(uploadDir, uniqueFileName);
      await fs.writeFile(localPath, fileBuffer);
      finalPath = path.join('uploads', entityType, entityId, uniqueFileName);
      logger.info('File saved to local storage', { filePath: finalPath });
    }

    // Create attachment record in database
    const attachment = await Attachment.create({
      entityType,
      entityId,
      fileName,
      filePath: finalPath,
      fileSize: fileBuffer.length,
      mimeType,
      storageProvider,
      uploadedBy: userId
    });

    return attachment;
  } catch (error) {
    logger.error('Error uploading attachment', { error: error.message });
    throw error;
  }
}
