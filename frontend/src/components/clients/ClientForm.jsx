import { useForm } from 'react-hook-form';

export default function ClientForm({ client, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: client || {
      status: 'active',
      paymentTerms: 30,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company Name *
        </label>
        <input
          type="text"
          className="input"
          placeholder="e.g., Acme Corporation"
          {...register('company_name', {
            required: 'Company name is required',
          })}
        />
        {errors.company_name && (
          <p className="text-red-600 text-sm mt-1">{errors.company_name.message}</p>
        )}
      </div>

      {/* Contact Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact Name
        </label>
        <input
          type="text"
          className="input"
          placeholder="e.g., John Doe"
          {...register('contact_name')}
        />
      </div>

      {/* Contact Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact Email
        </label>
        <input
          type="email"
          className="input"
          placeholder="e.g., john@acme.com"
          {...register('contact_email')}
        />
        {errors.contact_email && (
          <p className="text-red-600 text-sm mt-1">{errors.contact_email.message}</p>
        )}
      </div>

      {/* Contact Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact Phone
        </label>
        <input
          type="tel"
          className="input"
          placeholder="e.g., +1 (555) 123-4567"
          {...register('contact_phone')}
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <input
          type="text"
          className="input"
          placeholder="Street address"
          {...register('address')}
        />
      </div>

      {/* City */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input type="text" className="input" placeholder="City" {...register('city')} />
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <input
            type="text"
            className="input"
            placeholder="Country"
            {...register('country')}
          />
        </div>
      </div>

      {/* Tax ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tax ID / VAT Number
        </label>
        <input
          type="text"
          className="input"
          placeholder="e.g., 12-3456789"
          {...register('tax_id')}
        />
      </div>

      {/* Payment Terms */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Terms (days)
        </label>
        <input
          type="number"
          className="input"
          placeholder="30"
          min="0"
          {...register('paymentTerms', {
            valueAsNumber: true,
          })}
        />
        <p className="text-sm text-gray-500 mt-1">
          Number of days from invoice date to payment due date
        </p>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select className="input" {...register('status')}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="prospect">Prospect</option>
          <option value="churned">Churned</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          className="input"
          rows="3"
          placeholder="Additional notes about this client"
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
          {isSubmitting ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
        </button>
      </div>
    </form>
  );
}
