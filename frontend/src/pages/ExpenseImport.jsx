import { Link } from 'react-router-dom';
import InvoiceUploadWizard from '../components/expenses/InvoiceUploadWizard';

export default function ExpenseImport() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/expenses" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
            ← Back to Expenses
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Import Invoices</h1>
          <p className="text-gray-600 mt-1">Upload invoices to automatically create expense records</p>
        </div>

        <div className="card">
          <InvoiceUploadWizard />
        </div>
      </div>
    </div>
  );
}
