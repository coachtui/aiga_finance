import { useForm } from 'react-hook-form';
import { useClients } from '../../hooks/useClients';
import { format } from 'date-fns';
import InvoiceItemsTable from './InvoiceItemsTable';

export default function InvoiceForm({ invoice, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: invoice || {
      status: 'draft',
      tax_rate: 0,
      discount_amount: 0,
      issue_date: format(new Date(), 'yyyy-MM-dd'),
      items: [{ description: '', quantity: 1, unit_price: 0 }],
    },
  });

  const { data: clients } = useClients({ limit: 1000 });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Invoice Number (Auto-generated) */}
      {invoice && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Invoice Number
          </label>
          <input
            type="text"
            disabled
            className="input bg-gray-100"
            value={invoice.invoice_number}
          />
        </div>
      )}

      {/* Client Selection */}
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

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Issue Date *
          </label>
          <input
            type="date"
            className="input"
            {...register('issue_date', {
              required: 'Issue date is required',
            })}
          />
          {errors.issue_date && (
            <p className="text-red-600 text-sm mt-1">{errors.issue_date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input type="date" className="input" {...register('due_date')} />
        </div>
      </div>

      {/* Line Items */}
      <InvoiceItemsTable
        control={control}
        register={register}
        errors={errors}
        watch={watch}
      />

      {/* Tax Rate */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tax Rate (%)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="0"
            className="input"
            {...register('tax_rate', {
              valueAsNumber: true,
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount Amount
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            className="input"
            {...register('discount_amount', {
              valueAsNumber: true,
            })}
          />
        </div>
      </div>

      {/* Payment Terms */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Terms
        </label>
        <textarea
          className="input"
          rows="2"
          placeholder="e.g., Net 30, Due upon receipt"
          {...register('payment_terms')}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          className="input"
          rows="3"
          placeholder="Invoice notes and special instructions"
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
          <option value="sent">Sent</option>
          <option value="viewed">Viewed</option>
          <option value="paid">Paid</option>
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
          {isSubmitting ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
        </button>
      </div>
    </form>
  );
}
