import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

export default function PaymentForm({ balanceDue, onSubmit, isSubmitting, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      amount: balanceDue,
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: 'credit_card',
    },
  });

  const amount = watch('amount');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Amount *
        </label>
        <input
          type="number"
          step="0.01"
          className="input"
          placeholder="0.00"
          {...register('amount', {
            required: 'Amount is required',
            min: { value: 0.01, message: 'Amount must be positive' },
            max: { value: balanceDue, message: `Amount cannot exceed balance due ($${balanceDue.toFixed(2)})` },
            valueAsNumber: true,
          })}
        />
        {errors.amount && (
          <p className="text-red-600 text-sm mt-1">{errors.amount.message}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Balance Due: ${balanceDue.toFixed(2)}
          {amount && (
            <>
              {' → '}
              <span className="font-medium">
                Remaining: ${Math.max(0, balanceDue - parseFloat(amount)).toFixed(2)}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Payment Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Date *
        </label>
        <input
          type="date"
          className="input"
          {...register('payment_date', {
            required: 'Payment date is required',
          })}
        />
        {errors.payment_date && (
          <p className="text-red-600 text-sm mt-1">{errors.payment_date.message}</p>
        )}
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Method
        </label>
        <select className="input" {...register('paymentMethod')}>
          <option value="credit_card">Credit Card</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="check">Check</option>
          <option value="cash">Cash</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Reference Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reference Number
        </label>
        <input
          type="text"
          className="input"
          placeholder="e.g., Check #, Transaction ID"
          {...register('reference_number')}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          className="input"
          rows="2"
          placeholder="Payment notes (optional)"
          {...register('notes')}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="btn btn-primary flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Recording...' : 'Record Payment'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary flex-1"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
