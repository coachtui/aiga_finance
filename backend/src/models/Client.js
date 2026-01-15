const { query } = require('../config/database');
const logger = require('../utils/logger');

class Client {
  /**
   * Create a new client
   */
  static async create(userId, clientData) {
    try {
      const {
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country = 'USA',
        taxId,
        status = 'active',
        paymentTerms = 30,
        notes,
        website,
        industry,
      } = clientData;

      const result = await query(
        `INSERT INTO clients (
          user_id, company_name, contact_name, contact_email, contact_phone,
          address_line1, address_line2, city, state, postal_code, country, tax_id,
          status, payment_terms, notes, website, industry
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *`,
        [
          userId,
          companyName,
          contactName || null,
          contactEmail || null,
          contactPhone || null,
          addressLine1 || null,
          addressLine2 || null,
          city || null,
          state || null,
          postalCode || null,
          country,
          taxId || null,
          status,
          paymentTerms,
          notes || null,
          website || null,
          industry || null,
        ]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating client:', error);
      throw error;
    }
  }

  /**
   * Find client by ID with user ownership check
   */
  static async findById(id, userId) {
    const result = await query(
      `SELECT *
       FROM clients
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [id, userId]
    );
    return result.rows[0];
  }

  /**
   * Find all clients for a user with pagination
   */
  static async findAll(userId, { limit = 20, offset = 0, sortBy = 'company_name', sortOrder = 'asc' } = {}) {
    const validSortFields = ['company_name', 'created_at', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'company_name';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const result = await query(
      `SELECT *
       FROM clients
       WHERE user_id = $1 AND deleted_at IS NULL
       ORDER BY ${sortField} ${order}, created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows;
  }

  /**
   * Find clients with complex filters
   */
  static async findWithFilters(userId, filters = {}) {
    const {
      status = null,
      search = null,
      industry = null,
      limit = 20,
      offset = 0,
      sortBy = 'company_name',
      sortOrder = 'asc',
    } = filters;

    const conditions = ['user_id = $1', 'deleted_at IS NULL'];
    const params = [userId];
    let paramCount = 2;

    if (status) {
      conditions.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (search) {
      conditions.push(`(
        company_name ILIKE $${paramCount} OR
        contact_name ILIKE $${paramCount} OR
        contact_email ILIKE $${paramCount}
      )`);
      params.push(`%${search}%`);
      paramCount++;
    }

    if (industry) {
      conditions.push(`industry = $${paramCount}`);
      params.push(industry);
      paramCount++;
    }

    const validSortFields = ['company_name', 'created_at', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'company_name';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const whereClause = conditions.join(' AND ');

    const result = await query(
      `SELECT *
       FROM clients
       WHERE ${whereClause}
       ORDER BY ${sortField} ${order}, created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    return result.rows;
  }

  /**
   * Count total clients with filters
   */
  static async countWithFilters(userId, filters = {}) {
    const {
      status = null,
      search = null,
      industry = null,
    } = filters;

    const conditions = ['user_id = $1', 'deleted_at IS NULL'];
    const params = [userId];
    let paramCount = 2;

    if (status) {
      conditions.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (search) {
      conditions.push(`(company_name ILIKE $${paramCount} OR contact_name ILIKE $${paramCount} OR contact_email ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    if (industry) {
      conditions.push(`industry = $${paramCount}`);
      params.push(industry);
      paramCount++;
    }

    const whereClause = conditions.join(' AND ');

    const result = await query(
      `SELECT COUNT(*) FROM clients WHERE ${whereClause}`,
      params
    );

    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Update client with user ownership check
   */
  static async update(id, userId, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.companyName !== undefined) {
      fields.push(`company_name = $${paramCount++}`);
      values.push(data.companyName);
    }

    if (data.contactName !== undefined) {
      fields.push(`contact_name = $${paramCount++}`);
      values.push(data.contactName || null);
    }

    if (data.contactEmail !== undefined) {
      fields.push(`contact_email = $${paramCount++}`);
      values.push(data.contactEmail || null);
    }

    if (data.contactPhone !== undefined) {
      fields.push(`contact_phone = $${paramCount++}`);
      values.push(data.contactPhone || null);
    }

    if (data.addressLine1 !== undefined) {
      fields.push(`address_line1 = $${paramCount++}`);
      values.push(data.addressLine1 || null);
    }

    if (data.addressLine2 !== undefined) {
      fields.push(`address_line2 = $${paramCount++}`);
      values.push(data.addressLine2 || null);
    }

    if (data.city !== undefined) {
      fields.push(`city = $${paramCount++}`);
      values.push(data.city || null);
    }

    if (data.state !== undefined) {
      fields.push(`state = $${paramCount++}`);
      values.push(data.state || null);
    }

    if (data.postalCode !== undefined) {
      fields.push(`postal_code = $${paramCount++}`);
      values.push(data.postalCode || null);
    }

    if (data.country !== undefined) {
      fields.push(`country = $${paramCount++}`);
      values.push(data.country);
    }

    if (data.taxId !== undefined) {
      fields.push(`tax_id = $${paramCount++}`);
      values.push(data.taxId || null);
    }

    if (data.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(data.status);
    }

    if (data.paymentTerms !== undefined) {
      fields.push(`payment_terms = $${paramCount++}`);
      values.push(data.paymentTerms);
    }

    if (data.notes !== undefined) {
      fields.push(`notes = $${paramCount++}`);
      values.push(data.notes || null);
    }

    if (data.website !== undefined) {
      fields.push(`website = $${paramCount++}`);
      values.push(data.website || null);
    }

    if (data.industry !== undefined) {
      fields.push(`industry = $${paramCount++}`);
      values.push(data.industry || null);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id, userId);

    const result = await query(
      `UPDATE clients
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount++} AND user_id = $${paramCount} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Client not found or unauthorized');
    }

    return result.rows[0];
  }

  /**
   * Soft delete client with user ownership check
   */
  static async delete(id, userId) {
    const result = await query(
      'UPDATE clients SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Client not found or unauthorized');
    }

    return true;
  }

  /**
   * Get total revenue from client
   */
  static async getRevenueTotal(clientId, userId, dateFrom, dateTo) {
    const result = await query(
      `SELECT COALESCE(SUM(total_amount), 0) as total_revenue
       FROM invoices
       WHERE client_id = $1 AND user_id = $2
         AND issue_date >= $3 AND issue_date <= $4
         AND status IN ('paid', 'partial')
         AND deleted_at IS NULL`,
      [clientId, userId, dateFrom, dateTo]
    );

    return result.rows[0].total_revenue;
  }

  /**
   * Get active contracts for client
   */
  static async getActiveContracts(clientId, userId) {
    const result = await query(
      `SELECT id, contract_number, title, status, start_date, end_date
       FROM contracts
       WHERE client_id = $1 AND user_id = $2 AND status = 'active' AND deleted_at IS NULL`,
      [clientId, userId]
    );

    return result.rows;
  }

  /**
   * Get active subscriptions for client
   */
  static async getActiveSubscriptions(clientId, userId) {
    const result = await query(
      `SELECT id, subscription_name, billing_amount, billing_cycle, status, mrr_contribution
       FROM subscriptions
       WHERE client_id = $1 AND user_id = $2 AND status = 'active' AND deleted_at IS NULL`,
      [clientId, userId]
    );

    return result.rows;
  }

  /**
   * Get invoice statistics for client
   */
  static async getInvoiceStats(clientId, userId) {
    const result = await query(
      `SELECT
        COUNT(*) as total_invoices,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END)::int as paid_invoices,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END)::int as overdue_invoices,
        COALESCE(SUM(CASE WHEN status IN ('paid', 'partial') THEN total_amount ELSE 0 END), 0) as total_billed,
        COALESCE(SUM(CASE WHEN status IN ('sent', 'overdue', 'partial') THEN balance_due ELSE 0 END), 0) as outstanding_balance
       FROM invoices
       WHERE client_id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [clientId, userId]
    );

    return result.rows[0];
  }
}

module.exports = Client;
