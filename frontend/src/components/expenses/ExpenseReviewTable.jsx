import { useState, useEffect } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';

export default function ExpenseReviewTable({ expenses, onUpdate }) {
  const [localExpenses, setLocalExpenses] = useState(expenses);
  const { data: categories = [], isLoading: loadingCategories } = useCategories('expense');
  const { data: paymentMethods = [], isLoading: loadingPaymentMethods } = usePaymentMethods();

  useEffect(() => {
    setLocalExpenses(expenses);
  }, [expenses]);

  const handleFieldChange = (index, field, value) => {
    const updated = [...localExpenses];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setLocalExpenses(updated);
    onUpdate(updated);
  };

  const toggleExclude = (index) => {
    const updated = [...localExpenses];
    updated[index] = {
      ...updated[index],
      exclude: !updated[index].exclude
    };
    setLocalExpenses(updated);
    onUpdate(updated);
  };

  const getConfidenceBadge = (confidence) => {
    const colors = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[confidence] || colors.medium}`}>
        {confidence || 'medium'}
      </span>
    );
  };

  const includedCount = localExpenses.filter(e => !e.exclude && !e.error).length;

  if (loadingCategories || loadingPaymentMethods) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-gray-900">
          {includedCount} of {localExpenses.length} expense{localExpenses.length > 1 ? 's' : ''} will be created
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Include
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                File
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Payment Method
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Confidence
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {localExpenses.map((expense, index) => (
              <tr
                key={expense.tempId}
                className={expense.exclude ? 'bg-gray-50 opacity-50' : expense.error ? 'bg-red-50' : ''}
              >
                {/* Include Checkbox */}
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={!expense.exclude && !expense.error}
                    disabled={expense.error}
                    onChange={() => toggleExclude(index)}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </td>

                {/* File Name */}
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900 truncate max-w-xs" title={expense.fileName}>
                    {expense.fileName}
                  </div>
                  {expense.error && (
                    <div className="text-xs text-red-600 mt-1">{expense.error}</div>
                  )}
                </td>

                {/* Vendor */}
                <td className="px-4 py-4">
                  <input
                    type="text"
                    value={expense.vendorName || ''}
                    onChange={(e) => handleFieldChange(index, 'vendorName', e.target.value)}
                    disabled={expense.exclude || expense.error}
                    className="input text-sm w-full disabled:bg-gray-100"
                    placeholder="Vendor name"
                  />
                </td>

                {/* Date */}
                <td className="px-4 py-4">
                  <input
                    type="date"
                    value={expense.transactionDate || ''}
                    onChange={(e) => handleFieldChange(index, 'transactionDate', e.target.value)}
                    disabled={expense.exclude || expense.error}
                    className="input text-sm w-full disabled:bg-gray-100"
                  />
                </td>

                {/* Amount */}
                <td className="px-4 py-4">
                  <input
                    type="number"
                    step="0.01"
                    value={expense.amount || ''}
                    onChange={(e) => handleFieldChange(index, 'amount', parseFloat(e.target.value))}
                    disabled={expense.exclude || expense.error}
                    className="input text-sm w-full disabled:bg-gray-100"
                    placeholder="0.00"
                  />
                </td>

                {/* Category */}
                <td className="px-4 py-4">
                  <select
                    value={expense.categoryId || ''}
                    onChange={(e) => handleFieldChange(index, 'categoryId', e.target.value)}
                    disabled={expense.exclude || expense.error}
                    className="input text-sm w-full disabled:bg-gray-100"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Payment Method */}
                <td className="px-4 py-4">
                  <select
                    value={expense.paymentMethodId || ''}
                    onChange={(e) => handleFieldChange(index, 'paymentMethodId', e.target.value)}
                    disabled={expense.exclude || expense.error}
                    className="input text-sm w-full disabled:bg-gray-100"
                  >
                    <option value="">Select payment method</option>
                    {paymentMethods.map((pm) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.name}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Confidence */}
                <td className="px-4 py-4">
                  {!expense.error && getConfidenceBadge(expense.confidence)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Description/Notes Section (Optional) */}
      <div className="mt-6">
        <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <summary className="text-sm font-semibold text-gray-900 cursor-pointer">
            View/Edit Descriptions & Notes
          </summary>
          <div className="mt-4 space-y-4">
            {localExpenses.map((expense, index) => (
              !expense.error && !expense.exclude && (
                <div key={expense.tempId} className="border-b border-gray-200 pb-4 last:border-0">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    {expense.vendorName || expense.fileName}
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={expense.description || ''}
                        onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                        className="input text-sm w-full"
                        placeholder="Expense description"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Notes {expense.lineItems && '(includes line items)'}
                      </label>
                      <textarea
                        value={expense.notes || expense.lineItems || ''}
                        onChange={(e) => handleFieldChange(index, 'notes', e.target.value)}
                        className="input text-sm w-full"
                        rows="2"
                        placeholder="Additional notes"
                      />
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
