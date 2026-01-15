const { query } = require('../config/database');
const logger = require('../utils/logger');

class Subscription {
  /**
   * Create a new subscription
   */
  static async create(userId, subscriptionData) {
    try {
      const {
        clientId,
        contractId,
        subscriptionName,
        description,
        billingCycle,
        billingAmount,
        currency = 'USD',
        startDate,
        endDate,
        nextBillingDate,
        status = 'active',
        trialEndDate,
        autoRenew = true,
      } = subscriptionData;

      const result = await query(
        `INSERT INTO subscriptions (
          user_id, client_id, contract_id, subscription_name, description,
          billing_cycle, billing_amount, currency, start_date, end_date,
          next_billing_date, status, trial_end_date, auto_renew
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          userId,
          clientId,
          contractId || null,
          subscriptionName,
          description || null,
          billingCycle,
          billingAmount,
          currency,
          startDate,
          endDate || null,
          nextBillingDate,
          status,
          trialEndDate || null,
          autoRenew,
        ]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Find subscription by ID with user ownership check
   */
  static async findById(id, userId) {
    const result = await query(
      `SELECT s.*,
              cl.company_name as client_name,
              cl.contact_email as client_email
       FROM subscriptions s
       LEFT JOIN clients cl ON s.client_id = cl.id
       WHERE s.id = $1 AND s.user_id = $2 AND s.deleted_at IS NULL`,
      [id, userId]
    );
    return result.rows[0];
  }

  /**
   * Find all subscriptions for a user with pagination
   */
  static async findAll(userId, { limit = 20, offset = 0, sortBy = 'subscription_name', sortOrder = 'asc' } = {}) {
    const validSortFields = ['subscription_name', 'billing_amount', 'created_at', 'status', 'next_billing_date'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'subscription_name';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const result = await query(
      `SELECT s.*,
              cl.company_name as client_name
       FROM subscriptions s
       LEFT JOIN clients cl ON s.client_id = cl.id
       WHERE s.user_id = $1 AND s.deleted_at IS NULL
       ORDER BY s.${sortField} ${order}, s.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows;
  }

  /**
   * Find subscriptions with complex filters
   */
  static async findWithFilters(userId, filters = {}) {
    const {
      clientId = null,
      status = null,
      billingCycle = null,
      search = null,
      limit = 20,
      offset = 0,
      sortBy = 'subscription_name',
      sortOrder = 'asc',
    } = filters;

    const conditions = ['s.user_id = $1', 's.deleted_at IS NULL'];
    const params = [userId];
    let paramCount = 2;

    if (clientId) {
      conditions.push(`s.client_id = $${paramCount}`);
      params.push(clientId);
      paramCount++;
    }

    if (status) {
      conditions.push(`s.status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (billingCycle) {
      conditions.push(`s.billing_cycle = $${paramCount}`);
      params.push(billingCycle);
      paramCount++;
    }

    if (search) {
      conditions.push(`(
        s.subscription_name ILIKE $${paramCount}
      )`);
      params.push(`%${search}%`);
      paramCount++;
    }

    const validSortFields = ['subscription_name', 'billing_amount', 'created_at', 'status', 'next_billing_date'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'subscription_name';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const whereClause = conditions.join(' AND ');

    const result = await query(
      `SELECT s.*,
              cl.company_name as client_name
       FROM subscriptions s
       LEFT JOIN clients cl ON s.client_id = cl.id
       WHERE ${whereClause}
       ORDER BY s.${sortField} ${order}, s.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    return result.rows;
  }

  /**
   * Count total subscriptions with filters
   */
  static async countWithFilters(userId, filters = {}) {
    const {
      clientId = null,
      status = null,
      billingCycle = null,
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

    if (billingCycle) {
      conditions.push(`billing_cycle = $${paramCount}`);
      params.push(billingCycle);
      paramCount++;
    }

    if (search) {
      conditions.push(`subscription_name ILIKE $${paramCount}`);
      params.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = conditions.join(' AND ');

    const result = await query(
      `SELECT COUNT(*) FROM subscriptions WHERE ${whereClause}`,
      params
    );

    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Update subscription with user ownership check
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

    if (data.subscriptionName !== undefined) {
      fields.push(`subscription_name = $${paramCount++}`);
      values.push(data.subscriptionName);
    }

    if (data.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(data.description || null);
    }

    if (data.billingCycle !== undefined) {
      fields.push(`billing_cycle = $${paramCount++}`);
      values.push(data.billingCycle);
    }

    if (data.billingAmount !== undefined) {
      fields.push(`billing_amount = $${paramCount++}`);
      values.push(data.billingAmount);
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

    if (data.nextBillingDate !== undefined) {
      fields.push(`next_billing_date = $${paramCount++}`);
      values.push(data.nextBillingDate);
    }

    if (data.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(data.status);
    }

    if (data.trialEndDate !== undefined) {
      fields.push(`trial_end_date = $${paramCount++}`);
      values.push(data.trialEndDate || null);
    }

    if (data.autoRenew !== undefined) {
      fields.push(`auto_renew = $${paramCount++}`);
      values.push(data.autoRenew);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id, userId);

    const result = await query(
      `UPDATE subscriptions
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount++} AND user_id = $${paramCount} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Subscription not found or unauthorized');
    }

    return result.rows[0];
  }

  /**
   * Soft delete subscription with user ownership check
   */
  static async delete(id, userId) {
    const result = await query(
      'UPDATE subscriptions SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Subscription not found or unauthorized');
    }

    return true;
  }

  /**
   * Calculate Monthly Recurring Revenue (MRR)
   */
  static async calculateMRR(userId) {
    const result = await query(
      `SELECT COALESCE(SUM(mrr_contribution), 0) as mrr
       FROM subscriptions
       WHERE user_id = $1 AND status = 'active' AND deleted_at IS NULL`,
      [userId]
    );

    return parseFloat(result.rows[0].mrr) || 0;
  }

  /**
   * Calculate Annual Recurring Revenue (ARR)
   */
  static async calculateARR(userId) {
    const result = await query(
      `SELECT COALESCE(SUM(arr_contribution), 0) as arr
       FROM subscriptions
       WHERE user_id = $1 AND status = 'active' AND deleted_at IS NULL`,
      [userId]
    );

    return parseFloat(result.rows[0].arr) || 0;
  }

  /**
   * Get MRR breakdown by client
   */
  static async getMRRBreakdown(userId) {
    const result = await query(
      `SELECT
        cl.id as client_id,
        cl.company_name as client_name,
        COUNT(*) as subscription_count,
        COALESCE(SUM(s.mrr_contribution), 0) as mrr
       FROM subscriptions s
       LEFT JOIN clients cl ON s.client_id = cl.id
       WHERE s.user_id = $1 AND s.status = 'active' AND s.deleted_at IS NULL
       GROUP BY cl.id, cl.company_name
       ORDER BY mrr DESC`,
      [userId]
    );

    return result.rows;
  }

  /**
   * Get subscription churn rate
   */
  static async getChurnRate(userId, period = 30) {
    const result = await query(
      `WITH churn_data AS (
        SELECT
          COUNT(*) as total_cancelled,
          (
            SELECT COUNT(*)
            FROM subscriptions
            WHERE user_id = $1 AND status = 'active' AND deleted_at IS NULL
          ) as total_active
        FROM subscriptions
        WHERE user_id = $1
          AND status = 'cancelled'
          AND cancellation_date >= CURRENT_DATE - INTERVAL '1 day' * $2
          AND deleted_at IS NULL
      )
      SELECT
        total_cancelled,
        total_active,
        CASE
          WHEN total_active > 0 THEN (total_cancelled::float / total_active::float) * 100
          ELSE 0
        END as churn_rate
      FROM churn_data`,
      [userId, period]
    );

    const data = result.rows[0] || { total_cancelled: 0, total_active: 0, churn_rate: 0 };
    return data;
  }

  /**
   * Get upcoming renewals
   */
  static async getUpcomingRenewals(userId, daysAhead = 30) {
    const result = await query(
      `SELECT s.*, cl.company_name as client_name
       FROM subscriptions s
       LEFT JOIN clients cl ON s.client_id = cl.id
       WHERE s.user_id = $1
         AND s.status = 'active'
         AND s.next_billing_date <= CURRENT_DATE + INTERVAL '1 day' * $2
         AND s.next_billing_date >= CURRENT_DATE
         AND s.deleted_at IS NULL
       ORDER BY s.next_billing_date ASC`,
      [userId, daysAhead]
    );

    return result.rows;
  }

  /**
   * Update next billing date based on billing cycle
   */
  static async updateNextBillingDate(subscriptionId, userId) {
    // Get subscription first to determine billing cycle
    const subResult = await query(
      `SELECT billing_cycle, next_billing_date FROM subscriptions WHERE id = $1 AND user_id = $2`,
      [subscriptionId, userId]
    );

    if (subResult.rows.length === 0) {
      throw new Error('Subscription not found');
    }

    const { billing_cycle: billingCycle, next_billing_date: currentDate } = subResult.rows[0];

    let nextDate;
    const current = new Date(currentDate);

    if (billingCycle === 'monthly') {
      current.setMonth(current.getMonth() + 1);
      nextDate = current;
    } else if (billingCycle === 'quarterly') {
      current.setMonth(current.getMonth() + 3);
      nextDate = current;
    } else if (billingCycle === 'annual') {
      current.setFullYear(current.getFullYear() + 1);
      nextDate = current;
    } else {
      // Custom billing cycle - default to 30 days
      current.setDate(current.getDate() + 30);
      nextDate = current;
    }

    const result = await query(
      `UPDATE subscriptions
       SET next_billing_date = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [nextDate.toISOString().split('T')[0], subscriptionId, userId]
    );

    return result.rows[0];
  }

  /**
   * Get subscriptions with upcoming billing dates
   */
  static async getSubscriptionsDueBilling(limit = 100) {
    const result = await query(
      `SELECT s.*, u.email as user_email, cl.company_name as client_name
       FROM subscriptions s
       LEFT JOIN users u ON s.user_id = u.id
       LEFT JOIN clients cl ON s.client_id = cl.id
       WHERE s.status = 'active'
         AND s.next_billing_date <= CURRENT_DATE
         AND s.deleted_at IS NULL
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }
}

module.exports = Subscription;
