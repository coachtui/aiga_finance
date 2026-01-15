import LoadingSpinner from '../common/LoadingSpinner';

export default function ReceivablesTable({ data, isLoading }) {
  if (isLoading) return <LoadingSpinner />;

  if (!data || data.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">No outstanding receivables</p>
      </div>
    );
  }

  const getAgeColor = (days) => {
    if (days <= 30) return 'bg-yellow-50 border-yellow-200';
    if (days <= 60) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getAgeLabel = (days) => {
    if (days <= 30) return '0-30 days';
    if (days <= 60) return '31-60 days';
    return '60+ days';
  };

  const total = data.reduce((sum, item) => sum + parseFloat(item.balance_due || 0), 0);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Outstanding Receivables (AR Aging)
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Invoice
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Client
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                Amount Due
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                Days Overdue
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                Age Category
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const daysOverdue = item.days_overdue || 0;
              return (
                <tr key={index} className={`border-t border-gray-200 ${getAgeColor(daysOverdue)}`}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">
                    {item.invoice_number}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {item.client_name}
                  </td>
                  <td className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                    ${parseFloat(item.balance_due).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-center text-sm text-gray-600">
                    {daysOverdue}
                  </td>
                  <td className="px-4 py-2 text-center text-xs font-medium text-gray-700">
                    {getAgeLabel(daysOverdue)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan="2" className="px-4 py-3 text-sm font-semibold text-gray-900">
                Total Outstanding
              </td>
              <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                ${total.toFixed(2)}
              </td>
              <td colSpan="2" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
