import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import LoadingSpinner from '../common/LoadingSpinner';

export default function RevenueByClient({ data, isLoading }) {
  if (isLoading) return <LoadingSpinner />;

  if (!data || data.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">No revenue data available</p>
      </div>
    );
  }

  // Sort by revenue descending
  const sortedData = [...data].sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue));

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Top Clients by Revenue
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={sortedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="client_name" />
          <YAxis
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value) => `$${parseFloat(value).toFixed(2)}`}
            labelFormatter={(label) => `Client: ${label}`}
          />
          <Legend />
          <Bar dataKey="revenue" fill="#3b82f6" name="Total Revenue" />
        </BarChart>
      </ResponsiveContainer>

      {/* Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Client
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                Revenue
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                Invoices
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="px-4 py-2 text-sm text-gray-900">
                  {item.client_name}
                </td>
                <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                  ${parseFloat(item.revenue).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right text-sm text-gray-600">
                  {item.invoice_count || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
