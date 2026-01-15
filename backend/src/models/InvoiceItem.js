const { query } = require('../config/database');
const logger = require('../utils/logger');

class InvoiceItem {
  /**
   * Create a new invoice item
   */
  static async create(invoiceId, itemData) {
    try {
      const {
        itemOrder = 0,
        description,
        quantity = 1,
        unitPrice,
        categoryId,
        notes,
      } = itemData;

      const result = await query(
        `INSERT INTO invoice_items (
          invoice_id, item_order, description, quantity, unit_price, category_id, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          invoiceId,
          itemOrder,
          description,
          quantity,
          unitPrice,
          categoryId || null,
          notes || null,
        ]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating invoice item:', error);
      throw error;
    }
  }

  /**
   * Create multiple invoice items in batch
   */
  static async createBatch(invoiceId, items) {
    try {
      const results = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const result = await this.create(invoiceId, {
          itemOrder: i,
          ...item,
        });
        results.push(result);
      }

      return results;
    } catch (error) {
      logger.error('Error creating invoice items batch:', error);
      throw error;
    }
  }

  /**
   * Find invoice item by ID
   */
  static async findById(id) {
    const result = await query(
      `SELECT ii.*,
              c.name as category_name
       FROM invoice_items ii
       LEFT JOIN categories c ON ii.category_id = c.id
       WHERE ii.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get all items for an invoice
   */
  static async getByInvoice(invoiceId) {
    const result = await query(
      `SELECT ii.*,
              c.name as category_name
       FROM invoice_items ii
       LEFT JOIN categories c ON ii.category_id = c.id
       WHERE ii.invoice_id = $1
       ORDER BY ii.item_order ASC`,
      [invoiceId]
    );

    return result.rows;
  }

  /**
   * Update invoice item
   */
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.itemOrder !== undefined) {
      fields.push(`item_order = $${paramCount++}`);
      values.push(data.itemOrder);
    }

    if (data.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(data.description);
    }

    if (data.quantity !== undefined) {
      fields.push(`quantity = $${paramCount++}`);
      values.push(data.quantity);
    }

    if (data.unitPrice !== undefined) {
      fields.push(`unit_price = $${paramCount++}`);
      values.push(data.unitPrice);
    }

    if (data.categoryId !== undefined) {
      fields.push(`category_id = $${paramCount++}`);
      values.push(data.categoryId || null);
    }

    if (data.notes !== undefined) {
      fields.push(`notes = $${paramCount++}`);
      values.push(data.notes || null);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    const result = await query(
      `UPDATE invoice_items
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Invoice item not found');
    }

    return result.rows[0];
  }

  /**
   * Delete invoice item
   */
  static async delete(id) {
    const result = await query(
      'DELETE FROM invoice_items WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Invoice item not found');
    }

    return true;
  }

  /**
   * Get total for all items in invoice
   */
  static async getInvoiceItemsTotal(invoiceId) {
    const result = await query(
      `SELECT COALESCE(SUM(line_total), 0) as items_total
       FROM invoice_items
       WHERE invoice_id = $1`,
      [invoiceId]
    );

    return parseFloat(result.rows[0].items_total) || 0;
  }

  /**
   * Delete all items for an invoice
   */
  static async deleteByInvoice(invoiceId) {
    const result = await query(
      'DELETE FROM invoice_items WHERE invoice_id = $1 RETURNING id',
      [invoiceId]
    );

    return result.rows.length;
  }

  /**
   * Get revenue by category from invoices
   */
  static async getRevenueByCategory(userId, dateFrom, dateTo) {
    const result = await query(
      `SELECT
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        COUNT(ii.id) as item_count,
        COALESCE(SUM(ii.line_total), 0) as total
       FROM categories c
       LEFT JOIN invoice_items ii ON c.id = ii.category_id
       LEFT JOIN invoices i ON ii.invoice_id = i.id
         AND i.user_id = $1
         AND i.issue_date >= $2
         AND i.issue_date <= $3
         AND i.status IN ('paid', 'partial')
         AND i.deleted_at IS NULL
       WHERE c.type = 'revenue' AND c.deleted_at IS NULL
       GROUP BY c.id, c.name, c.color
       HAVING SUM(ii.line_total) > 0
       ORDER BY total DESC`,
      [userId, dateFrom, dateTo]
    );

    return result.rows;
  }
}

module.exports = InvoiceItem;
