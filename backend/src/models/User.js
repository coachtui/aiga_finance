const { query, transaction } = require('../config/database');
const logger = require('../utils/logger');

class User {
  /**
   * Create a new user
   */
  static async create({ email, passwordHash, firstName, lastName, role = 'user' }) {
    try {
      const result = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, first_name, last_name, role, is_active, email_verified, created_at`,
        [email, passwordHash, firstName, lastName, role]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email already exists');
      }
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );
    return result.rows[0];
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const result = await query(
      'SELECT id, email, first_name, last_name, role, is_active, email_verified, last_login_at, created_at FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Update user
   */
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.firstName !== undefined) {
      fields.push(`first_name = $${paramCount++}`);
      values.push(data.firstName);
    }
    if (data.lastName !== undefined) {
      fields.push(`last_name = $${paramCount++}`);
      values.push(data.lastName);
    }
    if (data.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(data.email);
    }
    if (data.passwordHash !== undefined) {
      fields.push(`password_hash = $${paramCount++}`);
      values.push(data.passwordHash);
    }
    if (data.emailVerified !== undefined) {
      fields.push(`email_verified = $${paramCount++}`);
      values.push(data.emailVerified);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    const result = await query(
      `UPDATE users
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount} AND deleted_at IS NULL
       RETURNING id, email, first_name, last_name, role, is_active, email_verified, created_at`,
      values
    );

    return result.rows[0];
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(id) {
    await query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [id]
    );
  }

  /**
   * Soft delete user
   */
  static async delete(id) {
    await query(
      'UPDATE users SET deleted_at = NOW() WHERE id = $1',
      [id]
    );
  }

  /**
   * Count users
   */
  static async count() {
    const result = await query(
      'SELECT COUNT(*) FROM users WHERE deleted_at IS NULL'
    );
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Get all users (admin only)
   */
  static async findAll({ limit = 50, offset = 0 } = {}) {
    const result = await query(
      `SELECT id, email, first_name, last_name, role, is_active, email_verified, last_login_at, created_at
       FROM users
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }
}

module.exports = User;
