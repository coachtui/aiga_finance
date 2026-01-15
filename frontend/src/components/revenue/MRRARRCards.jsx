import LoadingSpinner from '../common/LoadingSpinner';

export default function MRRARRCards({ mrrData, arrData, isLoading }) {
  if (isLoading) return <LoadingSpinner />;

  const mrr = parseFloat(mrrData?.totalMRR || 0);
  const arr = mrr * 12;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {/* MRR Card */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-500">
          Monthly Recurring Revenue
        </h3>
        <p className="mt-3 text-4xl font-bold text-green-600">
          ${mrr.toFixed(2)}
        </p>
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Annual (ARR):</span> ${arr.toFixed(2)}
        </p>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Active Subscriptions:</span>{' '}
            {mrrData?.activeSubscriptions || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium">Avg per Sub:</span> ${mrrData?.activeSubscriptions ? (mrr / mrrData.activeSubscriptions).toFixed(2) : '0.00'}/mo
          </p>
        </div>
      </div>

      {/* Growth Card */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-500">
          Growth Metrics
        </h3>
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Trial Subscriptions:</span>
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {mrrData?.trialCount || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Churn Rate:</span>
            </p>
            <p className="text-2xl font-bold text-red-600">
              {parseFloat(mrrData?.churnRate || 0).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
