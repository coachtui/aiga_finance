const { query } = require('../config/database');
const logger = require('../utils/logger');

class Category {
  /**
   * Find all categories with optional type filter
   */
  static async findAll({ type = null } = {}) {
    try {
      let sql = `SELECT * FROM categories WHERE deleted_at IS NULL`;
      const params = [];

      if (type && (type === 'expense' || type === 'revenue')) {
        sql += ` AND type = $1`;
        params.push(type);
      }

      sql += ` ORDER BY display_order ASC, name ASC`;

      const result = await query(sql, params);
      return result.rows;
    } catch (error) {
      logger.error('Error finding categories:', error);
      throw error;
    }
  }

  /**
   * Find category by ID
   */
  static async findById(id) {
    const result = await query(
      'SELECT * FROM categories WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Find categories by type (expense or revenue)
   */
  static async findByType(type) {
    if (type !== 'expense' && type !== 'revenue') {
      throw new Error('Invalid category type. Must be "expense" or "revenue"');
    }

    const result = await query(
      'SELECT * FROM categories WHERE type = $1 AND deleted_at IS NULL ORDER BY display_order ASC, name ASC',
      [type]
    );
    return result.rows;
  }

  /**
   * Check if category exists
   */
  static async exists(id) {
    const result = await query(
      'SELECT id FROM categories WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return result.rows.length > 0;
  }
}

module.exports = Category;
