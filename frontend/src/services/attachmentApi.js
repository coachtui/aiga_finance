import api from './api';

/**
 * Upload files to an entity
 */
export const uploadFiles = async (entityType, entityId, files) => {
  const formData = new FormData();

  formData.append('entityType', entityType);
  formData.append('entityId', entityId);

  // Append all files
  for (const file of files) {
    formData.append('files', file);
  }

  const response = await api.post('/attachments/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Get attachments for an entity
 */
export const getAttachments = async (entityType, entityId) => {
  const response = await api.get(`/attachments/${entityType}/${entityId}`);
  return response.data;
};

/**
 * Get download URL for an attachment
 */
export const getDownloadUrl = async (attachmentId) => {
  const response = await api.get(`/attachments/${attachmentId}/download`);
  return response.data;
};

/**
 * Delete an attachment
 */
export const deleteAttachment = async (attachmentId) => {
  const response = await api.delete(`/attachments/${attachmentId}`);
  return response.data;
};

/**
 * Get user storage usage
 */
export const getStorageUsage = async () => {
  const response = await api.get('/attachments/storage/usage');
  return response.data;
};
