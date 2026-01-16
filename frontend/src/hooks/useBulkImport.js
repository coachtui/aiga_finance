import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkImportApi } from '../services/bulkImportApi';
import { toast } from 'react-toastify';

/**
 * Hook for uploading files and extracting invoice data
 */
export function useUploadAndExtract() {
  return useMutation({
    mutationFn: ({ files, options }) => bulkImportApi.uploadAndExtract(files, options),
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to process uploaded files';
      toast.error(message);
    },
  });
}

/**
 * Hook for retrieving session data
 */
export function useSessionData(sessionId) {
  return useQuery({
    queryKey: ['bulk-import-session', sessionId],
    queryFn: () => bulkImportApi.getSessionData(sessionId),
    select: (response) => response.data.data,
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook for confirming import and creating expenses
 */
export function useConfirmImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, expenses }) => bulkImportApi.confirmImport(sessionId, expenses),
    onSuccess: (response) => {
      // Invalidate expense-related queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['expense-tags'] });

      const { created, failed } = response.data.data;

      if (created > 0 && failed === 0) {
        toast.success(`Successfully created ${created} expense${created > 1 ? 's' : ''}`);
      } else if (created > 0 && failed > 0) {
        toast.warning(`Created ${created} expense${created > 1 ? 's' : ''}, but ${failed} failed`);
      } else if (failed > 0) {
        toast.error(`Failed to create ${failed} expense${failed > 1 ? 's' : ''}`);
      }
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create expenses';
      toast.error(message);
    },
  });
}
