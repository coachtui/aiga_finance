const { query } = require('../config/database');
const logger = require('../utils/logger');

class Invoice {
  /**
   * Create a new invoice
   */
  static async create(userId, invoiceData) {
    try {
      const {
        clientId,
        contractId,
        subscriptionId,
        invoiceNumber,
        issueDate,
        dueDate,
        status = 'draft',
        subtotal = 0,
        taxRate = 0,
        taxAmount = 0,
        discountAmount = 0,
        currency = 'USD',
        notes,
        paymentTerms,
        paymentMethodInfo,
      } = invoiceData;

      const result = await query(
        `INSERT INTO invoices (
          user_id, client_id, contract_id, subscription_id, invoice_number,
          issue_date, due_date, status, subtotal, tax_rate, tax_amount,
          discount_amount, currency, notes, payment_terms, payment_method_info
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`,
        [
          userId,
          clientId,
          contractId || null,
          subscriptionId || null,
          invoiceNumber,
          issueDate,
          dueDate,
          status,
          subtotal,
          taxRate,
          taxAmount,
          discountAmount,
          currency,
          notes || null,
          paymentTerms || null,
          paymentMethodInfo || null,
        ]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Find invoice by ID with user ownership check
   */
  static async findById(id, userId) {
    const result = await query(
      `SELECT i.*,
              cl.company_name as client_name,
              cl.contact_email as client_email,
              cl.contact_name as client_contact
       FROM invoices i
       LEFT JOIN clients cl ON i.client_id = cl.id
       WHERE i.id = $1 AND i.user_id = $2 AND i.deleted_at IS NULL`,
      [id, userId]
    );
    return result.rows[0];
  }

  /**
   * Find all invoices for a user with pagination
   */
  static async findAll(userId, { limit = 20, offset = 0, sortBy = 'issue_date', sortOrder = 'desc' } = {}) {
    const validSortFields = ['issue_date', 'due_date', 'total_amount', 'created_at', 'invoice_number'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'issue_date';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const result = await query(
      `SELECT i.*,
              cl.company_name as client_name
       FROM invoices i
       LEFT JOIN clients cl ON i.client_id = cl.id
       WHERE i.user_id = $1 AND i.deleted_at IS NULL
       ORDER BY i.${sortField} ${order}, i.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows;
  }

  /**
   * Find invoices with complex filters
   */
  static async findWithFilters(userId, filters = {}) {
    const {
      clientId = null,
      status = null,
      search = null,
      dateFrom = null,
      dateTo = null,
      amountMin = null,
      amountMax = null,
      limit = 20,
      offset = 0,
      sortBy = 'issue_date',
      sortOrder = 'desc',
    } = filters;

    const conditions = ['i.user_id = $1', 'i.deleted_at IS NULL'];
    const params = [userId];
    let paramCount = 2;

    if (clientId) {
      conditions.push(`i.client_id = $${paramCount}`);
      params.push(clientId);
      paramCount++;
    }

    if (status) {
      conditions.push(`i.status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (search) {
      conditions.push(`(
        i.invoice_number ILIKE $${paramCount}
      )`);
      params.push(`%${search}%`);
      paramCount++;
    }

    if (dateFrom) {
      conditions.push(`i.issue_date >= $${paramCount}`);
      params.push(dateFrom);
      paramCount++;
    }

    if (dateTo) {
      conditions.push(`i.issue_date <= $${paramCount}`);
      params.push(dateTo);
      paramCount++;
    }

    if (amountMin !== null && amountMin !== undefined) {
      conditions.push(`i.total_amount >= $${paramCount}`);
      params.push(amountMin);
      paramCount++;
    }

    if (amountMax !== null && amountMax !== undefined) {
      conditions.push(`i.total_amount <= $${paramCount}`);
      params.push(amountMax);
      paramCount++;
    }

    const validSortFields = ['issue_date', 'due_date', 'total_amount', 'created_at', 'invoice_number'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'issue_date';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const whereClause = conditions.join(' AND ');

    const result = await query(
      `SELECT i.*,
              cl.company_name as client_name
       FROM invoices i
       LEFT JOIN clients cl ON i.client_id = cl.id
       WHERE ${whereClause}
       ORDER BY i.${sortField} ${order}, i.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    return result.rows;
  }

  /**
   * Count total invoices with filters
   */
  static async countWithFilters(userId, filters = {}) {
    const {
      clientId = null,
      status = null,
      search = null,
      dateFrom = null,
      dateTo = null,
      amountMin = null,
      amountMax = null,
    } = filters;

    const conditions = ['user_id = $1', 'deleted_at IS NULL'];
    const params = [userId];
    let paramCount = 2;

    if (clientId) {
      conditions.push(`client_id = $${paramCount}`);
      params.push(clientId);
      paramCount++;
    }

    if (status) {
      conditions.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (search) {
      conditions.push(`invoice_number ILIKE $${paramCount}`);
      params.push(`%${search}%`);
      paramCount++;
    }

    if (dateFrom) {
      conditions.push(`issue_date >= $${paramCount}`);
      params.push(dateFrom);
      paramCount++;
    }

    if (dateTo) {
      conditions.push(`issue_date <= $${paramCount}`);
      params.push(dateTo);
      paramCount++;
    }

    if (amountMin !== null && amountMin !== undefined) {
      conditions.push(`total_amount >= $${paramCount}`);
      params.push(amountMin);
      paramCount++;
    }

    if (amountMax !== null && amountMax !== undefined) {
      conditions.push(`total_amount <= $${paramCount}`);
      params.push(amountMax);
      paramCount++;
    }

    const whereClause = conditions.join(' AND ');

    const result = await query(
      `SELECT COUNT(*) FROM invoices WHERE ${whereClause}`,
      params
    );

    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Update invoice with user ownership check
   */
  static async update(id, userId, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.clientId !== undefined) {
      fields.push(`client_id = $${paramCount++}`);
      values.push(data.clientId);
    }

    if (data.contractId !== undefined) {
      fields.push(`contract_id = $${paramCount++}`);
      values.push(data.contractId || null);
    }

    if (data.subscriptionId !== undefined) {
      fields.push(`subscription_id = $${paramCount++}`);
      values.push(data.subscriptionId || null);
    }

    if (data.issueDate !== undefined) {
      fields.push(`issue_date = $${paramCount++}`);
      values.push(data.issueDate);
    }

    if (data.dueDate !== undefined) {
      fields.push(`due_date = $${paramCount++}`);
      values.push(data.dueDate);
    }

    if (data.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(data.status);
    }

    if (data.subtotal !== undefined) {
      fields.push(`subtotal = $${paramCount++}`);
      values.push(data.subtotal);
    }

    if (data.taxRate !== undefined) {
      fields.push(`tax_rate = $${paramCount++}`);
      values.push(data.taxRate);
    }

    if (data.taxAmount !== undefined) {
      fields.push(`tax_amount = $${paramCount++}`);
      values.push(data.taxAmount);
    }

    if (data.discountAmount !== undefined) {
      fields.push(`discount_amount = $${paramCount++}`);
      values.push(data.discountAmount);
    }

    if (data.notes !== undefined) {
      fields.push(`notes = $${paramCount++}`);
      values.push(data.notes || null);
    }

    if (data.paymentTerms !== undefined) {
      fields.push(`payment_terms = $${paramCount++}`);
      values.push(data.paymentTerms || null);
    }

    if (data.paymentMethodInfo !== undefined) {
      fields.push(`payment_method_info = $${paramCount++}`);
      values.push(data.paymentMethodInfo || null);
    }

    if (data.pdfPath !== undefined) {
      fields.push(`pdf_path = $${paramCount++}`);
      values.push(data.pdfPath || null);
    }

    if (data.sentDate !== undefined) {
      fields.push(`sent_date = $${paramCount++}`);
      values.push(data.sentDate || null);
    }

    if (data.sentToEmail !== undefined) {
      fields.push(`sent_to_email = $${paramCount++}`);
      values.push(data.sentToEmail || null);
    }

    if (data.paymentDate !== undefined) {
      fields.push(`payment_date = $${paramCount++}`);
      values.push(data.paymentDate || null);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id, userId);

    const result = await query(
      `UPDATE invoices
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount++} AND user_id = $${paramCount} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Invoice not found or unauthorized');
    }

    return result.rows[0];
  }

  /**
   * Soft delete invoice with user ownership check
   */
  static async delete(id, userId) {
    const result = await query(
      'UPDATE invoices SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Invoice not found or unauthorized');
    }

    return true;
  }

  /**
   * Generate unique invoice number
   */
  static async generateInvoiceNumber(userId) {
    // Get current year
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;

    // Get the next sequence number
    const result = await query(
      `SELECT COUNT(*) + 1 as next_number
       FROM invoices
       WHERE user_id = $1 AND invoice_number LIKE $2`,
      [userId, `${prefix}%`]
    );

    const nextNumber = result.rows[0].next_number;
    const invoiceNumber = `${prefix}${String(nextNumber).padStart(5, '0')}`;

    return invoiceNumber;
  }

  /**
   * Get outstanding balance for user
   */
  static async getOutstandingBalance(userId) {
    const result = await query(
      `SELECT COALESCE(SUM(balance_due), 0) as outstanding
       FROM invoices
       WHERE user_id = $1
         AND status NOT IN ('paid', 'void', 'cancelled')
         AND deleted_at IS NULL`,
      [userId]
    );

    return parseFloat(result.rows[0].outstanding) || 0;
  }

  /**
   * Get overdue invoices
   */
  static async getOverdueInvoices(userId) {
    const result = await query(
      `SELECT i.*, cl.company_name as client_name
       FROM invoices i
       LEFT JOIN clients cl ON i.client_id = cl.id
       WHERE i.user_id = $1
         AND i.status IN ('sent', 'partial')
         AND i.due_date < CURRENT_DATE
         AND i.deleted_at IS NULL
       ORDER BY i.due_date ASC`,
      [userId]
    );

    return result.rows;
  }

  /**
   * Get invoices due for payment reminder (3 days before due date)
   */
  static async getInvoicesDueReminder(daysAhead = 3) {
    const result = await query(
      `SELECT i.*, cl.contact_email as client_email, u.email as user_email
       FROM invoices i
       LEFT JOIN clients cl ON i.client_id = cl.id
       LEFT JOIN users u ON i.user_id = u.id
       WHERE i.status IN ('sent', 'viewed', 'partial')
         AND i.due_date <= CURRENT_DATE + INTERVAL '1 day' * $1
         AND i.due_date > CURRENT_DATE
         AND i.reminder_count < 2
         AND i.deleted_at IS NULL`,
      [daysAhead]
    );

    return result.rows;
  }

  /**
   * Record payment for invoice
   */
  static async recordPayment(invoiceId, userId, amount, paymentData) {
    // Get current invoice
    const invResult = await query(
      `SELECT total_amount, amount_paid FROM invoices WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [invoiceId, userId]
    );

    if (invResult.rows.length === 0) {
      throw new Error('Invoice not found or unauthorized');
    }

    const { total_amount: totalAmount, amount_paid: currentAmountPaid } = invResult.rows[0];
    const newAmountPaid = parseFloat(currentAmountPaid) + parseFloat(amount);

    // Determine new status
    let newStatus = 'partial';
    let paymentDate = null;

    if (newAmountPaid >= totalAmount) {
      newStatus = 'paid';
      paymentDate = new Date().toISOString().split('T')[0];
    }

    // Update invoice
    const result = await query(
      `UPDATE invoices
       SET amount_paid = $1, status = $2, payment_date = $3, updated_at = NOW()
       WHERE id = $4 AND user_id = $5 AND deleted_at IS NULL
       RETURNING *`,
      [newAmountPaid, newStatus, paymentDate, invoiceId, userId]
    );

    return result.rows[0];
  }

  /**
   * Get revenue by period
   */
  static async getRevenueByPeriod(userId, dateFrom, dateTo) {
    const result = await query(
      `SELECT
        COUNT(*) as invoice_count,
        SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as paid_revenue,
        SUM(CASE WHEN status IN ('sent', 'partial', 'overdue') THEN total_amount ELSE 0 END) as outstanding_revenue,
        SUM(total_amount) as total_billed
       FROM invoices
       WHERE user_id = $1
         AND issue_date >= $2
         AND issue_date <= $3
         AND deleted_at IS NULL`,
      [userId, dateFrom, dateTo]
    );

    return result.rows[0];
  }

  /**
   * Get invoice statistics
   */
  static async getStatistics(userId, period = 30) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - period);
    const dateFrom = daysAgo.toISOString().split('T')[0];
    const dateTo = new Date().toISOString().split('T')[0];

    const result = await query(
      `SELECT
        COUNT(*) as total_invoices,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END)::int as paid_invoices,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END)::int as overdue_invoices,
        COALESCE(SUM(total_amount), 0) as total_billed,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN status IN ('sent', 'partial', 'overdue') THEN balance_due ELSE 0 END), 0) as outstanding_balance
       FROM invoices
       WHERE user_id = $1
         AND issue_date >= $2
         AND issue_date <= $3
         AND deleted_at IS NULL`,
      [userId, dateFrom, dateTo]
    );

    return result.rows[0];
  }

  /**
   * Increment reminder count
   */
  static async incrementReminderCount(invoiceId, userId) {
    const result = await query(
      `UPDATE invoices
       SET reminder_count = reminder_count + 1, last_reminder_date = NOW(), updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
       RETURNING reminder_count, last_reminder_date`,
      [invoiceId, userId]
    );

    return result.rows[0];
  }
}

module.exports = Invoice;
