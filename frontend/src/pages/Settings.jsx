import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePaymentMethods, useCreatePaymentMethod, useDeletePaymentMethod } from '../hooks/usePaymentMethods';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Settings() {
  const { user, logout } = useAuth();
  const { data: paymentMethods, isLoading } = usePaymentMethods();
  const createPaymentMethod = useCreatePaymentMethod();
  const deletePaymentMethod = useDeletePaymentMethod();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'credit_card',
    lastFour: '',
    institutionName: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createPaymentMethod.mutateAsync({
      ...formData,
      lastFour: formData.lastFour || null,
      institutionName: formData.institutionName || null,
    });
    setFormData({
      name: '',
      type: 'credit_card',
      lastFour: '',
      institutionName: '',
    });
    setShowAddForm(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      await deletePaymentMethod.mutateAsync(id);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-primary-600">AIGA LLC Finance</h1>
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
                Dashboard
              </Link>
              <Link to="/expenses" className="text-gray-600 hover:text-gray-900 font-medium">
                Expenses
              </Link>
              <Link to="/clients" className="text-gray-600 hover:text-gray-900 font-medium">
                Clients
              </Link>
              <Link to="/invoices" className="text-gray-600 hover:text-gray-900 font-medium">
                Invoices
              </Link>
              <Link to="/revenue" className="text-gray-600 hover:text-gray-900 font-medium">
                Revenue
              </Link>
              <Link to="/settings" className="text-primary-600 hover:text-primary-700 font-medium border-b-2 border-primary-600 py-5">
                Settings
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.name || user?.email}
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* Payment Methods Section */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn btn-primary"
            >
              {showAddForm ? 'Cancel' : 'Add Payment Method'}
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Business Credit Card"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    className="input"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="bank_account">Bank Account</option>
                    <option value="cash">Cash</option>
                    <option value="paypal">PayPal</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Four Digits (Optional)
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="1234"
                    maxLength="4"
                    value={formData.lastFour}
                    onChange={(e) => setFormData({ ...formData, lastFour: e.target.value.replace(/\D/g, '') })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institution Name (Optional)
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Chase, Wells Fargo"
                    value={formData.institutionName}
                    onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createPaymentMethod.isPending}
                >
                  {createPaymentMethod.isPending ? 'Adding...' : 'Add Payment Method'}
                </button>
              </div>
            </form>
          )}

          {/* Payment Methods List */}
          {paymentMethods && paymentMethods.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">No payment methods yet.</p>
              <p className="text-sm">Click "Add Payment Method" to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods?.map((pm) => (
                <div
                  key={pm.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{pm.name}</h3>
                    <p className="text-sm text-gray-600">
                      {pm.type.replace('_', ' ')}
                      {pm.last_four && ` ••••${pm.last_four}`}
                      {pm.institution_name && ` - ${pm.institution_name}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(pm.id)}
                    className="btn btn-danger text-sm"
                    disabled={deletePaymentMethod.isPending}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
