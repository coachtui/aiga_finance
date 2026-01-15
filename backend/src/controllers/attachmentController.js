const Attachment = require('../models/Attachment');
const { uploadToS3, getSignedUrl, deleteFromS3, isS3Configured } = require('../config/s3');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

class AttachmentController {
  /**
   * Upload file(s)
   * POST /attachments/upload
   */
  static async upload(req, res) {
    try {
      const userId = req.user.id;
      const { entityType, entityId } = req.body;

      if (!entityType || !entityId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'entityType and entityId are required',
        });
      }

      // Validate entity type
      const validEntityTypes = ['expense', 'invoice', 'client', 'contract'];
      if (!validEntityTypes.includes(entityType)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: `Invalid entityType. Must be one of: ${validEntityTypes.join(', ')}`,
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'No files uploaded',
        });
      }

      const uploadedAttachments = [];

      // Process each file
      for (const file of req.files) {
        let filePath;
        let storageProvider;

        if (isS3Configured()) {
          // Upload to S3
          const s3Result = await uploadToS3(file, entityType);
          filePath = s3Result.key;
          storageProvider = 's3';
        } else {
          // Fallback to local storage for development
          const uploadsDir = path.join(__dirname, '../../uploads', entityType);
          await fs.mkdir(uploadsDir, { recursive: true });

          const fileName = `${Date.now()}-${file.originalname}`;
          const localPath = path.join(uploadsDir, fileName);
          await fs.writeFile(localPath, file.buffer);

          filePath = `uploads/${entityType}/${fileName}`;
          storageProvider = 'local';
          logger.warn('Using local storage - S3 not configured');
        }

        // Save attachment record to database
        const attachment = await Attachment.create({
          entityType,
          entityId,
          fileName: file.originalname,
          filePath,
          fileSize: file.size,
          mimeType: file.mimetype,
          storageProvider,
          uploadedBy: userId,
        });

        uploadedAttachments.push(attachment);
      }

      res.status(201).json({
        success: true,
        data: { attachments: uploadedAttachments },
        message: `Successfully uploaded ${uploadedAttachments.length} file(s)`,
      });
    } catch (error) {
      logger.error('Upload error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to upload file(s)',
      });
    }
  }

  /**
   * Get attachments for an entity
   * GET /attachments/:entityType/:entityId
   */
  static async getByEntity(req, res) {
    try {
      const { entityType, entityId } = req.params;

      const attachments = await Attachment.findByEntity(entityType, entityId);

      // Generate signed URLs for S3 files
      const attachmentsWithUrls = attachments.map((attachment) => {
        if (attachment.storage_provider === 's3') {
          attachment.url = getSignedUrl(attachment.file_path);
        } else {
          attachment.url = `/${attachment.file_path}`;
        }
        return attachment;
      });

      res.json({
        success: true,
        data: { attachments: attachmentsWithUrls },
      });
    } catch (error) {
      logger.error('Get attachments error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch attachments',
      });
    }
  }

  /**
   * Get attachment download URL
   * GET /attachments/:id/download
   */
  static async getDownloadUrl(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const attachment = await Attachment.findById(id);

      if (!attachment) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Attachment not found',
        });
      }

      // Generate signed URL for download
      let url;
      if (attachment.storage_provider === 's3') {
        url = getSignedUrl(attachment.file_path, 300); // 5 minutes
      } else {
        url = `/${attachment.file_path}`;
      }

      res.json({
        success: true,
        data: {
          url,
          fileName: attachment.file_name,
          mimeType: attachment.mime_type,
        },
      });
    } catch (error) {
      logger.error('Get download URL error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to generate download URL',
      });
    }
  }

  /**
   * Delete attachment
   * DELETE /attachments/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const attachment = await Attachment.findById(id);

      if (!attachment) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Attachment not found',
        });
      }

      // Check if user owns the attachment
      if (attachment.uploaded_by !== userId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to delete this attachment',
        });
      }

      // Delete from storage
      if (attachment.storage_provider === 's3') {
        await deleteFromS3(attachment.file_path);
      } else {
        // Delete from local storage
        const localPath = path.join(__dirname, '../../', attachment.file_path);
        try {
          await fs.unlink(localPath);
        } catch (err) {
          logger.warn('Failed to delete local file:', err);
        }
      }

      // Soft delete from database
      await Attachment.delete(id);

      res.json({
        success: true,
        message: 'Attachment deleted successfully',
      });
    } catch (error) {
      logger.error('Delete attachment error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete attachment',
      });
    }
  }

  /**
   * Get user storage usage
   * GET /attachments/storage/usage
   */
  static async getStorageUsage(req, res) {
    try {
      const userId = req.user.id;

      const usage = await Attachment.getUserStorageUsage(userId);

      res.json({
        success: true,
        data: { usage },
      });
    } catch (error) {
      logger.error('Get storage usage error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch storage usage',
      });
    }
  }
}

module.exports = AttachmentController;
