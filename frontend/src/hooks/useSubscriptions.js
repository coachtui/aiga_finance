import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '../services/subscriptionApi';
import { toast } from 'react-toastify';

export function useSubscriptions(filters = {}) {
  return useQuery({
    queryKey: ['subscriptions', filters],
    queryFn: () => subscriptionApi.getSubscriptions(filters),
    select: (response) => response.data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSubscription(id) {
  return useQuery({
    queryKey: ['subscriptions', id],
    queryFn: () => subscriptionApi.getSubscription(id),
    select: (response) => response.data.data.subscription,
    enabled: !!id,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscriptionApi.createSubscription,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'mrr'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success(response.data.message || 'Subscription created successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create subscription';
      toast.error(message);
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => subscriptionApi.updateSubscription(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'mrr'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success(response.data.message || 'Subscription updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update subscription';
      toast.error(message);
    },
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscriptionApi.deleteSubscription,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'mrr'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success(response.data.message || 'Subscription deleted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete subscription';
      toast.error(message);
    },
  });
}

export function useSubscriptionStats() {
  return useQuery({
    queryKey: ['subscriptions', 'stats'],
    queryFn: () => subscriptionApi.getStats(),
    select: (response) => response.data.data.stats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useMRR() {
  return useQuery({
    queryKey: ['subscriptions', 'mrr'],
    queryFn: () => subscriptionApi.getMRR(),
    select: (response) => response.data.data.mrr,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpcomingRenewals(daysAhead = 30) {
  return useQuery({
    queryKey: ['subscriptions', 'renewals', daysAhead],
    queryFn: () => subscriptionApi.getRenewals(daysAhead),
    select: (response) => response.data.data.renewals,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => subscriptionApi.cancelSubscription(id, reason),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'mrr'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success(response.data.message || 'Subscription cancelled successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to cancel subscription';
      toast.error(message);
    },
  });
}

export function usePauseSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscriptionApi.pauseSubscription,
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', variables] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'mrr'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success(response.data.message || 'Subscription paused successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to pause subscription';
      toast.error(message);
    },
  });
}

export function useResumeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscriptionApi.resumeSubscription,
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', variables] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'mrr'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success(response.data.message || 'Subscription resumed successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to resume subscription';
      toast.error(message);
    },
  });
}
