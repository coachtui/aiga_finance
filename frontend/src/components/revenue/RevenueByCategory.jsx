import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import LoadingSpinner from '../common/LoadingSpinner';

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899',
  '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
];

export default function RevenueByCategory({ data, isLoading }) {
  if (isLoading) return <LoadingSpinner />;

  if (!data || data.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">No revenue data available</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + parseFloat(item.revenue || 0), 0);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Revenue by Category
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ category, percent }) =>
              `${category}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="revenue"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `$${parseFloat(value).toFixed(2)}`}
            labelFormatter={(label) => `${label}`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Table */}
      <div className="mt-6 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm font-medium text-gray-900">
                {item.category}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                ${parseFloat(item.revenue).toFixed(2)}
              </p>
              <p className="text-xs text-gray-600">
                {((parseFloat(item.revenue) / total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
