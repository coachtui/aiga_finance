import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentMethodApi } from '../services/paymentMethodApi';
import { toast } from 'react-toastify';

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => paymentMethodApi.getPaymentMethods(),
    select: (response) => response.data.data.paymentMethods,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentMethodApi.createPaymentMethod,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success(response.data.message || 'Payment method added successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to add payment method';
      toast.error(message);
    },
  });
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => paymentMethodApi.updatePaymentMethod(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success(response.data.message || 'Payment method updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update payment method';
      toast.error(message);
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentMethodApi.deletePaymentMethod,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success(response.data.message || 'Payment method deleted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete payment method';
      toast.error(message);
    },
  });
}
