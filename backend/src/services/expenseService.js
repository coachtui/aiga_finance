const Expense = require('../models/Expense');
const Category = require('../models/Category');
const PaymentMethod = require('../models/PaymentMethod');
const { query } = require('../config/database');
const logger = require('../utils/logger');

class ExpenseService {
  /**
   * Create a new expense
   */
  static async createExpense(userId, expenseData) {
    // Validate category if provided
    if (expenseData.categoryId) {
      const categoryExists = await Category.exists(expenseData.categoryId);
      if (!categoryExists) {
        throw new Error('Invalid category ID');
      }
    }

    // Validate payment method if provided and check ownership
    if (expenseData.paymentMethodId) {
      const paymentMethodExists = await PaymentMethod.exists(expenseData.paymentMethodId, userId);
      if (!paymentMethodExists) {
        throw new Error('Invalid payment method ID or unauthorized access');
      }
    }

    // Process tags: trim, lowercase, deduplicate
    if (expenseData.tags && Array.isArray(expenseData.tags)) {
      expenseData.tags = [...new Set(
        expenseData.tags
          .map(tag => tag.trim().toLowerCase())
          .filter(tag => tag.length > 0)
      )];
    }

    // Create expense
    const expense = await Expense.create(userId, expenseData);

    // Log to audit_logs
    await this.logAuditAction(userId, 'create', 'expense', expense.id, {
      amount: expense.amount,
      vendor: expense.vendor_name,
    });

    logger.info('Expense created:', { userId, expenseId: expense.id, amount: expense.amount });

    // Fetch with relations for response
    return await Expense.findById(expense.id, userId);
  }

  /**
   * Get expenses with filters and pagination
   */
  static async getExpenses(userId, filters = {}, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    // Get expenses with filters
    const expenses = await Expense.findWithFilters(userId, {
      ...filters,
      limit,
      offset,
    });

    // Get total count for pagination
    const totalItems = await Expense.countWithFilters(userId, filters);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      expenses,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
      },
    };
  }

  /**
   * Get a single expense by ID
   */
  static async getExpenseById(userId, expenseId) {
    const expense = await Expense.findById(expenseId, userId);
    if (!expense) {
      throw new Error('Expense not found');
    }
    return expense;
  }

  /**
   * Update an expense
   */
  static async updateExpense(userId, expenseId, updateData) {
    // Check if expense exists and belongs to user
    const existingExpense = await Expense.findById(expenseId, userId);
    if (!existingExpense) {
      throw new Error('Expense not found or unauthorized');
    }

    // Validate category if being updated
    if (updateData.categoryId !== undefined && updateData.categoryId !== null) {
      const categoryExists = await Category.exists(updateData.categoryId);
      if (!categoryExists) {
        throw new Error('Invalid category ID');
      }
    }

    // Validate payment method if being updated
    if (updateData.paymentMethodId !== undefined && updateData.paymentMethodId !== null) {
      const paymentMethodExists = await PaymentMethod.exists(updateData.paymentMethodId, userId);
      if (!paymentMethodExists) {
        throw new Error('Invalid payment method ID or unauthorized access');
      }
    }

    // Process tags if provided
    if (updateData.tags && Array.isArray(updateData.tags)) {
      updateData.tags = [...new Set(
        updateData.tags
          .map(tag => tag.trim().toLowerCase())
          .filter(tag => tag.length > 0)
      )];
    }

    // Update expense
    const updatedExpense = await Expense.update(expenseId, userId, updateData);

    // Log to audit_logs
    await this.logAuditAction(userId, 'update', 'expense', expenseId, updateData);

    logger.info('Expense updated:', { userId, expenseId });

    // Fetch with relations for response
    return await Expense.findById(expenseId, userId);
  }

  /**
   * Delete an expense
   */
  static async deleteExpense(userId, expenseId) {
    // Check if expense exists and belongs to user
    const existingExpense = await Expense.findById(expenseId, userId);
    if (!existingExpense) {
      throw new Error('Expense not found or unauthorized');
    }

    // Delete expense (soft delete)
    await Expense.delete(expenseId, userId);

    // Log to audit_logs
    await this.logAuditAction(userId, 'delete', 'expense', expenseId, {
      amount: existingExpense.amount,
      vendor: existingExpense.vendor_name,
    });

    logger.info('Expense deleted:', { userId, expenseId });

    return true;
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(userId, period = '30d') {
    // Parse period (7d, 30d, 90d, 1y)
    const { dateFrom, dateTo } = this.parsePeriod(period);

    // Get statistics
    const stats = await Expense.getStatistics(userId, dateFrom, dateTo);

    // Calculate burn rate (average spending per month)
    const daysDiff = Math.ceil((dateTo - dateFrom) / (1000 * 60 * 60 * 24));
    const monthsDiff = daysDiff / 30.0;
    const burnRate = monthsDiff > 0 ? stats.total_amount / monthsDiff : 0;

    // Calculate runway (placeholder - would need cash balance from bank accounts)
    // For now, return null or infinity
    const runway = null; // This would be: availableCash / burnRate

    return {
      totalAmount: parseFloat(stats.total_amount),
      transactionCount: stats.transaction_count,
      averageAmount: parseFloat(stats.average_amount),
      burnRate: parseFloat(burnRate.toFixed(2)),
      runway,
      categoryBreakdown: stats.categoryBreakdown.map(cat => ({
        categoryId: cat.category_id,
        categoryName: cat.category_name,
        categoryColor: cat.category_color,
        total: parseFloat(cat.total),
      })),
      dailyTrend: stats.dailyTrend.map(day => ({
        date: day.date,
        amount: parseFloat(day.amount),
      })),
      period,
      dateFrom,
      dateTo,
    };
  }

  /**
   * Get all unique tags for a user
   */
  static async getTags(userId) {
    const tags = await Expense.getTags(userId);
    return tags;
  }

  /**
   * Get recent vendor names for autocomplete
   */
  static async getVendors(userId, limit = 10) {
    const vendors = await Expense.getRecentVendors(userId, limit);
    return vendors;
  }

  /**
   * Log action to audit_logs table
   */
  static async logAuditAction(userId, action, entityType, entityId, changes = {}) {
    try {
      await query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, action, entityType, entityId, JSON.stringify(changes)]
      );
    } catch (error) {
      logger.error('Error logging audit action:', error);
      // Don't throw - audit logging shouldn't break the main flow
    }
  }

  /**
   * Parse period string into date range
   */
  static parsePeriod(period) {
    const dateTo = new Date();
    dateTo.setHours(23, 59, 59, 999);

    let dateFrom = new Date();

    switch (period) {
      case '7d':
        dateFrom.setDate(dateTo.getDate() - 7);
        break;
      case '30d':
        dateFrom.setDate(dateTo.getDate() - 30);
        break;
      case '90d':
        dateFrom.setDate(dateTo.getDate() - 90);
        break;
      case '1y':
        dateFrom.setFullYear(dateTo.getFullYear() - 1);
        break;
      default:
        dateFrom.setDate(dateTo.getDate() - 30); // Default to 30 days
    }

    dateFrom.setHours(0, 0, 0, 0);

    return { dateFrom, dateTo };
  }
}

module.exports = ExpenseService;
