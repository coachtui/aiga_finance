import api from './api';

export const bulkImportApi = {
  // Upload files and extract invoice data
  uploadAndExtract: (files, options = {}) => {
    const formData = new FormData();

    // Add files to FormData
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    // Add options as JSON string
    if (Object.keys(options).length > 0) {
      formData.append('options', JSON.stringify(options));
    }

    return api.post('/expenses/bulk-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get session data for review
  getSessionData: (sessionId) => {
    return api.get(`/expenses/bulk-import/${sessionId}`);
  },

  // Confirm import and create expenses
  confirmImport: (sessionId, expenses) => {
    return api.post('/expenses/bulk-confirm', {
      sessionId,
      expenses,
    });
  },
};
