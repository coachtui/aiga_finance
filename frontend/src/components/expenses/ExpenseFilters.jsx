import { useState } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { useExpenseTags } from '../../hooks/useExpenses';

export default function ExpenseFilters({ filters, onChange }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories } = useCategories('expense');
  const { data: paymentMethods } = usePaymentMethods();
  const { data: tags } = useExpenseTags();

  const handleChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleTagToggle = (tag) => {
    const currentTags = localFilters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    handleChange('tags', newTags);
  };

  const handleApply = () => {
    onChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      page: 1,
      limit: 20,
      sortBy: 'transaction_date',
      sortOrder: 'desc',
    };
    setLocalFilters(resetFilters);
    onChange(resetFilters);
  };

  const hasActiveFilters = () => {
    return (
      localFilters.search ||
      localFilters.categoryIds ||
      localFilters.paymentMethodIds ||
      localFilters.dateFrom ||
      localFilters.dateTo ||
      localFilters.amountMin ||
      localFilters.amountMax ||
      (localFilters.tags && localFilters.tags.length > 0)
    );
  };

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn-secondary text-sm"
        >
          {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {showFilters && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                className="input"
                placeholder="Description, vendor..."
                value={localFilters.search || ''}
                onChange={(e) => handleChange('search', e.target.value)}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                className="input"
                value={localFilters.categoryIds || ''}
                onChange={(e) => handleChange('categoryIds', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                className="input"
                value={localFilters.paymentMethodIds || ''}
                onChange={(e) =>
                  handleChange('paymentMethodIds', e.target.value)
                }
              >
                <option value="">All Methods</option>
                {paymentMethods?.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                className="input"
                value={localFilters.sortBy || 'transaction_date'}
                onChange={(e) => handleChange('sortBy', e.target.value)}
              >
                <option value="transaction_date">Date</option>
                <option value="amount">Amount</option>
                <option value="created_at">Created</option>
                <option value="vendor_name">Vendor</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                className="input"
                value={localFilters.dateFrom || ''}
                onChange={(e) => handleChange('dateFrom', e.target.value)}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                className="input"
                value={localFilters.dateTo || ''}
                onChange={(e) => handleChange('dateTo', e.target.value)}
              />
            </div>

            {/* Min Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Amount
              </label>
              <input
                type="number"
                step="0.01"
                className="input"
                placeholder="0.00"
                value={localFilters.amountMin || ''}
                onChange={(e) => handleChange('amountMin', e.target.value)}
              />
            </div>

            {/* Max Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Amount
              </label>
              <input
                type="number"
                step="0.01"
                className="input"
                placeholder="0.00"
                value={localFilters.amountMax || ''}
                onChange={(e) => handleChange('amountMax', e.target.value)}
              />
            </div>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      localFilters.tags?.includes(tag)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button onClick={handleApply} className="btn btn-primary">
              Apply Filters
            </button>
            {hasActiveFilters() && (
              <button onClick={handleReset} className="btn btn-secondary">
                Reset
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
