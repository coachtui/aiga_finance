import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useInvoiceStats, useOverdueInvoices } from '../hooks/useInvoices';
import InvoiceList from '../components/invoices/InvoiceList';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Invoices() {
  const { logout } = useAuth();
  const { data: stats, isLoading: statsLoading } = useInvoiceStats();
  const { data: overdue } = useOverdueInvoices();

  if (statsLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="text-xl font-bold text-primary-600">
                AIGA LLC Finance
              </Link>
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/invoices"
                className="text-primary-600 hover:text-primary-700 font-medium border-b-2 border-primary-600 py-5"
              >
                Invoices
              </Link>
              <Link
                to="/subscriptions"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Subscriptions
              </Link>
            </div>
            <div className="flex items-center">
              <button onClick={logout} className="btn btn-secondary text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600 mt-1">
              Create, send, and track your invoices
            </p>
          </div>

          <Link to="/invoices/new" className="btn btn-primary">
            + Create Invoice
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-4 mb-8">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500">
              Total Invoices
            </h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {stats?.totalCount || 0}
            </p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-500">
              Total Revenue
            </h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">
              ${parseFloat(stats?.totalRevenue || 0).toFixed(2)}
            </p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-500">
              Outstanding
            </h3>
            <p className="mt-2 text-3xl font-semibold text-orange-600">
              ${parseFloat(stats?.outstandingBalance || 0).toFixed(2)}
            </p>
          </div>

          {overdue && overdue.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500">
                Overdue Invoices
              </h3>
              <p className="mt-2 text-3xl font-semibold text-red-600">
                {overdue.length}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                ${overdue.reduce((sum, inv) => sum + parseFloat(inv.balance_due || 0), 0).toFixed(2)}
              </p>
            </div>
          )}
        </div>

        <InvoiceList />
      </div>
    </div>
  );
}
