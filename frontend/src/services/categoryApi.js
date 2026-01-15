import api from './api';

export const categoryApi = {
  // Get all categories
  getCategories: (type = 'all') => {
    const params = type !== 'all' ? { type } : {};
    return api.get('/categories', { params });
  },

  // Get single category
  getCategory: (id) => {
    return api.get(`/categories/${id}`);
  },
};
