import { useState } from 'react';

export default function ClientFilters({ filters, onChange }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onChange({ search: value });
  };

  const handleStatusChange = (status) => {
    onChange({ status: status || undefined });
  };

  const handleSortChange = (field) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    onChange({ sortBy: field, sortOrder: newOrder });
  };

  return (
    <div className="card mb-6 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search clients by name..."
            value={searchTerm}
            onChange={handleSearch}
            className="input"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filters.status || ''}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="input"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="prospect">Prospect</option>
            <option value="churned">Churned</option>
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
            <option value="company_name">
              Name {filters.sortBy === 'company_name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}
