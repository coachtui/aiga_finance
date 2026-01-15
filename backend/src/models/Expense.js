const { query } = require('../config/database');
const logger = require('../utils/logger');

class Expense {
  /**
   * Create a new expense
   */
  static async create(userId, expenseData) {
    try {
      const {
        amount,
        categoryId,
        paymentMethodId,
        transactionDate,
        description,
        vendorName,
        notes,
        currency = 'USD',
        exchangeRate = 1.0,
        isRecurring = false,
        recurrenceRule = null,
        isReimbursable = false,
        isBillable = false,
        taxDeductible = true,
        tags = [],
        status = 'pending',
        plaidTransactionId = null,
        parentExpenseId = null,
      } = expenseData;

      const result = await query(
        `INSERT INTO expenses (
          user_id, category_id, payment_method_id, amount, currency, exchange_rate,
          transaction_date, description, vendor_name, notes, is_recurring, recurrence_rule,
          is_reimbursable, is_billable, tax_deductible, tags, status, plaid_transaction_id, parent_expense_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING *`,
        [
          userId,
          categoryId || null,
          paymentMethodId || null,
          amount,
          currency,
          exchangeRate,
          transactionDate,
          description || null,
          vendorName || null,
          notes || null,
          isRecurring,
          recurrenceRule ? JSON.stringify(recurrenceRule) : null,
          isReimbursable,
          isBillable,
          taxDeductible,
          tags,
          status,
          plaidTransactionId || null,
          parentExpenseId || null,
        ]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating expense:', error);
      throw error;
    }
  }

  /**
   * Find expense by ID with user ownership check
   */
  static async findById(id, userId) {
    const result = await query(
      `SELECT
        e.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon,
        pm.name as payment_method_name,
        pm.type as payment_method_type
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN payment_methods pm ON e.payment_method_id = pm.id
      WHERE e.id = $1 AND e.user_id = $2 AND e.deleted_at IS NULL`,
      [id, userId]
    );
    return result.rows[0];
  }

  /**
   * Find all expenses for a user with pagination
   */
  static async findAll(userId, { limit = 20, offset = 0, sortBy = 'transaction_date', sortOrder = 'desc' } = {}) {
    const validSortFields = ['transaction_date', 'amount', 'amount_usd', 'created_at', 'vendor_name'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'transaction_date';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const result = await query(
      `SELECT
        e.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon,
        pm.name as payment_method_name,
        pm.type as payment_method_type
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN payment_methods pm ON e.payment_method_id = pm.id
      WHERE e.user_id = $1 AND e.deleted_at IS NULL
      ORDER BY e.${sortField} ${order}, e.created_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows;
  }

  /**
   * Find expenses with complex filters
   */
  static async findWithFilters(userId, filters = {}) {
    const {
      categoryIds = null,
      paymentMethodIds = null,
      tags = null,
      dateFrom = null,
      dateTo = null,
      amountMin = null,
      amountMax = null,
      search = null,
      status = null,
      limit = 20,
      offset = 0,
      sortBy = 'transaction_date',
      sortOrder = 'desc',
    } = filters;

    const conditions = ['e.user_id = $1', 'e.deleted_at IS NULL'];
    const params = [userId];
    let paramCount = 2;

    // Category filter
    if (categoryIds && categoryIds.length > 0) {
      conditions.push(`e.category_id = ANY($${paramCount})`);
      params.push(Array.isArray(categoryIds) ? categoryIds : [categoryIds]);
      paramCount++;
    }

    // Payment method filter
    if (paymentMethodIds && paymentMethodIds.length > 0) {
      conditions.push(`e.payment_method_id = ANY($${paramCount})`);
      params.push(Array.isArray(paymentMethodIds) ? paymentMethodIds : [paymentMethodIds]);
      paramCount++;
    }

    // Tag filter (PostgreSQL array overlap operator)
    if (tags && tags.length > 0) {
      conditions.push(`e.tags && $${paramCount}::text[]`);
      params.push(Array.isArray(tags) ? tags : [tags]);
      paramCount++;
    }

    // Date range filters
    if (dateFrom) {
      conditions.push(`e.transaction_date >= $${paramCount}`);
      params.push(dateFrom);
      paramCount++;
    }

    if (dateTo) {
      conditions.push(`e.transaction_date <= $${paramCount}`);
      params.push(dateTo);
      paramCount++;
    }

    // Amount range filters
    if (amountMin !== null && amountMin !== undefined) {
      conditions.push(`e.amount_usd >= $${paramCount}`);
      params.push(amountMin);
      paramCount++;
    }

    if (amountMax !== null && amountMax !== undefined) {
      conditions.push(`e.amount_usd <= $${paramCount}`);
      params.push(amountMax);
      paramCount++;
    }

    // Search filter (description, vendor_name, notes)
    if (search) {
      conditions.push(`(
        e.description ILIKE $${paramCount} OR
        e.vendor_name ILIKE $${paramCount} OR
        e.notes ILIKE $${paramCount}
      )`);
      params.push(`%${search}%`);
      paramCount++;
    }

    // Status filter
    if (status) {
      conditions.push(`e.status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    const validSortFields = ['transaction_date', 'amount', 'amount_usd', 'created_at', 'vendor_name'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'transaction_date';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const whereClause = conditions.join(' AND ');

    const result = await query(
      `SELECT
        e.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon,
        pm.name as payment_method_name,
        pm.type as payment_method_type
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN payment_methods pm ON e.payment_method_id = pm.id
      WHERE ${whereClause}
      ORDER BY e.${sortField} ${order}, e.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    return result.rows;
  }

  /**
   * Count total expenses with filters
   */
  static async countWithFilters(userId, filters = {}) {
    const {
      categoryIds = null,
      paymentMethodIds = null,
      tags = null,
      dateFrom = null,
      dateTo = null,
      amountMin = null,
      amountMax = null,
      search = null,
      status = null,
    } = filters;

    const conditions = ['user_id = $1', 'deleted_at IS NULL'];
    const params = [userId];
    let paramCount = 2;

    if (categoryIds && categoryIds.length > 0) {
      conditions.push(`category_id = ANY($${paramCount})`);
      params.push(Array.isArray(categoryIds) ? categoryIds : [categoryIds]);
      paramCount++;
    }

    if (paymentMethodIds && paymentMethodIds.length > 0) {
      conditions.push(`payment_method_id = ANY($${paramCount})`);
      params.push(Array.isArray(paymentMethodIds) ? paymentMethodIds : [paymentMethodIds]);
      paramCount++;
    }

    if (tags && tags.length > 0) {
      conditions.push(`tags && $${paramCount}::text[]`);
      params.push(Array.isArray(tags) ? tags : [tags]);
      paramCount++;
    }

    if (dateFrom) {
      conditions.push(`transaction_date >= $${paramCount}`);
      params.push(dateFrom);
      paramCount++;
    }

    if (dateTo) {
      conditions.push(`transaction_date <= $${paramCount}`);
      params.push(dateTo);
      paramCount++;
    }

    if (amountMin !== null && amountMin !== undefined) {
      conditions.push(`amount_usd >= $${paramCount}`);
      params.push(amountMin);
      paramCount++;
    }

    if (amountMax !== null && amountMax !== undefined) {
      conditions.push(`amount_usd <= $${paramCount}`);
      params.push(amountMax);
      paramCount++;
    }

    if (search) {
      conditions.push(`(description ILIKE $${paramCount} OR vendor_name ILIKE $${paramCount} OR notes ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    if (status) {
      conditions.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    const whereClause = conditions.join(' AND ');

    const result = await query(
      `SELECT COUNT(*) FROM expenses WHERE ${whereClause}`,
      params
    );

    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Update expense with user ownership check
   */
  static async update(id, userId, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.amount !== undefined) {
      fields.push(`amount = $${paramCount++}`);
      values.push(data.amount);
    }

    if (data.categoryId !== undefined) {
      fields.push(`category_id = $${paramCount++}`);
      values.push(data.categoryId || null);
    }

    if (data.paymentMethodId !== undefined) {
      fields.push(`payment_method_id = $${paramCount++}`);
      values.push(data.paymentMethodId || null);
    }

    if (data.transactionDate !== undefined) {
      fields.push(`transaction_date = $${paramCount++}`);
      values.push(data.transactionDate);
    }

    if (data.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(data.description || null);
    }

    if (data.vendorName !== undefined) {
      fields.push(`vendor_name = $${paramCount++}`);
      values.push(data.vendorName || null);
    }

    if (data.notes !== undefined) {
      fields.push(`notes = $${paramCount++}`);
      values.push(data.notes || null);
    }

    if (data.currency !== undefined) {
      fields.push(`currency = $${paramCount++}`);
      values.push(data.currency);
    }

    if (data.exchangeRate !== undefined) {
      fields.push(`exchange_rate = $${paramCount++}`);
      values.push(data.exchangeRate);
    }

    if (data.isRecurring !== undefined) {
      fields.push(`is_recurring = $${paramCount++}`);
      values.push(data.isRecurring);
    }

    if (data.recurrenceRule !== undefined) {
      fields.push(`recurrence_rule = $${paramCount++}`);
      values.push(data.recurrenceRule ? JSON.stringify(data.recurrenceRule) : null);
    }

    if (data.isReimbursable !== undefined) {
      fields.push(`is_reimbursable = $${paramCount++}`);
      values.push(data.isReimbursable);
    }

    if (data.isBillable !== undefined) {
      fields.push(`is_billable = $${paramCount++}`);
      values.push(data.isBillable);
    }

    if (data.taxDeductible !== undefined) {
      fields.push(`tax_deductible = $${paramCount++}`);
      values.push(data.taxDeductible);
    }

    if (data.tags !== undefined) {
      fields.push(`tags = $${paramCount++}`);
      values.push(data.tags);
    }

    if (data.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(data.status);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id, userId);

    const result = await query(
      `UPDATE expenses
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount++} AND user_id = $${paramCount} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Expense not found or unauthorized');
    }

    return result.rows[0];
  }

  /**
   * Soft delete expense with user ownership check
   */
  static async delete(id, userId) {
    const result = await query(
      'UPDATE expenses SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Expense not found or unauthorized');
    }

    return true;
  }

  /**
   * Get expense statistics for dashboard
   */
  static async getStatistics(userId, dateFrom, dateTo) {
    const result = await query(
      `SELECT
        COUNT(*)::int as transaction_count,
        COALESCE(SUM(amount_usd), 0) as total_amount,
        COALESCE(AVG(amount_usd), 0) as average_amount
      FROM expenses
      WHERE user_id = $1
        AND transaction_date >= $2
        AND transaction_date <= $3
        AND deleted_at IS NULL`,
      [userId, dateFrom, dateTo]
    );

    // Get category breakdown
    const categoryBreakdown = await query(
      `SELECT
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        COALESCE(SUM(e.amount_usd), 0) as total
      FROM categories c
      LEFT JOIN expenses e ON c.id = e.category_id
        AND e.user_id = $1
        AND e.transaction_date >= $2
        AND e.transaction_date <= $3
        AND e.deleted_at IS NULL
      WHERE c.type = 'expense' AND c.deleted_at IS NULL
      GROUP BY c.id, c.name, c.color
      HAVING SUM(e.amount_usd) > 0
      ORDER BY total DESC`,
      [userId, dateFrom, dateTo]
    );

    // Get daily trend
    const dailyTrend = await query(
      `SELECT
        transaction_date::date as date,
        COALESCE(SUM(amount_usd), 0) as amount
      FROM expenses
      WHERE user_id = $1
        AND transaction_date >= $2
        AND transaction_date <= $3
        AND deleted_at IS NULL
      GROUP BY transaction_date::date
      ORDER BY date ASC`,
      [userId, dateFrom, dateTo]
    );

    return {
      ...result.rows[0],
      categoryBreakdown: categoryBreakdown.rows,
      dailyTrend: dailyTrend.rows,
    };
  }

  /**
   * Get all unique tags for a user
   */
  static async getTags(userId) {
    const result = await query(
      `SELECT DISTINCT unnest(tags) as tag
       FROM expenses
       WHERE user_id = $1 AND deleted_at IS NULL AND tags IS NOT NULL
       ORDER BY tag`,
      [userId]
    );
    return result.rows.map((row) => row.tag);
  }

  /**
   * Get recent vendor names for autocomplete
   */
  static async getRecentVendors(userId, limit = 10) {
    const result = await query(
      `SELECT vendor_name
       FROM expenses
       WHERE user_id = $1 AND vendor_name IS NOT NULL AND deleted_at IS NULL
       GROUP BY vendor_name
       ORDER BY MAX(created_at) DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows.map((row) => row.vendor_name);
  }
}

module.exports = Expense;
