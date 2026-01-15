import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import LoadingSpinner from '../common/LoadingSpinner';

export default function MRRChart({ data, isLoading }) {
  if (isLoading) return <LoadingSpinner />;

  if (!data || data.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">No MRR data available</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Monthly Recurring Revenue Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis
            yAxisId="left"
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip
            formatter={(value) => `$${parseFloat(value).toFixed(2)}`}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="mrr"
            stroke="#3b82f6"
            name="MRR"
            dot={{ fill: '#3b82f6' }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="activeSubscriptions"
            stroke="#10b981"
            name="Active Subscriptions"
            dot={{ fill: '#10b981' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
