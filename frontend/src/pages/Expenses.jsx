import { Link } from 'react-router-dom';
import ExpenseList from '../components/expenses/ExpenseList';
import { useAuth } from '../context/AuthContext';

export default function Expenses() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="text-xl font-bold text-primary-600">
                EquipmentAI Finance
              </Link>
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/expenses"
                className="text-primary-600 hover:text-primary-700 font-medium border-b-2 border-primary-600 py-5"
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
            <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
            <p className="text-gray-600 mt-1">
              Track and manage your business expenses
            </p>
          </div>

          <Link to="/expenses/new" className="btn btn-primary">
            + Add Expense
          </Link>
        </div>

        <ExpenseList />
      </div>
    </div>
  );
}
