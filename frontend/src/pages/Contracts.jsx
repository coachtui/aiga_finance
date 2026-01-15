import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ContractList from '../components/contracts/ContractList';

export default function Contracts() {
  const { logout } = useAuth();

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
                to="/expenses"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Expenses
              </Link>
              <Link
                to="/clients"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Clients
              </Link>
              <Link
                to="/contracts"
                className="text-primary-600 hover:text-primary-700 font-medium border-b-2 border-primary-600 py-5"
              >
                Contracts
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
            <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
            <p className="text-gray-600 mt-1">
              Track and manage your business contracts
            </p>
          </div>

          <Link to="/contracts/new" className="btn btn-primary">
            + Add Contract
          </Link>
        </div>

        <ContractList />
      </div>
    </div>
  );
}
