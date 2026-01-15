import { useFieldArray, useWatch, Controller } from 'react-hook-form';

export default function InvoiceItemsTable({ control, register, errors, watch }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items') || [];

  const subtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unit_price) || 0;
    return sum + (qty * price);
  }, 0);

  const taxRate = parseFloat(watch('tax_rate') || 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const discountAmount = parseFloat(watch('discount_amount') || 0);
  const totalAmount = subtotal + taxAmount - discountAmount;

  const addItem = () => {
    append({
      description: '',
      quantity: 1,
      unit_price: 0,
    });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Items</h3>

      <div className="overflow-x-auto border border-gray-200 rounded-lg mb-4">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 w-2/5">
                Description
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 w-1/6">
                Qty
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 w-1/6">
                Unit Price
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 w-1/6">
                Total
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 w-12">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => {
              const quantity = parseFloat(items[index]?.quantity) || 0;
              const unitPrice = parseFloat(items[index]?.unit_price) || 0;
              const lineTotal = quantity * unitPrice;

              return (
                <tr key={field.id} className="border-t border-gray-200">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      placeholder="Item description"
                      className="input text-sm"
                      {...register(`items.${index}.description`, {
                        required: 'Description is required',
                      })}
                    />
                    {errors.items?.[index]?.description && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.items[index].description.message}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="1"
                      className="input text-sm text-right"
                      {...register(`items.${index}.quantity`, {
                        required: 'Quantity is required',
                        valueAsNumber: true,
                      })}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="input text-sm text-right"
                      {...register(`items.${index}.unit_price`, {
                        required: 'Unit price is required',
                        valueAsNumber: true,
                      })}
                    />
                  </td>
                  <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                    ${lineTotal.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addItem}
        className="btn btn-secondary text-sm mb-6"
      >
        + Add Item
      </button>

      {/* Totals */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2 max-w-sm ml-auto">
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">Subtotal:</span>
          <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
        </div>

        {taxRate > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Tax ({taxRate}%):</span>
            <span className="text-gray-900 font-medium">${taxAmount.toFixed(2)}</span>
          </div>
        )}

        {discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Discount:</span>
            <span className="text-gray-900 font-medium">-${discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-2 flex justify-between">
          <span className="text-gray-900 font-semibold">Total:</span>
          <span className="text-lg font-semibold text-green-600">${totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
