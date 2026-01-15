const Invoice = require('../models/Invoice');
const Subscription = require('../models/Subscription');
const InvoiceItem = require('../models/InvoiceItem');
const Expense = require('../models/Expense');
const Payment = require('../models/Payment');
const logger = require('../utils/logger');

class RevenueAnalyticsService {
  /**
   * Get dashboard statistics for given period
   */
  static async getDashboardStats(userId, period = '30d') {
    try {
      const dateFrom = this.calculateDateFrom(period);
      const dateTo = new Date().toISOString().split('T')[0];

      const [mrr, arr, invoiceStats, outstandingBalance] = await Promise.all([
        Subscription.calculateMRR(userId),
        Subscription.calculateARR(userId),
        Invoice.getStatistics(userId, parseInt(period)),
        Invoice.getOutstandingBalance(userId),
      ]);

      return {
        period,
        dateFrom,
        dateTo,
        mrr: parseFloat(mrr),
        arr: parseFloat(arr),
        invoiceStats: invoiceStats || {},
        outstandingBalance: parseFloat(outstandingBalance),
      };
    } catch (error) {
      logger.error('Error in getDashboardStats:', error);
      throw error;
    }
  }

  /**
   * Get monthly recurring revenue
   */
  static async getMonthlyRecurringRevenue(userId) {
    try {
      const mrr = await Subscription.calculateMRR(userId);
      return {
        mrr: parseFloat(mrr),
      };
    } catch (error) {
      logger.error('Error in getMonthlyRecurringRevenue:', error);
      throw error;
    }
  }

  /**
   * Get annual recurring revenue
   */
  static async getAnnualRecurringRevenue(userId) {
    try {
      const arr = await Subscription.calculateARR(userId);
      return {
        arr: parseFloat(arr),
      };
    } catch (error) {
      logger.error('Error in getAnnualRecurringRevenue:', error);
      throw error;
    }
  }

  /**
   * Get revenue by category
   */
  static async getRevenueByCategory(userId, dateFrom, dateTo) {
    try {
      const categories = await InvoiceItem.getRevenueByCategory(userId, dateFrom, dateTo);
      return categories;
    } catch (error) {
      logger.error('Error in getRevenueByCategory:', error);
      throw error;
    }
  }

  /**
   * Get revenue by client
   */
  static async getRevenueByClient(userId, dateFrom, dateTo) {
    try {
      const { query } = require('../config/database');

      const result = await query(
        `SELECT
          c.id as client_id,
          c.company_name,
          COUNT(i.id) as invoice_count,
          COALESCE(SUM(i.total_amount), 0) as total_invoiced,
          COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END), 0) as total_paid
         FROM clients c
         LEFT JOIN invoices i ON c.id = i.client_id
           AND i.user_id = $1
           AND i.issue_date >= $2
           AND i.issue_date <= $3
           AND i.deleted_at IS NULL
         WHERE c.user_id = $1 AND c.deleted_at IS NULL
         GROUP BY c.id, c.company_name
         HAVING COUNT(i.id) > 0
         ORDER BY total_invoiced DESC`,
        [userId, dateFrom, dateTo]
      );

      return result.rows;
    } catch (error) {
      logger.error('Error in getRevenueByClient:', error);
      throw error;
    }
  }

  /**
   * Get revenue trends over time
   */
  static async getRevenueTrends(userId, dateFrom, dateTo) {
    try {
      const { query } = require('../config/database');

      const result = await query(
        `SELECT
          DATE_TRUNC('day', i.issue_date)::date as date,
          COUNT(i.id) as invoice_count,
          COALESCE(SUM(i.total_amount), 0) as total_amount
         FROM invoices i
         WHERE i.user_id = $1
           AND i.issue_date >= $2
           AND i.issue_date <= $3
           AND i.deleted_at IS NULL
         GROUP BY DATE_TRUNC('day', i.issue_date)
         ORDER BY date ASC`,
        [userId, dateFrom, dateTo]
      );

      return result.rows;
    } catch (error) {
      logger.error('Error in getRevenueTrends:', error);
      throw error;
    }
  }

