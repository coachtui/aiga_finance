import { useState } from 'react';
import { useInvoices, useDeleteInvoice } from '../../hooks/useInvoices';
import InvoiceCard from './InvoiceCard';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';

export default function InvoiceList() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const { data, isLoading, error } = useInvoices(filters);
  const deleteInvoice = useDeleteInvoice();

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      await deleteInvoice.mutateAsync(id);
    }
  };

  const handleStatusFilter = (status) => {
    handleFilterChange({ status: status || undefined });
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <p className="text-red-600">Error loading invoices. Please try again.</p>
      </div>
    );
  }

  const invoices = data?.invoices || [];
  const pagination = data?.pagination;

  return (
    <div>
      {/* Filters */}
      <div className="card mb-6">
        <select
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="input w-full sm:w-64"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="viewed">Viewed</option>
          <option value="partial">Partial Payment</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {invoices.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">No invoices found. Create your first invoice to get started!</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
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
