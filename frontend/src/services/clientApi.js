import api from './api';

export const clientApi = {
  // Get all clients with filters
  getClients: (params = {}) => {
    return api.get('/clients', { params });
  },

  // Get single client
  getClient: (id) => {
    return api.get(`/clients/${id}`);
  },

  // Create client
  createClient: (data) => {
    return api.post('/clients', data);
  },

  // Update client
  updateClient: (id, data) => {
    return api.put(`/clients/${id}`, data);
  },

  // Delete client
  deleteClient: (id) => {
    return api.delete(`/clients/${id}`);
  },

  // Get client contracts
  getClientContracts: (id) => {
    return api.get(`/clients/${id}/contracts`);
  },

  // Get client subscriptions
  getClientSubscriptions: (id) => {
    return api.get(`/clients/${id}/subscriptions`);
  },

  // Get client invoices
  getClientInvoices: (id) => {
    return api.get(`/clients/${id}/invoices`);
  },

  // Get client revenue statistics
  getClientRevenue: (id) => {
    return api.get(`/clients/${id}/revenue`);
  },
};
