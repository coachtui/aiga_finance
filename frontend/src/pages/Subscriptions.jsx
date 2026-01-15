import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMRR, useSubscriptionStats } from '../hooks/useSubscriptions';
import SubscriptionList from '../components/subscriptions/SubscriptionList';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Subscriptions() {
  const { logout } = useAuth();
  const { data: mrrData, isLoading: mrrLoading } = useMRR();
  const { data: stats, isLoading: statsLoading } = useSubscriptionStats();

  const isLoading = mrrLoading || statsLoading;

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
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Invoices
              </Link>
              <Link
                to="/subscriptions"
                className="text-primary-600 hover:text-primary-700 font-medium border-b-2 border-primary-600 py-5"
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
            <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
            <p className="text-gray-600 mt-1">
              Track recurring revenue and subscription metrics
            </p>
          </div>

          <Link to="/subscriptions/new" className="btn btn-primary">
            + Add Subscription
          </Link>
        </div>

        {/* MRR Card */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
              <div className="card">
                <h3 className="text-sm font-medium text-gray-500">
                  Monthly Recurring Revenue
                </h3>
                <p className="mt-2 text-3xl font-semibold text-green-600">
                  ${parseFloat(mrrData?.totalMRR || 0).toFixed(2)}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Annual ARR: ${(parseFloat(mrrData?.totalMRR || 0) * 12).toFixed(2)}
                </p>
              </div>

              <div className="card">
                <h3 className="text-sm font-medium text-gray-500">
                  Active Subscriptions
                </h3>
                <p className="mt-2 text-3xl font-semibold text-blue-600">
                  {stats?.activeCount || 0}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {stats?.trialCount || 0} in trial
                </p>
              </div>

              <div className="card">
                <h3 className="text-sm font-medium text-gray-500">
                  Churn Rate
                </h3>
                <p className="mt-2 text-3xl font-semibold text-red-600">
                  {parseFloat(stats?.churnRate || 0).toFixed(2)}%
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {stats?.cancelledCount || 0} cancelled this month
                </p>
              </div>
            </div>

            <SubscriptionList />
          </>
        )}
      </div>
    </div>
  );
}
