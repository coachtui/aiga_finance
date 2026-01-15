import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceApi } from '../services/invoiceApi';
import { toast } from 'react-toastify';

export function useInvoices(filters = {}) {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => invoiceApi.getInvoices(filters),
    select: (response) => response.data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useInvoice(id) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoiceApi.getInvoice(id),
    select: (response) => response.data.data.invoice,
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoiceApi.createInvoice,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success(response.data.message || 'Invoice created successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create invoice';
      toast.error(message);
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => invoiceApi.updateInvoice(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success(response.data.message || 'Invoice updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update invoice';
      toast.error(message);
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoiceApi.deleteInvoice,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success(response.data.message || 'Invoice deleted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete invoice';
      toast.error(message);
    },
  });
}

export function useInvoiceStats() {
  return useQuery({
    queryKey: ['invoices', 'stats'],
    queryFn: () => invoiceApi.getStats(),
    select: (response) => response.data.data.stats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useOverdueInvoices() {
  return useQuery({
    queryKey: ['invoices', 'overdue'],
    queryFn: () => invoiceApi.getOverdue(),
    select: (response) => response.data.data.invoices,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useInvoicePDF(id) {
  return useQuery({
    queryKey: ['invoices', id, 'pdf'],
    queryFn: () => invoiceApi.getPDF(id),
    select: (response) => response.data.data.pdf,
    enabled: !!id,
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, emailOptions }) =>
      invoiceApi.sendInvoice(id, emailOptions),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'stats'] });
      toast.success(response.data.message || 'Invoice sent successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to send invoice';
      toast.error(message);
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paymentData }) =>
      invoiceApi.recordPayment(id, paymentData),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.id, 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success(response.data.message || 'Payment recorded successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to record payment';
      toast.error(message);
    },
  });
}

export function useSendReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoiceApi.sendReminder,
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', variables] });
      toast.success(response.data.message || 'Payment reminder sent successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to send reminder';
      toast.error(message);
    },
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => invoiceApi.updateStatus(id, status),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success(response.data.message || 'Invoice status updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update invoice status';
      toast.error(message);
    },
  });
}

export function useInvoicePayments(invoiceId) {
  return useQuery({
    queryKey: ['invoices', invoiceId, 'payments'],
    queryFn: () => invoiceApi.getPayments(invoiceId),
    select: (response) => response.data.data.payments,
    enabled: !!invoiceId,
  });
}
