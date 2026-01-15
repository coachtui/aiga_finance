import { useState } from 'react';
import { useContracts, useDeleteContract } from '../../hooks/useContracts';
import ContractCard from './ContractCard';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';

export default function ContractList() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const { data, isLoading, error } = useContracts(filters);
  const deleteContract = useDeleteContract();

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      await deleteContract.mutateAsync(id);
    }
  };

  const handleStatusFilter = (status) => {
    handleFilterChange({ status: status || undefined });
  };

  const handleSortChange = (field) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    handleFilterChange({ sortBy: field, sortOrder: newOrder });
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <p className="text-red-600">Error loading contracts. Please try again.</p>
      </div>
    );
  }

  const contracts = data?.contracts || [];
  const pagination = data?.pagination;

  return (
    <div>
      {/* Filters */}
      <div className="card mb-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Status Filter */}
          <div>
            <select
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="input"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending_signature">Pending Signature</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={filters.sortBy || 'created_at'}
              onChange={(e) => handleSortChange(e.target.value)}
              className="input"
            >
              <option value="created_at">
                Newest {filters.sortBy === 'created_at' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </option>
              <option value="title">
                Name {filters.sortBy === 'title' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </option>
              <option value="start_date">
                Start Date {filters.sortBy === 'start_date' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </option>
            </select>
          </div>
        </div>
      </div>

      {contracts.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">No contracts found. Create your first contract to get started!</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {contracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
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
