import { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import AttachmentList from './AttachmentList';
import { uploadFiles, getAttachments } from '../../services/attachmentApi';

export default function AttachmentManager({ entityType, entityId, readOnly = false }) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    if (entityId) {
      loadAttachments();
    }
  }, [entityId]);

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const response = await getAttachments(entityType, entityId);
      setAttachments(response.data.attachments || []);
    } catch (error) {
      console.error('Error loading attachments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    if (!entityId) {
      alert('Cannot upload files - entity ID is required');
      return;
    }

    try {
      setUploading(true);
      await uploadFiles(entityType, entityId, selectedFiles);

      // Clear selected files and reload attachments
      setSelectedFiles([]);
      await loadAttachments();

      alert('Files uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (attachmentId) => {
    setAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
  };

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Upload Attachments</h3>
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            maxFiles={10}
            maxSize={10}
          />

          {selectedFiles.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleUpload}
                disabled={uploading || !entityId}
                className="btn btn-primary"
              >
                {uploading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  `Upload ${selectedFiles.length} file(s)`
                )}
              </button>
            </div>
          )}

          {!entityId && (
            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-3">
              Save the expense first to upload attachments
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Attachments {attachments.length > 0 && `(${attachments.length})`}
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <svg
              className="animate-spin mx-auto h-8 w-8 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="mt-2 text-gray-500">Loading attachments...</p>
          </div>
        ) : (
          <AttachmentList
            attachments={attachments}
            onDelete={handleDelete}
            readOnly={readOnly}
          />
        )}
      </div>
    </div>
  );
}
