const ExpenseService = require('../services/expenseService');
const logger = require('../utils/logger');

class ExpenseController {
  /**
   * Create a new expense
   * POST /expenses
   */
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const expenseData = req.body;

      const expense = await ExpenseService.createExpense(userId, expenseData);

      res.status(201).json({
        success: true,
        data: { expense },
        message: 'Expense created successfully',
      });
    } catch (error) {
      logger.error('Create expense error:', error);

      if (error.message.includes('Invalid')) {
        return res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create expense',
      });
    }
  }

  /**
   * Get all expenses with filters and pagination
   * GET /expenses
   */
  static async list(req, res) {
    try {
      const userId = req.user.id;
      const { page, limit, sortBy, sortOrder, ...filters } = req.query;

      // Convert single values to arrays for filters that support multiple values
      if (filters.categoryIds && !Array.isArray(filters.categoryIds)) {
        filters.categoryIds = [filters.categoryIds];
      }
      if (filters.paymentMethodIds && !Array.isArray(filters.paymentMethodIds)) {
        filters.paymentMethodIds = [filters.paymentMethodIds];
      }
      if (filters.tags && !Array.isArray(filters.tags)) {
        filters.tags = [filters.tags];
      }

      const result = await ExpenseService.getExpenses(
        userId,
        { ...filters, sortBy, sortOrder },
        { page, limit }
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('List expenses error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch expenses',
      });
    }
  }

  /**
   * Get a single expense by ID
   * GET /expenses/:id
   */
  static async getById(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const expense = await ExpenseService.getExpenseById(userId, id);

      res.json({
        success: true,
        data: { expense },
      });
    } catch (error) {
      logger.error('Get expense error:', error);

      if (error.message === 'Expense not found') {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch expense',
      });
    }
  }

  /**
   * Update an expense
   * PUT /expenses/:id
   */
  static async update(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updateData = req.body;

      const expense = await ExpenseService.updateExpense(userId, id, updateData);

      res.json({
        success: true,
        data: { expense },
        message: 'Expense updated successfully',
      });
    } catch (error) {
      logger.error('Update expense error:', error);

      if (error.message.includes('not found') || error.message.includes('unauthorized')) {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }

      if (error.message.includes('Invalid')) {
        return res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update expense',
      });
    }
  }

  /**
   * Delete an expense
   * DELETE /expenses/:id
   */
  static async delete(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      await ExpenseService.deleteExpense(userId, id);

      res.json({
        success: true,
        message: 'Expense deleted successfully',
      });
    } catch (error) {
      logger.error('Delete expense error:', error);

      if (error.message.includes('not found') || error.message.includes('unauthorized')) {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete expense',
      });
    }
  }

  /**
   * Get expense statistics for dashboard
   * GET /expenses/stats
   */
  static async getStats(req, res) {
    try {
      const userId = req.user.id;
      const { period = '30d' } = req.query;

      const stats = await ExpenseService.getDashboardStats(userId, period);

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      logger.error('Get expense stats error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch expense statistics',
      });
    }
  }

  /**
   * Get all unique tags for the user
   * GET /expenses/tags
   */
  static async getTags(req, res) {
    try {
      const userId = req.user.id;

      const tags = await ExpenseService.getTags(userId);

      res.json({
        success: true,
        data: { tags },
      });
    } catch (error) {
      logger.error('Get tags error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch tags',
      });
    }
  }

  /**
   * Get recent vendor names for autocomplete
   * GET /expenses/vendors
   */
  static async getVendors(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10 } = req.query;

      const vendors = await ExpenseService.getVendors(userId, parseInt(limit, 10));

      res.json({
        success: true,
        data: { vendors },
      });
    } catch (error) {
      logger.error('Get vendors error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch vendors',
      });
    }
  }
}

module.exports = ExpenseController;
