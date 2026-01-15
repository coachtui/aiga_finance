export default function InvoiceStatusBadge({ status }) {
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      viewed: 'bg-cyan-100 text-cyan-800',
      partial: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-200 text-gray-700',
      void: 'bg-slate-100 text-slate-800',
    };
    return colors[status] || colors.draft;
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Draft',
      sent: 'Sent',
      viewed: 'Viewed',
      partial: 'Partial Payment',
      paid: 'Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
      void: 'Void',
    };
    return labels[status] || status;
  };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
}
