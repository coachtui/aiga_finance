import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                EquipmentAI Finance
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.first_name || user?.email}
              </span>
              <button
                onClick={logout}
                className="btn btn-secondary text-sm"
              >
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">$0</p>
            <p className="mt-1 text-sm text-gray-600">This month</p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-500">Burn Rate</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">$0</p>
            <p className="mt-1 text-sm text-gray-600">Per month</p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-500">Runway</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">∞</p>
            <p className="mt-1 text-sm text-gray-600">Months</p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-500">Transactions</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">0</p>
            <p className="mt-1 text-sm text-gray-600">Total</p>
          </div>
        </div>

        <div className="mt-8 card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button className="btn btn-primary">
              Add Expense
            </button>
            <button className="btn btn-secondary">
              Upload Receipt
            </button>
            <button className="btn btn-secondary">
              View Reports
            </button>
          </div>
        </div>

        <div className="mt-8 card">
          <p className="text-gray-600">
            <strong>Coming soon:</strong> Expense tracking, analytics dashboard, receipt uploads, and bank integration.
          </p>
        </div>
      </div>
    </div>
  );
}
