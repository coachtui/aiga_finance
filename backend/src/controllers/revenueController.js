const RevenueAnalyticsService = require('../services/revenueAnalyticsService');
const logger = require('../utils/logger');

class RevenueController {
  /**
   * Get revenue dashboard statistics
   * GET /revenue/dashboard
   */
  static async getDashboard(req, res) {
    try {
      const userId = req.user.id;
      const { period = '30d' } = req.query;

      const stats = await RevenueAnalyticsService.getDashboardStats(userId, period);

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      logger.error('Get revenue dashboard error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch revenue dashboard',
      });
    }
  }

  /**
   * Get revenue trends over time
   * GET /revenue/trends
   */
  static async getTrends(req, res) {
    try {
      const userId = req.user.id;
      const { dateFrom = this.get30DaysAgo(), dateTo = this.getToday() } = req.query;

      const trends = await RevenueAnalyticsService.getRevenueTrends(userId, dateFrom, dateTo);

      res.json({
        success: true,
        data: { trends },
      });
    } catch (error) {
      logger.error('Get revenue trends error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch revenue trends',
      });
    }
  }

  /**
   * Get revenue by category
   * GET /revenue/by-category
   */
  static async getByCategory(req, res) {
    try {
      const userId = req.user.id;
      const { dateFrom = this.get30DaysAgo(), dateTo = this.getToday() } = req.query;

      const categories = await RevenueAnalyticsService.getRevenueByCategory(userId, dateFrom, dateTo);

      res.json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      logger.error('Get revenue by category error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch revenue by category',
      });
    }
  }

  /**
   * Get revenue by client
   * GET /revenue/by-client
   */
  static async getByClient(req, res) {
    try {
      const userId = req.user.id;
      const { dateFrom = this.get30DaysAgo(), dateTo = this.getToday() } = req.query;

      const clients = await RevenueAnalyticsService.getRevenueByClient(userId, dateFrom, dateTo);

      res.json({
        success: true,
        data: { clients },
      });
    } catch (error) {
      logger.error('Get revenue by client error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch revenue by client',
      });
    }
  }

  /**
   * Get Monthly Recurring Revenue (MRR)
   * GET /revenue/mrr
   */
  static async getMRR(req, res) {
    try {
      const userId = req.user.id;

      const mrrData = await RevenueAnalyticsService.getMonthlyRecurringRevenue(userId);

      res.json({
        success: true,
        data: mrrData,
      });
    } catch (error) {
      logger.error('Get MRR error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch MRR',
      });
    }
  }

  /**
   * Get Annual Recurring Revenue (ARR)
   * GET /revenue/arr
   */
  static async getARR(req, res) {
    try {
      const userId = req.user.id;

      const arrData = await RevenueAnalyticsService.getAnnualRecurringRevenue(userId);

      res.json({
        success: true,
        data: arrData,
      });
    } catch (error) {
      logger.error('Get ARR error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch ARR',
      });
    }
  }

  /**
   * Get outstanding receivables (AR aging)
   * GET /revenue/receivables
   */
  static async getReceivables(req, res) {
    try {
      const userId = req.user.id;

      const receivables = await RevenueAnalyticsService.getOutstandingReceivables(userId);

      res.json({
        success: true,
        data: { receivables },
      });
    } catch (error) {
      logger.error('Get receivables error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch outstanding receivables',
      });
    }
  }

  /**
   * Get cash flow analysis
   * GET /revenue/cash-flow
   */
  static async getCashFlow(req, res) {
    try {
      const userId = req.user.id;
      const { period = '30d' } = req.query;

      const cashFlow = await RevenueAnalyticsService.getCashFlow(userId, period);

      res.json({
        success: true,
        data: { cashFlow },
      });
    } catch (error) {
      logger.error('Get cash flow error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch cash flow analysis',
      });
    }
  }

  /**
   * Get revenue vs expenses (P&L)
   * GET /revenue/vs-expenses
   */
  static async getVsExpenses(req, res) {
    try {
      const userId = req.user.id;
      const { period = '30d' } = req.query;

      const pnl = await RevenueAnalyticsService.getRevenueVsExpenses(userId, period);

      res.json({
        success: true,
        data: pnl,
      });
    } catch (error) {
      logger.error('Get revenue vs expenses error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch revenue vs expenses',
      });
    }
  }

  /**
   * Helper: Get 30 days ago date
   */
  static get30DaysAgo() {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }

  /**
   * Helper: Get today's date
   */
  static getToday() {
    return new Date().toISOString().split('T')[0];
  }
}

module.exports = RevenueController;
