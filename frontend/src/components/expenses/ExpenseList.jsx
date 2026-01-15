import { useState } from 'react';
import { useExpenses, useDeleteExpense } from '../../hooks/useExpenses';
import ExpenseCard from './ExpenseCard';
import ExpenseFilters from './ExpenseFilters';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';

export default function ExpenseList() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sortBy: 'transaction_date',
    sortOrder: 'desc',
  });

  const { data, isLoading, error } = useExpenses(filters);
  const deleteExpense = useDeleteExpense();

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense.mutateAsync(id);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <p className="text-red-600">Error loading expenses. Please try again.</p>
      </div>
    );
  }

  const expenses = data?.expenses || [];
  const pagination = data?.pagination;

  return (
    <div>
      <ExpenseFilters filters={filters} onChange={handleFilterChange} />

      {expenses.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">No expenses found. Create your first expense to get started!</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          )}
        </>
      )}
    </div>
  );
}
