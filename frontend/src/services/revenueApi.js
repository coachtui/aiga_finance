import api from './api';

export const revenueApi = {
  // Get dashboard statistics
  getDashboard: (period = '30d') => {
    return api.get('/revenue/dashboard', { params: { period } });
  },

  // Get revenue trends over time
  getTrends: (period = '90d') => {
    return api.get('/revenue/trends', { params: { period } });
  },

  // Get revenue breakdown by category
  getByCategory: (dateFrom, dateTo) => {
    return api.get('/revenue/by-category', {
      params: { dateFrom, dateTo },
    });
  },

  // Get revenue breakdown by client
  getByClient: (dateFrom, dateTo) => {
    return api.get('/revenue/by-client', {
      params: { dateFrom, dateTo },
    });
  },

  // Get monthly recurring revenue (MRR)
  getMRR: () => {
    return api.get('/revenue/mrr');
  },

  // Get annual recurring revenue (ARR)
  getARR: () => {
    return api.get('/revenue/arr');
  },

  // Get outstanding receivables / AR aging
  getReceivables: () => {
    return api.get('/revenue/receivables');
  },

  // Get cash flow analysis
  getCashFlow: (period = '90d') => {
    return api.get('/revenue/cash-flow', { params: { period } });
  },

  // Get revenue vs expenses (P&L)
  getVsExpenses: (period = '30d') => {
    return api.get('/revenue/vs-expenses', { params: { period } });
  },
};
