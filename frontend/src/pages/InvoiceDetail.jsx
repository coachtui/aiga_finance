import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useInvoice, useUpdateInvoiceStatus, useSendInvoice, useRecordPayment, useSendReminder, useInvoicePayments } from '../hooks/useInvoices';
import InvoiceForm from '../components/invoices/InvoiceForm';
import InvoicePDFViewer from '../components/invoices/InvoicePDFViewer';
import PaymentForm from '../components/invoices/PaymentForm';
import InvoiceStatusBadge from '../components/invoices/InvoiceStatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { data: invoice, isLoading } = useInvoice(id);
  const { data: payments } = useInvoicePayments(id);
  const updateStatus = useUpdateInvoiceStatus();
  const sendInvoice = useSendInvoice();
  const recordPayment = useRecordPayment();
  const sendReminder = useSendReminder();

  const handleSubmit = async (data) => {
    // Remove items array and re-add them properly
    const formData = { ...data };
    await updateStatus.mutateAsync({ id, status: formData.status || invoice.status });
    setIsEditing(false);
  };

  const handleSend = async () => {
    await sendInvoice.mutateAsync({ id });
  };

  const handleRecordPayment = async (data) => {
    await recordPayment.mutateAsync({ id, paymentData: data });
    setShowPaymentForm(false);
  };

  const handleSendReminder = async () => {
    await sendReminder.mutateAsync(id);
  };

  if (isLoading) return <LoadingSpinner />;

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-12">
            <p className="text-gray-600">Invoice not found</p>
          </div>
        </div>
      </div>
    );
  }

  const balanceDue = parseFloat(invoice.balance_due || 0);
  const totalAmount = parseFloat(invoice.total_amount || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/invoices" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
            ← Back to Invoices
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{invoice.invoice_number}</h1>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className="text-gray-600">Invoice details and payment tracking</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
          {/* Total Amount */}
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              ${totalAmount.toFixed(2)}
            </p>
          </div>

          {/* Amount Paid */}
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500">Amount Paid</h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">
              ${(totalAmount - balanceDue).toFixed(2)}
            </p>
          </div>

          {/* Balance Due */}
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500">Balance Due</h3>
            <p className={`mt-2 text-3xl font-semibold ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${balanceDue.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Details */}
            <div className="card">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Client</h3>
                  <p className="mt-2 text-lg text-gray-900">{invoice.client_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Invoice Date</h3>
                  <p className="mt-2 text-lg text-gray-900">
                    {format(new Date(invoice.issue_date), 'MMM dd, yyyy')}
                  </p>
                </div>
                {invoice.due_date && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                    <p className="mt-2 text-lg text-gray-900">
                      {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
              </div>

              {invoice.notes && (
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                  <p className="mt-2 text-gray-900 whitespace-pre-wrap">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </div>

            {/* PDF Viewer */}
            <InvoicePDFViewer invoiceId={id} isLoading={false} />

            {/* Payment History */}
            {payments && payments.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment History
                </h3>
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-start p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">
                          ${parseFloat(payment.amount).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 capitalize">
                          {payment.paymentMethod?.replace('_', ' ') || 'Payment'}
                        </p>
                        {payment.reference_number && (
                          <p className="text-xs text-gray-500">
                            Ref: {payment.reference_number}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              <div className="space-y-2">
                {invoice.status === 'draft' && (
                  <button
                    onClick={handleSend}
                    className="btn btn-primary w-full text-sm"
                    disabled={sendInvoice.isPending}
                  >
                    {sendInvoice.isPending ? 'Sending...' : 'Send Invoice'}
                  </button>
                )}
                {['sent', 'viewed', 'partial'].includes(invoice.status) && balanceDue > 0 && (
                  <>
                    <button
                      onClick={() => setShowPaymentForm(!showPaymentForm)}
                      className="btn btn-primary w-full text-sm"
                    >
                      {showPaymentForm ? 'Cancel' : 'Record Payment'}
                    </button>
                    <button
                      onClick={handleSendReminder}
                      className="btn btn-secondary w-full text-sm"
                      disabled={sendReminder.isPending}
                    >
                      {sendReminder.isPending ? 'Sending...' : 'Send Reminder'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Payment Form */}
            {showPaymentForm && balanceDue > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Record Payment
                </h3>
                <PaymentForm
                  balanceDue={balanceDue}
                  onSubmit={handleRecordPayment}
                  isSubmitting={recordPayment.isPending}
                  onCancel={() => setShowPaymentForm(false)}
                />
              </div>
            )}

            {/* Related */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Related
              </h3>
              <Link
                to={`/clients/${invoice.client_id}`}
                className="text-primary-600 hover:text-primary-700 text-sm block"
              >
                View Client Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
