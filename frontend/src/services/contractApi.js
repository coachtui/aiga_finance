import api from './api';

export const contractApi = {
  // Get all contracts with filters
  getContracts: (params = {}) => {
    return api.get('/contracts', { params });
  },

  // Get single contract
  getContract: (id) => {
    return api.get(`/contracts/${id}`);
  },

  // Create contract
  createContract: (data) => {
    return api.post('/contracts', data);
  },

  // Update contract
  updateContract: (id, data) => {
    return api.put(`/contracts/${id}`, data);
  },

  // Delete contract
  deleteContract: (id) => {
    return api.delete(`/contracts/${id}`);
  },

  // Get contract statistics
  getStats: () => {
    return api.get('/contracts/stats');
  },

  // Get expiring contracts
  getExpiring: (daysAhead = 30) => {
    return api.get('/contracts/expiring', { params: { daysAhead } });
  },

  // Mark contract as signed
  signContract: (id) => {
    return api.post(`/contracts/${id}/sign`);
  },

  // Activate contract
  activateContract: (id) => {
    return api.post(`/contracts/${id}/activate`);
  },

  // Complete contract
  completeContract: (id) => {
    return api.post(`/contracts/${id}/complete`);
  },

  // Cancel contract
  cancelContract: (id) => {
    return api.post(`/contracts/${id}/cancel`);
  },
};
