import { useState } from 'react';
import { useSubscriptions, useDeleteSubscription } from '../../hooks/useSubscriptions';
import SubscriptionCard from './SubscriptionCard';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';

export default function SubscriptionList() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const { data, isLoading, error } = useSubscriptions(filters);
  const deleteSubscription = useDeleteSubscription();

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      await deleteSubscription.mutateAsync(id);
    }
  };

  const handleStatusFilter = (status) => {
    handleFilterChange({ status: status || undefined });
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <p className="text-red-600">Error loading subscriptions. Please try again.</p>
      </div>
    );
  }

  const subscriptions = data?.subscriptions || [];
  const pagination = data?.pagination;

  return (
    <div>
      {/* Filters */}
      <div className="card mb-6">
        <select
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="input w-full sm:w-48"
        >
          <option value="">All Statuses</option>
          <option value="trial">Trial</option>
          <option value="active">Active</option>
          <option value="past_due">Past Due</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {subscriptions.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">No subscriptions found. Create your first subscription to get started!</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
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
