import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function SubscriptionCard({ subscription, onDelete }) {
  const getStatusColor = (status) => {
    const colors = {
      trial: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      past_due: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
      paused: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.active;
  };

  const getMRRValue = (amount, billingCycle) => {
    if (!amount) return 0;
    const amt = parseFloat(amount);
    switch (billingCycle) {
      case 'monthly':
        return amt;
      case 'quarterly':
        return amt / 3;
      case 'annual':
        return amt / 12;
      default:
        return 0;
    }
  };

  const mrr = getMRRValue(subscription.amount, subscription.billingCycle);

  return (
    <div className="card flex justify-between items-start hover:shadow-md transition-shadow">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-semibold text-gray-900 text-lg">
            {subscription.name}
          </h3>
          <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(subscription.status)}`}>
            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1).replace('_', ' ')}
          </span>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          {subscription.client_name && (
            <p>
              <span className="font-medium">Client:</span> {subscription.client_name}
            </p>
          )}
          <p>
            <span className="font-medium">Billing:</span> ${parseFloat(subscription.amount || 0).toFixed(2)} {subscription.billingCycle}
          </p>
          <p>
            <span className="font-medium">MRR:</span> ${mrr.toFixed(2)}
          </p>
          {subscription.nextBillingDate && (
            <p>
              <span className="font-medium">Next Billing:</span> {format(new Date(subscription.nextBillingDate), 'MMM dd, yyyy')}
            </p>
          )}
          {subscription.cancellationDate && (
            <p className="text-red-600">
              <span className="font-medium">Cancelled:</span> {format(new Date(subscription.cancellationDate), 'MMM dd, yyyy')}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 ml-4">
        <Link
          to={`/subscriptions/${subscription.id}`}
          className="btn btn-secondary text-sm"
        >
          View
        </Link>
        <button
          onClick={() => onDelete(subscription.id)}
          className="btn btn-danger text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
