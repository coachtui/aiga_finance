import { useNavigate, Link } from 'react-router-dom';
import { useCreateExpense } from '../hooks/useExpenses';
import ExpenseForm from '../components/expenses/ExpenseForm';

export default function ExpenseCreate() {
  const navigate = useNavigate();
  const createExpense = useCreateExpense();

  const handleSubmit = async (data) => {
    await createExpense.mutateAsync(data);
    navigate('/expenses');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/expenses" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
            ← Back to Expenses
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Expense</h1>
          <p className="text-gray-600 mt-1">Record a new business expense</p>
        </div>

        <div className="card">
          <ExpenseForm
            onSubmit={handleSubmit}
            isSubmitting={createExpense.isPending}
          />
        </div>
      </div>
    </div>
  );
}
