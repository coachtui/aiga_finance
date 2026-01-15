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

export default function RevenueVsExpenses({ data, isLoading }) {
  if (isLoading) return <LoadingSpinner />;

  if (!data || data.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">No P&L data available</p>
      </div>
    );
  }

  const totals = data.reduce(
    (acc, item) => ({
      totalRevenue: acc.totalRevenue + parseFloat(item.revenue || 0),
      totalExpenses: acc.totalExpenses + parseFloat(item.expenses || 0),
    }),
    { totalRevenue: 0, totalExpenses: 0 }
  );

  const netProfit = totals.totalRevenue - totals.totalExpenses;
  const profitMargin = totals.totalRevenue > 0 ? (netProfit / totals.totalRevenue) * 100 : 0;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Revenue vs Expenses (P&L)
      </h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-green-700 font-medium">Total Revenue</p>
          <p className="text-xl font-bold text-green-600">
            ${totals.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <p className="text-xs text-red-700 font-medium">Total Expenses</p>
          <p className="text-xl font-bold text-red-600">
            ${totals.totalExpenses.toFixed(2)}
          </p>
        </div>
        <div className={`${netProfit >= 0 ? 'bg-blue-50' : 'bg-orange-50'} rounded-lg p-3`}>
          <p className={`text-xs ${netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'} font-medium`}>
            Net Profit
          </p>
          <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            ${netProfit.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value) => `$${parseFloat(value).toFixed(2)}`}
          />
          <Legend />
          <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
          <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
        </BarChart>
      </ResponsiveContainer>

      {/* Profit Margin */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Profit Margin:</span>{' '}
          {profitMargin.toFixed(2)}%
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${profitMargin >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(100, Math.abs(profitMargin))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
