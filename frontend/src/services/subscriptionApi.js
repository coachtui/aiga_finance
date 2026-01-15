import api from './api';

export const subscriptionApi = {
  // Get all subscriptions with filters
  getSubscriptions: (params = {}) => {
    return api.get('/subscriptions', { params });
  },

  // Get single subscription
  getSubscription: (id) => {
    return api.get(`/subscriptions/${id}`);
  },

  // Create subscription
  createSubscription: (data) => {
    return api.post('/subscriptions', data);
  },

  // Update subscription
  updateSubscription: (id, data) => {
    return api.put(`/subscriptions/${id}`, data);
  },

  // Delete subscription
  deleteSubscription: (id) => {
    return api.delete(`/subscriptions/${id}`);
  },

  // Get subscription statistics (MRR, ARR, churn)
  getStats: () => {
    return api.get('/subscriptions/stats');
  },

  // Get monthly recurring revenue (MRR)
  getMRR: () => {
    return api.get('/subscriptions/mrr');
  },

  // Get upcoming renewals
  getRenewals: (daysAhead = 30) => {
    return api.get('/subscriptions/renewals', { params: { daysAhead } });
  },

  // Cancel subscription
  cancelSubscription: (id, reason) => {
    return api.post(`/subscriptions/${id}/cancel`, { reason });
  },

  // Pause subscription
  pauseSubscription: (id) => {
    return api.post(`/subscriptions/${id}/pause`);
  },

  // Resume subscription
  resumeSubscription: (id) => {
    return api.post(`/subscriptions/${id}/resume`);
  },
};
