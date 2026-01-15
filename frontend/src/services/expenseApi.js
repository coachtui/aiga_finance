import api from './api';

export const expenseApi = {
  // Get all expenses with filters
  getExpenses: (params = {}) => {
    return api.get('/expenses', { params });
  },

  // Get single expense
  getExpense: (id) => {
    return api.get(`/expenses/${id}`);
  },

  // Create expense
  createExpense: (data) => {
    return api.post('/expenses', data);
  },

  // Update expense
  updateExpense: (id, data) => {
    return api.put(`/expenses/${id}`, data);
  },

  // Delete expense
  deleteExpense: (id) => {
    return api.delete(`/expenses/${id}`);
  },

  // Get statistics
  getStats: (period = '30d') => {
    return api.get('/expenses/stats', { params: { period } });
  },

  // Get all tags
  getTags: () => {
    return api.get('/expenses/tags');
  },

  // Get vendors for autocomplete
  getVendors: () => {
    return api.get('/expenses/vendors');
  },
};
