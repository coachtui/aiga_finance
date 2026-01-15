import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '../services/clientApi';
import { toast } from 'react-toastify';

export function useClients(filters = {}) {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: () => clientApi.getClients(filters),
    select: (response) => response.data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useClient(id) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientApi.getClient(id),
    select: (response) => response.data.data.client,
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clientApi.createClient,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success(response.data.message || 'Client created successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create client';
      toast.error(message);
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => clientApi.updateClient(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success(response.data.message || 'Client updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update client';
      toast.error(message);
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clientApi.deleteClient,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success(response.data.message || 'Client deleted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete client';
      toast.error(message);
    },
  });
}

export function useClientContracts(clientId) {
  return useQuery({
    queryKey: ['clients', clientId, 'contracts'],
    queryFn: () => clientApi.getClientContracts(clientId),
    select: (response) => response.data.data.contracts,
    enabled: !!clientId,
  });
}

export function useClientSubscriptions(clientId) {
  return useQuery({
    queryKey: ['clients', clientId, 'subscriptions'],
    queryFn: () => clientApi.getClientSubscriptions(clientId),
    select: (response) => response.data.data.subscriptions,
    enabled: !!clientId,
  });
}

export function useClientInvoices(clientId) {
  return useQuery({
    queryKey: ['clients', clientId, 'invoices'],
    queryFn: () => clientApi.getClientInvoices(clientId),
    select: (response) => response.data.data.invoices,
    enabled: !!clientId,
  });
}

export function useClientRevenue(clientId) {
  return useQuery({
    queryKey: ['clients', clientId, 'revenue'],
    queryFn: () => clientApi.getClientRevenue(clientId),
    select: (response) => response.data.data,
    enabled: !!clientId,
  });
}
