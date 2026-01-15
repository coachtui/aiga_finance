import api from './api';

export const invoiceApi = {
  // Get all invoices with filters
  getInvoices: (params = {}) => {
    return api.get('/invoices', { params });
  },

  // Get single invoice
  getInvoice: (id) => {
    return api.get(`/invoices/${id}`);
  },

  // Create invoice
  createInvoice: (data) => {
    return api.post('/invoices', data);
  },

  // Update invoice
  updateInvoice: (id, data) => {
    return api.put(`/invoices/${id}`, data);
  },

  // Delete invoice
  deleteInvoice: (id) => {
    return api.delete(`/invoices/${id}`);
  },

  // Get invoice statistics
  getStats: () => {
    return api.get('/invoices/stats');
  },

  // Get overdue invoices
  getOverdue: () => {
    return api.get('/invoices/overdue');
  },

  // Get invoice PDF
  getPDF: (id) => {
    return api.get(`/invoices/${id}/pdf`);
  },

  // Send invoice via email
  sendInvoice: (id, emailOptions = {}) => {
    return api.post(`/invoices/${id}/send`, emailOptions);
  },

  // Record payment for invoice
  recordPayment: (id, paymentData) => {
    return api.post(`/invoices/${id}/payment`, paymentData);
  },

  // Send payment reminder
  sendReminder: (id) => {
    return api.post(`/invoices/${id}/reminder`);
  },

  // Update invoice status
  updateStatus: (id, status) => {
    return api.put(`/invoices/${id}/status`, { status });
  },

  // Get payment history for invoice
  getPayments: (id) => {
    return api.get(`/invoices/${id}/payments`);
  },
};
