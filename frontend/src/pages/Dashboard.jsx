import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExpenseStats } from '../hooks/useExpenses';
import ExpenseDashboard from '../components/expenses/ExpenseDashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { data: stats, isLoading } = useExpenseStats('30d');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-primary-600">
                AIGA LLC Finance
              </h1>
              <Link
                to="/dashboard"
                className="text-primary-600 hover:text-primary-700 font-medium border-b-2 border-primary-600 py-5"
              >
                Dashboard
              </Link>
              <Link
                to="/expenses"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Expenses
              </Link>
              <Link
                to="/payment-methods"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Payment Methods
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.first_name || user?.email}
              </span>
              <button onClick={logout} className="btn btn-secondary text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back{user?.first_name ? `, ${user.first_name}` : ''}!
          </h2>
          <p className="text-gray-600">
            Track your startup expenses, analyze burn rate, and manage your finances.
          </p>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="card">
                <h3 className="text-sm font-medium text-gray-500">
                  Total Expenses
                </h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  ${stats?.totalAmount?.toFixed(2) || '0.00'}
                </p>
                <p className="mt-1 text-sm text-gray-600">Last 30 days</p>
              </div>

              <div className="card">
                <h3 className="text-sm font-medium text-gray-500">Burn Rate</h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  ${stats?.burnRate?.toFixed(2) || '0.00'}
                </p>
                <p className="mt-1 text-sm text-gray-600">Per month</p>
              </div>

              <div className="card">
                <h3 className="text-sm font-medium text-gray-500">Runway</h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {stats?.runway || '∞'}
                </p>
                <p className="mt-1 text-sm text-gray-600">Months</p>
              </div>

              <div className="card">
                <h3 className="text-sm font-medium text-gray-500">
                  Transactions
                </h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {stats?.transactionCount || 0}
                </p>
                <p className="mt-1 text-sm text-gray-600">Last 30 days</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Link to="/expenses/new" className="btn btn-primary text-center">
                  + Add Expense
                </Link>
                <Link to="/expenses" className="btn btn-secondary text-center">
                  View All Expenses
                </Link>
                <Link
                  to="/payment-methods"
                  className="btn btn-secondary text-center"
                >
                  Manage Payment Methods
                </Link>
              </div>
            </div>

            {/* Charts */}
            {stats && stats.transactionCount > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Analytics
                </h3>
                <ExpenseDashboard stats={stats} />
              </div>
            )}

            {/* Empty State */}
            {stats && stats.transactionCount === 0 && (
              <div className="mt-8 card text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No expenses yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start tracking your expenses to see insights and analytics.
                </p>
                <Link to="/expenses/new" className="btn btn-primary">
                  Add Your First Expense
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