  /**
   * Get outstanding receivables (AR aging)
   */
  static async getOutstandingReceivables(userId) {
    try {
      const { query } = require('../config/database');

      const result = await query(
        `SELECT
          c.id as client_id,
          c.company_name,
          i.id as invoice_id,
          i.invoice_number,
          i.issue_date,
          i.due_date,
          i.total_amount,
          i.balance_due,
          i.status,
          EXTRACT(DAY FROM (CURRENT_DATE - i.due_date))::int as days_overdue
         FROM invoices i
         LEFT JOIN clients c ON i.client_id = c.id
         WHERE i.user_id = $1
           AND i.status IN ('sent', 'partial', 'overdue')
           AND i.deleted_at IS NULL
         ORDER BY i.due_date ASC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      logger.error('Error in getOutstandingReceivables:', error);
      throw error;
    }
  }

  /**
   * Get revenue vs expenses (P&L)
   */
  static async getRevenueVsExpenses(userId, period = '30d') {
    try {
      const dateFrom = this.calculateDateFrom(period);
      const dateTo = new Date().toISOString().split('T')[0];

      const [revenue, expenses] = await Promise.all([
        Invoice.getRevenueByPeriod(userId, dateFrom, dateTo),
        Expense.getStatistics(userId, dateFrom, dateTo),
      ]);

      const totalRevenue = parseFloat(revenue?.total_billed || 0);
      const totalExpenses = parseFloat(expenses?.total_amount || 0);
      const netIncome = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

      return {
        period,
        dateFrom,
        dateTo,
        totalRevenue,
        totalExpenses,
        netIncome,
        profitMargin: parseFloat(profitMargin.toFixed(2)),
      };
    } catch (error) {
      logger.error('Error in getRevenueVsExpenses:', error);
      throw error;
    }
  }

  /**
   * Get cash flow analysis
   */
  static async getCashFlow(userId, period = '30d') {
    try {
      const dateFrom = this.calculateDateFrom(period);
      const dateTo = new Date().toISOString().split('T')[0];

      const { query } = require('../config/database');

      const result = await query(
        `SELECT
          DATE_TRUNC('day', COALESCE(p.payment_date, e.transaction_date))::date as date,
          COALESCE(SUM(p.amount), 0) as cash_in,
          0 as cash_out
         FROM payments p
         LEFT JOIN invoices i ON p.invoice_id = i.id
         WHERE i.user_id = $1
           AND p.payment_date >= $2
           AND p.payment_date <= $3
         GROUP BY DATE_TRUNC('day', p.payment_date)
         UNION ALL
         SELECT
          DATE_TRUNC('day', e.transaction_date)::date as date,
          0 as cash_in,
          COALESCE(SUM(e.amount_usd), 0) as cash_out
         FROM expenses e
         WHERE e.user_id = $1
           AND e.transaction_date >= $2::date
           AND e.transaction_date <= $3::date
         GROUP BY DATE_TRUNC('day', e.transaction_date)
         ORDER BY date ASC`,
        [userId, dateFrom, dateTo]
      );

      return result.rows;
    } catch (error) {
      logger.error('Error in getCashFlow:', error);
      throw error;
    }
  }

  /**
   * Get MRR breakdown
   */
  static async getMRRBreakdown(userId) {
    try {
      const breakdown = await Subscription.getMRRBreakdown(userId);
      return breakdown;
    } catch (error) {
      logger.error('Error in getMRRBreakdown:', error);
      throw error;
    }
  }

  /**
   * Get churn analytics
   */
  static async getChurnAnalytics(userId, period = 30) {
    try {
      const churnData = await Subscription.getChurnRate(userId, period);
      return churnData;
    } catch (error) {
      logger.error('Error in getChurnAnalytics:', error);
      throw error;
    }
  }

  /**
   * Get days sales outstanding (DSO)
   */
  static async getDaysSalesOutstanding(userId, period = 90) {
    try {
      const dso = await Payment.getDaysSalesOutstanding(userId, period);
      return {
        dso: parseFloat(dso.toFixed(2)),
      };
    } catch (error) {
      logger.error('Error in getDaysSalesOutstanding:', error);
      throw error;
    }
  }

  /**
   * Helper: Calculate date from period string
   */
  static calculateDateFrom(period) {
    const daysMap = {
      '7d': 7,
      '30d': 30,
      '60d': 60,
      '90d': 90,
      '365d': 365,
      'ytd': this.getDaysInYear(),
    };

    const days = daysMap[period] || 30;
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Helper: Get days remaining in current year
   */
  static getDaysInYear() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const diff = now - startOfYear;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}

module.exports = RevenueAnalyticsService;
