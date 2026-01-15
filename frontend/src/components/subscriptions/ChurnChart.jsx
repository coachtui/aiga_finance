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

export default function ChurnChart({ data, isLoading }) {
  if (isLoading) return <LoadingSpinner />;

  if (!data || data.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">No churn data available</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Subscription Churn Analysis
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" tickFormatter={(value) => `${value.toFixed(1)}%`} />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'churnRate') return `${parseFloat(value).toFixed(2)}%`;
              return value;
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="churnRate"
            fill="#ef4444"
            name="Churn Rate (%)"
          />
          <Bar
            yAxisId="right"
            dataKey="cancelledSubscriptions"
            fill="#f97316"
            name="Cancelled"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
