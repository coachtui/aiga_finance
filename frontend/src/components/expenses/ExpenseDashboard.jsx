import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

export default function ExpenseDashboard({ stats }) {
  if (!stats) return null;

  const { categoryBreakdown, dailyTrend } = stats;

  // Top 5 categories for bar chart
  const topCategories = categoryBreakdown.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Category Breakdown - Pie Chart */}
      {categoryBreakdown && categoryBreakdown.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Expenses by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                dataKey="total"
                nameKey="categoryName"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `$${entry.total.toFixed(0)}`}
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.categoryColor} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `$${value.toFixed(2)}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend - Line Chart */}
        {dailyTrend && dailyTrend.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Spending Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  tickFormatter={(value) => `$${value}`}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
                  labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Categories - Bar Chart */}
        {topCategories && topCategories.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top 5 Categories
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topCategories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="categoryName"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  style={{ fontSize: '11px' }}
                />
                <YAxis
                  tickFormatter={(value) => `$${value}`}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  formatter={(value) => `$${value.toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                  }}
                />
                <Bar dataKey="total" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
