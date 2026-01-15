import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import InvoiceStatusBadge from './InvoiceStatusBadge';

export default function InvoiceCard({ invoice, onDelete }) {
  const balanceDue = parseFloat(invoice.balance_due || 0);
  const totalAmount = parseFloat(invoice.total_amount || 0);

  return (
    <div className="card flex justify-between items-start hover:shadow-md transition-shadow">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-semibold text-gray-900 text-lg">
            {invoice.invoice_number}
          </h3>
          <InvoiceStatusBadge status={invoice.status} />
          {balanceDue > 0 && (
            <span className="text-xs font-medium px-2 py-1 rounded bg-red-100 text-red-800">
              Balance Due: ${balanceDue.toFixed(2)}
            </span>
          )}
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          {invoice.client_name && (
            <p>
              <span className="font-medium">Client:</span> {invoice.client_name}
            </p>
          )}
          <p>
            <span className="font-medium">Total:</span> ${totalAmount.toFixed(2)}
          </p>
          <p>
            <span className="font-medium">Issued:</span> {format(new Date(invoice.issue_date), 'MMM dd, yyyy')}
          </p>
          {invoice.due_date && (
            <p>
              <span className="font-medium">Due:</span> {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 ml-4">
        <Link
          to={`/invoices/${invoice.id}`}
          className="btn btn-secondary text-sm"
        >
          View
        </Link>
        <button
          onClick={() => onDelete(invoice.id)}
          className="btn btn-danger text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
