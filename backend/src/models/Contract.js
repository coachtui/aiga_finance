const { query } = require('../config/database');
const logger = require('../utils/logger');

class Contract {
  /**
   * Create a new contract
   */
  static async create(userId, contractData) {
    try {
      const {
        clientId,
        contractNumber,
        title,
        description,
        contractType,
        totalValue,
        currency = 'USD',
        startDate,
        endDate,
        status = 'draft',
        paymentSchedule,
        billingFrequency,
        autoRenew = false,
        renewalNoticeDays = 30,
        termsAndConditions,
        signedDate,
        signedBy,
        notes,
      } = contractData;

      const result = await query(
        `INSERT INTO contracts (
          user_id, client_id, contract_number, title, description, contract_type,
          total_value, currency, start_date, end_date, status, payment_schedule,
          billing_frequency, auto_renew, renewal_notice_days, terms_and_conditions,
          signed_date, signed_by, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING *`,
        [
          userId,
          clientId,
          contractNumber,
          title,
          description || null,
          contractType,
          totalValue,
          currency,
          startDate,
          endDate || null,
          status,
          paymentSchedule || null,
          billingFrequency || null,
          autoRenew,
          renewalNoticeDays,
          termsAndConditions || null,
          signedDate || null,
          signedBy || null,
          notes || null,
        ]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating contract:', error);
      throw error;
    }
  }

  /**
   * Find contract by ID with user ownership check
   */
  static async findById(id, userId) {
    const result = await query(
      `SELECT c.*,
              cl.company_name as client_name,
              cl.contact_email as client_email
       FROM contracts c
       LEFT JOIN clients cl ON c.client_id = cl.id
       WHERE c.id = $1 AND c.user_id = $2 AND c.deleted_at IS NULL`,
      [id, userId]
    );
    return result.rows[0];
  }

  /**
   * Find all contracts for a user with pagination
   */
  static async findAll(userId, { limit = 20, offset = 0, sortBy = 'start_date', sortOrder = 'desc' } = {}) {
    const validSortFields = ['start_date', 'total_value', 'created_at', 'contract_number'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'start_date';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const result = await query(
      `SELECT c.*,
              cl.company_name as client_name
       FROM contracts c
       LEFT JOIN clients cl ON c.client_id = cl.id
       WHERE c.user_id = $1 AND c.deleted_at IS NULL
       ORDER BY c.${sortField} ${order}, c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows;
  }

  /**
   * Find contracts with complex filters
   */
  static async findWithFilters(userId, filters = {}) {
    const {
      clientId = null,
      status = null,
      contractType = null,
      search = null,
      limit = 20,
      offset = 0,
      sortBy = 'start_date',
      sortOrder = 'desc',
    } = filters;

    const conditions = ['c.user_id = $1', 'c.deleted_at IS NULL'];
    const params = [userId];
    let paramCount = 2;

    if (clientId) {
      conditions.push(`c.client_id = $${paramCount}`);
      params.push(clientId);
      paramCount++;
    }

    if (status) {
      conditions.push(`c.status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (contractType) {
      conditions.push(`c.contract_type = $${paramCount}`);
      params.push(contractType);
      paramCount++;
    }

    if (search) {
      conditions.push(`(
        c.contract_number ILIKE $${paramCount} OR
        c.title ILIKE $${paramCount}
      )`);
      params.push(`%${search}%`);
      paramCount++;
    }

    const validSortFields = ['start_date', 'total_value', 'created_at', 'contract_number'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'start_date';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const whereClause = conditions.join(' AND ');

    const result = await query(
      `SELECT c.*,
              cl.company_name as client_name
       FROM contracts c
       LEFT JOIN clients cl ON c.client_id = cl.id
       WHERE ${whereClause}
       ORDER BY c.${sortField} ${order}, c.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    return result.rows;
  }

  /**
   * Count total contracts with filters
   */
  static async countWithFilters(userId, filters = {}) {
    const {
      clientId = null,
      status = null,
      contractType = null,
      search = null,
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

    if (contractType) {
      conditions.push(`contract_type = $${paramCount}`);
      params.push(contractType);
      paramCount++;
    }

    if (search) {
      conditions.push(`(contract_number ILIKE $${paramCount} OR title ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = conditions.join(' AND ');

    const result = await query(
      `SELECT COUNT(*) FROM contracts WHERE ${whereClause}`,
      params
    );

    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Update contract with user ownership check
   */
  static async update(id, userId, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.clientId !== undefined) {
      fields.push(`client_id = $${paramCount++}`);
      values.push(data.clientId);
    }

    if (data.contractNumber !== undefined) {
      fields.push(`contract_number = $${paramCount++}`);
      values.push(data.contractNumber);
    }

    if (data.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(data.title);
    }

    if (data.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(data.description || null);
    }

    if (data.contractType !== undefined) {
      fields.push(`contract_type = $${paramCount++}`);
      values.push(data.contractType);
    }

    if (data.totalValue !== undefined) {
      fields.push(`total_value = $${paramCount++}`);
      values.push(data.totalValue);
    }

    if (data.currency !== undefined) {
      fields.push(`currency = $${paramCount++}`);
      values.push(data.currency);
    }

    if (data.startDate !== undefined) {
      fields.push(`start_date = $${paramCount++}`);
      values.push(data.startDate);
    }

    if (data.endDate !== undefined) {
      fields.push(`end_date = $${paramCount++}`);
      values.push(data.endDate || null);
    }

    if (data.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(data.status);
    }

    if (data.paymentSchedule !== undefined) {
      fields.push(`payment_schedule = $${paramCount++}`);
      values.push(data.paymentSchedule || null);
    }

    if (data.billingFrequency !== undefined) {
      fields.push(`billing_frequency = $${paramCount++}`);
      values.push(data.billingFrequency || null);
    }

    if (data.autoRenew !== undefined) {
      fields.push(`auto_renew = $${paramCount++}`);
      values.push(data.autoRenew);
    }

    if (data.renewalNoticeDays !== undefined) {
      fields.push(`renewal_notice_days = $${paramCount++}`);
      values.push(data.renewalNoticeDays);
    }

    if (data.termsAndConditions !== undefined) {
      fields.push(`terms_and_conditions = $${paramCount++}`);
      values.push(data.termsAndConditions || null);
    }

    if (data.signedDate !== undefined) {
      fields.push(`signed_date = $${paramCount++}`);
      values.push(data.signedDate || null);
    }

    if (data.signedBy !== undefined) {
      fields.push(`signed_by = $${paramCount++}`);
      values.push(data.signedBy || null);
    }

    if (data.notes !== undefined) {
      fields.push(`notes = $${paramCount++}`);
      values.push(data.notes || null);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id, userId);

    const result = await query(
      `UPDATE contracts
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount++} AND user_id = $${paramCount} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Contract not found or unauthorized');
    }

    return result.rows[0];
  }

  /**
   * Soft delete contract with user ownership check
   */
  static async delete(id, userId) {
    const result = await query(
      'UPDATE contracts SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Contract not found or unauthorized');
    }

    return true;
  }

  /**
   * Get contract statistics
   */
  static async getStatistics(userId) {
    const result = await query(
      `SELECT
        COUNT(*) as total_contracts,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)::int as active_contracts,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)::int as completed_contracts,
        SUM(CASE WHEN end_date < CURRENT_DATE AND status = 'active' THEN 1 ELSE 0 END)::int as expired_contracts,
        COALESCE(SUM(total_value), 0) as total_contract_value
       FROM contracts
       WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId]
    );

    return result.rows[0];
  }

  /**
   * Get expiring contracts
   */
  static async getExpiringContracts(userId, daysAhead = 30) {
    const result = await query(
      `SELECT c.*, cl.company_name as client_name
       FROM contracts c
       LEFT JOIN clients cl ON c.client_id = cl.id
       WHERE c.user_id = $1
         AND c.status = 'active'
         AND c.end_date IS NOT NULL
         AND c.end_date <= CURRENT_DATE + INTERVAL '1 day' * $2
         AND c.end_date >= CURRENT_DATE
         AND c.deleted_at IS NULL
       ORDER BY c.end_date ASC`,
      [userId, daysAhead]
    );

    return result.rows;
  }

  /**
   * Get contract value by status
   */
  static async getValueByStatus(userId) {
    const result = await query(
      `SELECT status, COUNT(*) as count, SUM(total_value) as value
       FROM contracts
       WHERE user_id = $1 AND deleted_at IS NULL
       GROUP BY status`,
      [userId]
    );

    return result.rows;
  }
}

module.exports = Contract;
