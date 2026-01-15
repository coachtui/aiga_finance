import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import ExpenseCreate from './pages/ExpenseCreate';
import ExpenseEdit from './pages/ExpenseEdit';
import Clients from './pages/Clients';
import ClientCreate from './pages/ClientCreate';
import ClientDetail from './pages/ClientDetail';
import Contracts from './pages/Contracts';
import ContractCreate from './pages/ContractCreate';
import ContractDetail from './pages/ContractDetail';
import Subscriptions from './pages/Subscriptions';
import SubscriptionCreate from './pages/SubscriptionCreate';
import SubscriptionDetail from './pages/SubscriptionDetail';
import Invoices from './pages/Invoices';
import InvoiceCreate from './pages/InvoiceCreate';
import InvoiceDetail from './pages/InvoiceDetail';
import RevenueAnalytics from './pages/RevenueAnalytics';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses/new"
          element={
            <ProtectedRoute>
              <ExpenseCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses/:id/edit"
          element={
            <ProtectedRoute>
              <ExpenseEdit />
            </ProtectedRoute>
          }
        />
        {/* Clients Routes */}
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/new"
          element={
            <ProtectedRoute>
              <ClientCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/:id"
          element={
            <ProtectedRoute>
              <ClientDetail />
            </ProtectedRoute>
          }
        />
        {/* Contracts Routes */}
        <Route
          path="/contracts"
          element={
            <ProtectedRoute>
              <Contracts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contracts/new"
          element={
            <ProtectedRoute>
              <ContractCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contracts/:id"
          element={
            <ProtectedRoute>
              <ContractDetail />
            </ProtectedRoute>
          }
        />
        {/* Subscriptions Routes */}
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute>
              <Subscriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions/new"
          element={
            <ProtectedRoute>
              <SubscriptionCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions/:id"
          element={
            <ProtectedRoute>
              <SubscriptionDetail />
            </ProtectedRoute>
          }
        />
        {/* Invoices Routes */}
        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <Invoices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/new"
          element={
            <ProtectedRoute>
              <InvoiceCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/:id"
          element={
            <ProtectedRoute>
              <InvoiceDetail />
            </ProtectedRoute>
          }
        />
        {/* Revenue Routes */}
        <Route
          path="/revenue"
          element={
            <ProtectedRoute>
              <RevenueAnalytics />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;
