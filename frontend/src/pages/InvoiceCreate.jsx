import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useCreateInvoice } from '../hooks/useInvoices';
import InvoiceForm from '../components/invoices/InvoiceForm';

export default function InvoiceCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createInvoice = useCreateInvoice();
  const clientId = searchParams.get('clientId');

  const handleSubmit = async (data) => {
    await createInvoice.mutateAsync(data);
    navigate('/invoices');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/invoices" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
            ← Back to Invoices
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
          <p className="text-gray-600 mt-1">Create a new invoice for your client</p>
        </div>

        <div className="card">
          <InvoiceForm
            onSubmit={handleSubmit}
            isSubmitting={createInvoice.isPending}
          />
        </div>
      </div>
    </div>
  );
}
