import { useForm } from 'react-hook-form';
import { useClients } from '../../hooks/useClients';
import { useContracts } from '../../hooks/useContracts';
import { format } from 'date-fns';

export default function SubscriptionForm({ subscription, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: subscription || {
      billingCycle: 'monthly',
      status: 'active',
      startDate: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const { data: clients } = useClients({ limit: 1000 });
  const { data: contracts } = useContracts({ limit: 1000 });

  const billingCycle = watch('billingCycle');
  const amount = watch('amount');

  const calculateMRR = () => {
    if (!amount) return 0;
    const amt = parseFloat(amount);
    switch (billingCycle) {
      case 'monthly':
        return amt;
      case 'quarterly':
        return amt / 3;
      case 'annual':
        return amt / 12;
      default:
        return 0;
    }
  };

  const mrr = calculateMRR();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Subscription Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subscription Name *
        </label>
        <input
          type="text"
          className="input"
          placeholder="e.g., Monthly Software License"
          {...register('name', {
            required: 'Subscription name is required',
          })}
        />
        {errors.name && (
          <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Client */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Client *
        </label>
        <select
          className="input"
          {...register('clientId', {
            required: 'Client is required',
          })}
        >
          <option value="">Select a client...</option>
          {clients?.clients?.map((client) => (
            <option key={client.id} value={client.id}>
              {client.company_name}
            </option>
          ))}
        </select>
        {errors.clientId && (
          <p className="text-red-600 text-sm mt-1">{errors.clientId.message}</p>
        )}
      </div>

      {/* Contract (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Related Contract (Optional)
        </label>
        <select className="input" {...register('contractId')}>
          <option value="">None</option>
          {contracts?.contracts?.map((contract) => (
            <option key={contract.id} value={contract.id}>
              {contract.title}
            </option>
          ))}
        </select>
      </div>

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

      {/* Billing Cycle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Billing Cycle *
        </label>
        <select
          className="input"
          {...register('billingCycle', {
            required: 'Billing cycle is required',
          })}
        >
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="annual">Annual</option>
        </select>
        {errors.billingCycle && (
          <p className="text-red-600 text-sm mt-1">{errors.billingCycle.message}</p>
        )}
      </div>

      {/* MRR Display */}
      {amount && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Monthly Recurring Revenue (MRR):</span> ${mrr.toFixed(2)}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Annual: ${(mrr * 12).toFixed(2)}
          </p>
        </div>
      )}

      {/* Start Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Start Date *
        </label>
        <input
          type="date"
          className="input"
          {...register('startDate', {
            required: 'Start date is required',
          })}
        />
        {errors.startDate && (
          <p className="text-red-600 text-sm mt-1">{errors.startDate.message}</p>
        )}
      </div>

      {/* Auto Renewal */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            className="mr-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            {...register('autoRenewal')}
          />
          <span className="text-sm text-gray-700">Auto-renewal enabled</span>
        </label>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select className="input" {...register('status')}>
          <option value="trial">Trial</option>
          <option value="active">Active</option>
          <option value="past_due">Past Due</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          className="input"
          rows="3"
          placeholder="Subscription details and terms"
          {...register('description')}
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : subscription ? 'Update Subscription' : 'Create Subscription'}
        </button>
      </div>
    </form>
  );
}
