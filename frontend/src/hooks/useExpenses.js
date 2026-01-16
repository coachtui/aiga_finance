import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseApi } from '../services/expenseApi';
import { toast } from 'react-toastify';

export function useExpenses(filters = {}) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => expenseApi.getExpenses(filters),
    select: (response) => response.data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useExpense(id) {
  return useQuery({
    queryKey: ['expenses', id],
    queryFn: () => expenseApi.getExpense(id),
    select: (response) => {
      const expense = response.data.data.expense;
      // Convert snake_case to camelCase for form compatibility
      return {
        ...expense,
        transactionDate: expense.transaction_date,
        vendorName: expense.vendor_name,
        categoryId: expense.category_id,
        paymentMethodId: expense.payment_method_id,
        isRecurring: expense.is_recurring,
        isReimbursable: expense.is_reimbursable,
        isBillable: expense.is_billable,
        isTaxDeductible: expense.tax_deductible,
        exchangeRate: expense.exchange_rate,
        recurrenceRule: expense.recurrence_rule,
      };
    },
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expenseApi.createExpense,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['expense-tags'] });
      toast.success(response.data.message || 'Expense created successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create expense';
      toast.error(message);
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => expenseApi.updateExpense(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['expense-tags'] });
      toast.success(response.data.message || 'Expense updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update expense';
      toast.error(message);
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expenseApi.deleteExpense,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success(response.data.message || 'Expense deleted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete expense';
      toast.error(message);
    },
  });
}

export function useExpenseStats(period = '30d') {
  return useQuery({
    queryKey: ['stats', period],
    queryFn: () => expenseApi.getStats(period),
    select: (response) => response.data.data.stats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useExpenseTags() {
  return useQuery({
    queryKey: ['expense-tags'],
    queryFn: () => expenseApi.getTags(),
    select: (response) => response.data.data.tags,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useExpenseVendors() {
  return useQuery({
    queryKey: ['expense-vendors'],
    queryFn: () => expenseApi.getVendors(),
    select: (response) => response.data.data.vendors,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
