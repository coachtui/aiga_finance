const { query } = require('../config/database');
const logger = require('../utils/logger');

class Attachment {
  /**
   * Create a new attachment record
   */
  static async create(attachmentData) {
    try {
      const {
        entityType,
        entityId,
        fileName,
        filePath,
        fileSize,
        mimeType,
        storageProvider = 's3',
        uploadedBy,
      } = attachmentData;

      const result = await query(
        `INSERT INTO attachments (
          entity_type, entity_id, file_name, file_path, file_size,
          mime_type, storage_provider, uploaded_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [entityType, entityId, fileName, filePath, fileSize, mimeType, storageProvider, uploadedBy]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating attachment:', error);
      throw error;
    }
  }

  /**
   * Find attachment by ID
   */
  static async findById(id) {
    const result = await query(
      'SELECT * FROM attachments WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Find all attachments for an entity
   */
  static async findByEntity(entityType, entityId) {
    const result = await query(
      `SELECT a.*, u.email as uploader_email, u.first_name, u.last_name
       FROM attachments a
       LEFT JOIN users u ON a.uploaded_by = u.id
       WHERE a.entity_type = $1 AND a.entity_id = $2 AND a.deleted_at IS NULL
       ORDER BY a.created_at DESC`,
      [entityType, entityId]
    );
    return result.rows;
  }

  /**
   * Find attachments uploaded by a user
   */
  static async findByUploader(userId, { limit = 50, offset = 0 } = {}) {
    const result = await query(
      `SELECT * FROM attachments
       WHERE uploaded_by = $1 AND deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  /**
   * Update attachment metadata
   */
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.fileName !== undefined) {
      fields.push(`file_name = $${paramCount++}`);
      values.push(data.fileName);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    const result = await query(
      `UPDATE attachments
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Attachment not found');
    }

    return result.rows[0];
  }

  /**
   * Soft delete attachment
   */
  static async delete(id) {
    const result = await query(
      'UPDATE attachments SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id, file_path',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Attachment not found');
    }

    return result.rows[0];
  }

  /**
   * Get total storage used by user
   */
  static async getUserStorageUsage(userId) {
    const result = await query(
      `SELECT COALESCE(SUM(file_size), 0) as total_bytes
       FROM attachments
       WHERE uploaded_by = $1 AND deleted_at IS NULL`,
      [userId]
    );

    const totalBytes = parseInt(result.rows[0].total_bytes, 10);
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

    return {
      totalBytes,
      totalMB,
      totalFiles: await this.getUserFileCount(userId),
    };
  }

  /**
   * Get total file count for user
   */
  static async getUserFileCount(userId) {
    const result = await query(
      'SELECT COUNT(*) FROM attachments WHERE uploaded_by = $1 AND deleted_at IS NULL',
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = Attachment;
