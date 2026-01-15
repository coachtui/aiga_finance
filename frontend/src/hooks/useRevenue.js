import { useQuery } from '@tanstack/react-query';
import { revenueApi } from '../services/revenueApi';

export function useRevenueDashboard(period = '30d') {
  return useQuery({
    queryKey: ['revenue', 'dashboard', period],
    queryFn: () => revenueApi.getDashboard(period),
    select: (response) => response.data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRevenueTrends(period = '90d') {
  return useQuery({
    queryKey: ['revenue', 'trends', period],
    queryFn: () => revenueApi.getTrends(period),
    select: (response) => response.data.data.trends,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRevenueByCategory(dateFrom, dateTo) {
  return useQuery({
    queryKey: ['revenue', 'by-category', dateFrom, dateTo],
    queryFn: () => revenueApi.getByCategory(dateFrom, dateTo),
    select: (response) => response.data.data.breakdown,
    enabled: !!dateFrom && !!dateTo,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRevenueByClient(dateFrom, dateTo) {
  return useQuery({
    queryKey: ['revenue', 'by-client', dateFrom, dateTo],
    queryFn: () => revenueApi.getByClient(dateFrom, dateTo),
    select: (response) => response.data.data.breakdown,
    enabled: !!dateFrom && !!dateTo,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useMRR() {
  return useQuery({
    queryKey: ['revenue', 'mrr'],
    queryFn: () => revenueApi.getMRR(),
    select: (response) => response.data.data.mrr,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useARR() {
  return useQuery({
    queryKey: ['revenue', 'arr'],
    queryFn: () => revenueApi.getARR(),
    select: (response) => response.data.data.arr,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useReceivables() {
  return useQuery({
    queryKey: ['revenue', 'receivables'],
    queryFn: () => revenueApi.getReceivables(),
    select: (response) => response.data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCashFlow(period = '90d') {
  return useQuery({
    queryKey: ['revenue', 'cash-flow', period],
    queryFn: () => revenueApi.getCashFlow(period),
    select: (response) => response.data.data.cashFlow,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRevenueVsExpenses(period = '30d') {
  return useQuery({
    queryKey: ['revenue', 'vs-expenses', period],
    queryFn: () => revenueApi.getVsExpenses(period),
    select: (response) => response.data.data.pl,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
