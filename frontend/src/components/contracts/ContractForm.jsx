import { useForm } from 'react-hook-form';
import { useClients } from '../../hooks/useClients';
import { format } from 'date-fns';

export default function ContractForm({ contract, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: contract || {
      status: 'draft',
      type: 'fixed',
      autoRenewal: false,
      startDate: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const { data: clients } = useClients({ limit: 1000 });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contract Title *
        </label>
        <input
          type="text"
          className="input"
          placeholder="e.g., Software Development Agreement"
          {...register('title', {
            required: 'Contract title is required',
          })}
        />
        {errors.title && (
          <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
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

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contract Type *
        </label>
        <select className="input" {...register('type')}>
          <option value="fixed">Fixed Price</option>
          <option value="retainer">Retainer</option>
          <option value="hourly">Hourly</option>
          <option value="milestone">Milestone-based</option>
        </select>
      </div>

      {/* Value */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contract Value
        </label>
        <input
          type="number"
          step="0.01"
          className="input"
          placeholder="0.00"
          {...register('value', {
            valueAsNumber: true,
          })}
        />
      </div>

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

      {/* End Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          End Date
        </label>
        <input type="date" className="input" {...register('endDate')} />
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

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          className="input"
          rows="4"
          placeholder="Contract details and terms"
          {...register('description')}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Internal Notes
        </label>
        <textarea
          className="input"
          rows="3"
          placeholder="Internal notes (not visible to client)"
          {...register('notes')}
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select className="input" {...register('status')}>
          <option value="draft">Draft</option>
          <option value="pending_signature">Pending Signature</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : contract ? 'Update Contract' : 'Create Contract'}
        </button>
      </div>
    </form>
  );
}
