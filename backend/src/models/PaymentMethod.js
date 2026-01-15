const { query } = require('../config/database');
const logger = require('../utils/logger');

class PaymentMethod {
  /**
   * Create a new payment method
   */
  static async create(userId, paymentMethodData) {
    try {
      const {
        name,
        type,
        lastFour = null,
        institutionName = null,
        isActive = true,
        plaidAccessToken = null,
        plaidItemId = null,
      } = paymentMethodData;

      const result = await query(
        `INSERT INTO payment_methods (user_id, name, type, last_four, institution_name, is_active, plaid_access_token, plaid_item_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [userId, name, type, lastFour, institutionName, isActive, plaidAccessToken, plaidItemId]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating payment method:', error);
      throw error;
    }
  }

  /**
   * Find all payment methods for a user
   */
  static async findAll(userId) {
    const result = await query(
      `SELECT * FROM payment_methods
       WHERE user_id = $1 AND deleted_at IS NULL
       ORDER BY is_active DESC, name ASC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Find payment method by ID with user ownership check
   */
  static async findById(id, userId) {
    const result = await query(
      'SELECT * FROM payment_methods WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [id, userId]
    );
    return result.rows[0];
  }

  /**
   * Update payment method with user ownership check
   */
  static async update(id, userId, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }

    if (data.type !== undefined) {
      fields.push(`type = $${paramCount++}`);
      values.push(data.type);
    }

    if (data.lastFour !== undefined) {
      fields.push(`last_four = $${paramCount++}`);
      values.push(data.lastFour);
    }

    if (data.institutionName !== undefined) {
      fields.push(`institution_name = $${paramCount++}`);
      values.push(data.institutionName);
    }

    if (data.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(data.isActive);
    }

    if (data.plaidAccessToken !== undefined) {
      fields.push(`plaid_access_token = $${paramCount++}`);
      values.push(data.plaidAccessToken);
    }

    if (data.plaidItemId !== undefined) {
      fields.push(`plaid_item_id = $${paramCount++}`);
      values.push(data.plaidItemId);
    }

    if (data.lastSyncedAt !== undefined) {
      fields.push(`last_synced_at = $${paramCount++}`);
      values.push(data.lastSyncedAt);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id, userId);

    const result = await query(
      `UPDATE payment_methods
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount++} AND user_id = $${paramCount} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Payment method not found or unauthorized');
    }

    return result.rows[0];
  }

  /**
   * Soft delete payment method with user ownership check
   */
  static async delete(id, userId) {
    const result = await query(
      'UPDATE payment_methods SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Payment method not found or unauthorized');
    }

    return true;
  }

  /**
   * Check if payment method exists and belongs to user
   */
  static async exists(id, userId) {
    const result = await query(
      'SELECT id FROM payment_methods WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [id, userId]
    );
    return result.rows.length > 0;
  }

  /**
   * Get count of payment methods for a user
   */
  static async count(userId) {
    const result = await query(
      'SELECT COUNT(*)::int as count FROM payment_methods WHERE user_id = $1 AND deleted_at IS NULL',
      [userId]
    );
    return result.rows[0].count;
  }
}

module.exports = PaymentMethod;
