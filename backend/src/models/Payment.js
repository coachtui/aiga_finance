const { query } = require('../config/database');
const logger = require('../utils/logger');

class Payment {
  /**
   * Create a new payment
   */
  static async create(invoiceId, paymentData) {
    try {
      const {
        paymentDate,
        amount,
        paymentMethod,
        referenceNumber,
        notes,
        createdBy,
      } = paymentData;

      const result = await query(
        `INSERT INTO payments (
          invoice_id, payment_date, amount, payment_method, reference_number, notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          invoiceId,
          paymentDate,
          amount,
          paymentMethod || null,
          referenceNumber || null,
          notes || null,
          createdBy || null,
        ]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating payment:', error);
      throw error;
    }
  }

  /**
   * Find payment by ID
   */
  static async findById(id) {
    const result = await query(
      `SELECT p.*, i.invoice_number
       FROM payments p
       LEFT JOIN invoices i ON p.invoice_id = i.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get all payments for an invoice
   */
  static async getByInvoice(invoiceId) {
    const result = await query(
      `SELECT p.*, u.first_name, u.last_name, u.email
       FROM payments p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.invoice_id = $1
       ORDER BY p.payment_date DESC, p.created_at DESC`,
      [invoiceId]
    );

    return result.rows;
  }

  /**
   * Get total payments for an invoice
   */
  static async getTotalByInvoice(invoiceId) {
    const result = await query(
      `SELECT COALESCE(SUM(amount), 0) as total_paid
       FROM payments
       WHERE invoice_id = $1`,
      [invoiceId]
    );

    return parseFloat(result.rows[0].total_paid) || 0;
  }

  /**
   * Update payment
   */
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.paymentDate !== undefined) {
      fields.push(`payment_date = $${paramCount++}`);
      values.push(data.paymentDate);
    }

    if (data.amount !== undefined) {
      fields.push(`amount = $${paramCount++}`);
      values.push(data.amount);
    }

    if (data.paymentMethod !== undefined) {
      fields.push(`payment_method = $${paramCount++}`);
      values.push(data.paymentMethod || null);
    }

    if (data.referenceNumber !== undefined) {
      fields.push(`reference_number = $${paramCount++}`);
      values.push(data.referenceNumber || null);
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
      `UPDATE payments
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Payment not found');
    }

    return result.rows[0];
  }

  /**
   * Delete payment
   */
  static async delete(id) {
    const result = await query(
      'DELETE FROM payments WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Payment not found');
    }

    return true;
  }

  /**
   * Get payment statistics for user
   */
  static async getStatistics(userId, period = 30) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - period);
    const dateFrom = daysAgo.toISOString().split('T')[0];

    const result = await query(
      `SELECT
        COUNT(p.id) as payment_count,
        COALESCE(SUM(p.amount), 0) as total_paid,
        COALESCE(AVG(p.amount), 0) as average_payment
       FROM payments p
       LEFT JOIN invoices i ON p.invoice_id = i.id
       WHERE i.user_id = $1 AND p.payment_date >= $2`,
      [userId, dateFrom]
    );

    return result.rows[0];
  }

  /**
   * Get recent payments
   */
  static async getRecentPayments(userId, limit = 10) {
    const result = await query(
      `SELECT p.*, i.invoice_number, i.total_amount, cl.company_name
       FROM payments p
       LEFT JOIN invoices i ON p.invoice_id = i.id
       LEFT JOIN clients cl ON i.client_id = cl.id
       WHERE i.user_id = $1
       ORDER BY p.payment_date DESC, p.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }

  /**
   * Get days sales outstanding (DSO) - average days to payment
   */
  static async getDaysSalesOutstanding(userId, period = 90) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - period);
    const dateFrom = daysAgo.toISOString().split('T')[0];

    const result = await query(
      `SELECT
        COALESCE(AVG(EXTRACT(DAY FROM (p.payment_date - i.issue_date))), 0) as average_dso
       FROM payments p
       LEFT JOIN invoices i ON p.invoice_id = i.id
       WHERE i.user_id = $1
         AND p.payment_date >= $2
         AND i.issue_date >= $2`,
      [userId, dateFrom]
    );

    return parseFloat(result.rows[0].average_dso) || 0;
  }
}

module.exports = Payment;
