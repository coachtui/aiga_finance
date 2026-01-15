import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractApi } from '../services/contractApi';
import { toast } from 'react-toastify';

export function useContracts(filters = {}) {
  return useQuery({
    queryKey: ['contracts', filters],
    queryFn: () => contractApi.getContracts(filters),
    select: (response) => response.data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useContract(id) {
  return useQuery({
    queryKey: ['contracts', id],
    queryFn: () => contractApi.getContract(id),
    select: (response) => response.data.data.contract,
    enabled: !!id,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contractApi.createContract,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contracts', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success(response.data.message || 'Contract created successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create contract';
      toast.error(message);
    },
  });
}

export function useUpdateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => contractApi.updateContract(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contracts', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['contracts', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success(response.data.message || 'Contract updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update contract';
      toast.error(message);
    },
  });
}

export function useDeleteContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contractApi.deleteContract,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contracts', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success(response.data.message || 'Contract deleted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete contract';
      toast.error(message);
    },
  });
}

export function useContractStats() {
  return useQuery({
    queryKey: ['contracts', 'stats'],
    queryFn: () => contractApi.getStats(),
    select: (response) => response.data.data.stats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useExpiringContracts(daysAhead = 30) {
  return useQuery({
    queryKey: ['contracts', 'expiring', daysAhead],
    queryFn: () => contractApi.getExpiring(daysAhead),
    select: (response) => response.data.data.contracts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSignContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contractApi.signContract,
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts', variables] });
      queryClient.invalidateQueries({ queryKey: ['contracts', 'stats'] });
      toast.success(response.data.message || 'Contract signed successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to sign contract';
      toast.error(message);
    },
  });
}

export function useActivateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contractApi.activateContract,
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts', variables] });
      queryClient.invalidateQueries({ queryKey: ['contracts', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success(response.data.message || 'Contract activated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to activate contract';
      toast.error(message);
    },
  });
}

export function useCompleteContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contractApi.completeContract,
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts', variables] });
      queryClient.invalidateQueries({ queryKey: ['contracts', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success(response.data.message || 'Contract completed successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to complete contract';
      toast.error(message);
    },
  });
}

export function useCancelContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contractApi.cancelContract,
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts', variables] });
      queryClient.invalidateQueries({ queryKey: ['contracts', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success(response.data.message || 'Contract cancelled successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to cancel contract';
      toast.error(message);
    },
  });
}
