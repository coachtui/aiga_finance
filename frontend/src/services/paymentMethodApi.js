import api from './api';

export const paymentMethodApi = {
  // Get all payment methods
  getPaymentMethods: () => {
    return api.get('/payment-methods');
  },

  // Create payment method
  createPaymentMethod: (data) => {
    return api.post('/payment-methods', data);
  },

  // Update payment method
  updatePaymentMethod: (id, data) => {
    return api.put(`/payment-methods/${id}`, data);
  },

  // Delete payment method
  deletePaymentMethod: (id) => {
    return api.delete(`/payment-methods/${id}`);
  },
};
