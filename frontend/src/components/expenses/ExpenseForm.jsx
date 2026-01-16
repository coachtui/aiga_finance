import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { format } from 'date-fns';

export default function ExpenseForm({ expense, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      transactionDate: format(new Date(), 'yyyy-MM-dd'),
      currency: 'USD',
      exchangeRate: 1.0,
      isTaxDeductible: true,
      isReimbursable: false,
      isBillable: false,
      status: 'pending',
      tags: '',
    },
  });

  const { data: categories } = useCategories('expense');
  const { data: paymentMethods, isLoading: loadingPaymentMethods, error: paymentMethodsError } = usePaymentMethods();

  // Debug payment methods
  useEffect(() => {
    console.log('Payment Methods Debug:', {
      paymentMethods,
      isLoading: loadingPaymentMethods,
      error: paymentMethodsError,
      count: paymentMethods?.length
    });
  }, [paymentMethods, loadingPaymentMethods, paymentMethodsError]);

  // Reset form with expense data when it loads
  useEffect(() => {
    if (expense) {
      reset({
        ...expense,
        tags: expense.tags?.join(', ') || '',
      });
    }
  }, [expense, reset]);

  const handleFormSubmit = (data) => {
    // Process tags: convert comma-separated string to array
    if (data.tags) {
      data.tags = data.tags
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0);
    } else {
      data.tags = [];
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount *
        </label>
        <input
          type="number"
          step="0.01"
          className="input"
          placeholder="0.00"
          {...register('amount', {
            required: 'Amount is required',
            min: { value: 0.01, message: 'Amount must be positive' },
            valueAsNumber: true,
          })}
        />
        {errors.amount && (
          <p className="text-red-600 text-sm mt-1">{errors.amount.message}</p>
        )}
      </div>

      {/* Transaction Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date *
        </label>
        <input
          type="date"
          className="input"
          max={format(new Date(), 'yyyy-MM-dd')}
          {...register('transactionDate', {
            required: 'Date is required',
          })}
        />
        {errors.transactionDate && (
          <p className="text-red-600 text-sm mt-1">
            {errors.transactionDate.message}
          </p>
        )}
      </div>

      {/* Vendor Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vendor/Merchant
        </label>
        <input
          type="text"
          className="input"
          placeholder="e.g., AWS, Office Depot"
          {...register('vendorName')}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select className="input" {...register('categoryId')}>
          <option value="">Select category...</option>
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
        <select className="input" {...register('paymentMethodId')}>
          <option value="">Select payment method...</option>
          {loadingPaymentMethods && <option disabled>Loading...</option>}
          {paymentMethodsError && <option disabled>Error loading payment methods</option>}
          {paymentMethods?.map((pm) => (
            <option key={pm.id} value={pm.id}>
              {pm.name} ({pm.type.replace('_', ' ')})
            </option>
          ))}
        </select>
        {paymentMethodsError && (
          <p className="text-red-600 text-sm mt-1">
            Failed to load payment methods. Check console for details.
          </p>
        )}
        {!loadingPaymentMethods && !paymentMethodsError && paymentMethods?.length === 0 && (
          <p className="text-yellow-600 text-sm mt-1">
            No payment methods available. Please add one in settings.
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          className="input"
          rows="3"
          placeholder="Brief description of the expense"
          {...register('description')}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <input
          type="text"
          className="input"
          placeholder="Comma-separated: infrastructure, urgent, client-work"
          {...register('tags')}
        />
        <p className="text-sm text-gray-500 mt-1">
          Use tags for better organization and filtering
        </p>
      </div>

      {/* Checkboxes */}
      <div className="space-y-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="mr-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            {...register('isTaxDeductible')}
          />
          <span className="text-sm text-gray-700">Tax Deductible</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            className="mr-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            {...register('isReimbursable')}
          />
          <span className="text-sm text-gray-700">Reimbursable</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            className="mr-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            {...register('isBillable')}
          />
          <span className="text-sm text-gray-700">Billable to Client</span>
        </label>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          className="input"
          rows="3"
          placeholder="Additional notes or context"
          {...register('notes')}
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Saving...'
            : expense
            ? 'Update Expense'
            : 'Create Expense'}
        </button>
      </div>
    </form>
  );
}
