import LoadingSpinner from '../common/LoadingSpinner';

export default function InvoicePDFViewer({ invoiceId, onDownload, isLoading }) {
  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Invoice PDF</h3>
        <button
          onClick={onDownload}
          className="btn btn-secondary text-sm"
        >
          ↓ Download PDF
        </button>
      </div>

      <div className="bg-gray-100 rounded-lg p-4 text-center py-12">
        <p className="text-gray-600">
          PDF viewer coming soon. Use the download button to view the invoice.
        </p>
      </div>
    </div>
  );
}
