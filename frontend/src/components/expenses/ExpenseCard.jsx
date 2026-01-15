import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function ExpenseCard({ expense, onDelete }) {
  return (
    <div className="card flex justify-between items-start hover:shadow-md transition-shadow">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          {expense.category_color && (
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: expense.category_color }}
            />
          )}
          <h3 className="font-semibold text-gray-900">
            {expense.vendor_name || expense.description || 'Untitled Expense'}
          </h3>
          <span className="text-xl font-bold text-gray-900 ml-auto">
            ${parseFloat(expense.amount).toFixed(2)}
          </span>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p>{format(new Date(expense.transaction_date), 'MMM dd, yyyy')}</p>
          {expense.description && expense.vendor_name && (
            <p className="text-gray-700">{expense.description}</p>
          )}
          {expense.category_name && (
            <p className="text-gray-500">
              <span className="font-medium">Category:</span>{' '}
              {expense.category_name}
            </p>
          )}
          {expense.payment_method_name && (
            <p className="text-gray-500">
              <span className="font-medium">Payment:</span>{' '}
              {expense.payment_method_name}
            </p>
          )}
        </div>

        {expense.tags && expense.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {expense.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 ml-4">
        <Link
          to={`/expenses/${expense.id}/edit`}
          className="btn btn-secondary text-sm"
        >
          Edit
        </Link>
        <button
          onClick={() => onDelete(expense.id)}
          className="btn btn-danger text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
