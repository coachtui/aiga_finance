import { useState } from 'react';
import { useClients, useDeleteClient } from '../../hooks/useClients';
import ClientCard from './ClientCard';
import ClientFilters from './ClientFilters';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';

export default function ClientList() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const { data, isLoading, error } = useClients(filters);
  const deleteClient = useDeleteClient();

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client? All related contracts and invoices will remain.')) {
      await deleteClient.mutateAsync(id);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <p className="text-red-600">Error loading clients. Please try again.</p>
      </div>
    );
  }

  const clients = data?.clients || [];
  const pagination = data?.pagination;

  return (
    <div>
      <ClientFilters filters={filters} onChange={handleFilterChange} />

      {clients.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">No clients found. Create your first client to get started!</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
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
