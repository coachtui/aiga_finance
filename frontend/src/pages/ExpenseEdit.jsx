import { useParams, useNavigate, Link } from 'react-router-dom';
import { useExpense, useUpdateExpense } from '../hooks/useExpenses';
import ExpenseForm from '../components/expenses/ExpenseForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ExpenseEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: expense, isLoading } = useExpense(id);
  const updateExpense = useUpdateExpense();

  const handleSubmit = async (data) => {
    await updateExpense.mutateAsync({ id, data });
    navigate('/expenses');
  };

  if (isLoading) return <LoadingSpinner />;

  if (!expense) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card">
          <p className="text-red-600">Expense not found</p>
          <Link to="/expenses" className="btn btn-primary mt-4">
            Back to Expenses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/expenses" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
            ← Back to Expenses
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Expense</h1>
        </div>

        <div className="card">
          <ExpenseForm
            expense={expense}
            onSubmit={handleSubmit}
            isSubmitting={updateExpense.isPending}
          />
        </div>
      </div>
    </div>
  );
}
