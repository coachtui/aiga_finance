export default function ContractStatusBadge({ status }) {
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending_signature: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || colors.draft;
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Draft',
      pending_signature: 'Pending Signature',
      active: 'Active',
      completed: 'Completed',
      cancelled: 'Cancelled',
      expired: 'Expired',
    };
    return labels[status] || status;
  };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
}
