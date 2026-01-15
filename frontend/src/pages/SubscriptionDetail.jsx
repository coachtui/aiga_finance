import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useSubscription, useUpdateSubscription, useCancelSubscription, usePauseSubscription, useResumeSubscription } from '../hooks/useSubscriptions';
import SubscriptionForm from '../components/subscriptions/SubscriptionForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';

export default function SubscriptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { data: subscription, isLoading } = useSubscription(id);
  const updateSubscription = useUpdateSubscription();
  const cancelSubscription = useCancelSubscription();
  const pauseSubscription = usePauseSubscription();
  const resumeSubscription = useResumeSubscription();

  const handleSubmit = async (data) => {
    await updateSubscription.mutateAsync({ id, data });
    setIsEditing(false);
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      await cancelSubscription.mutateAsync({ id, reason: 'User cancelled' });
    }
  };

  const handlePause = async () => {
    await pauseSubscription.mutateAsync(id);
  };

  const handleResume = async () => {
    await resumeSubscription.mutateAsync(id);
  };

  if (isLoading) return <LoadingSpinner />;

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-12">
            <p className="text-gray-600">Subscription not found</p>
          </div>
        </div>
      </div>
    );
  }

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
  const arr = mrr * 12;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/subscriptions" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
            ← Back to Subscriptions
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{subscription.name}</h1>
          <p className="text-gray-600">Subscription details and management</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500">Monthly Revenue</h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">
              ${mrr.toFixed(2)}
            </p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500">Annual Revenue</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-600">
              ${arr.toFixed(2)}
            </p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-2 text-lg font-semibold text-gray-900 capitalize">
              {subscription.status.replace('_', ' ')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {isEditing ? (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Edit Subscription
                </h2>
                <SubscriptionForm
                  subscription={subscription}
                  onSubmit={handleSubmit}
                  isSubmitting={updateSubscription.isPending}
                />
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary mt-4 w-full"
                >
                  Cancel Editing
                </button>
              </div>
            ) : (
              <>
                {/* Details Card */}
                <div className="card mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Client</h3>
                      <p className="mt-2 text-lg text-gray-900">
                        {subscription.client_name}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                      <p className="mt-2 text-lg text-gray-900">
                        ${parseFloat(subscription.amount).toFixed(2)}/
                        {subscription.billingCycle}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Next Billing</h3>
                      <p className="mt-2 text-lg text-gray-900">
                        {subscription.nextBillingDate
                          ? format(new Date(subscription.nextBillingDate), 'MMM dd, yyyy')
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Auto-Renewal</h3>
                      <p className="mt-2 text-lg text-gray-900">
                        {subscription.autoRenewal ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>

                  {subscription.description && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-500">
                        Description
                      </h3>
                      <p className="mt-2 text-gray-900 whitespace-pre-wrap">
                        {subscription.description}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-secondary mt-6 w-full"
                  >
                    Edit Subscription
                  </button>
                </div>
              </>
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
                {subscription.status === 'active' && (
                  <>
                    <button
                      onClick={handlePause}
                      className="btn btn-secondary w-full text-sm"
                      disabled={pauseSubscription.isPending}
                    >
                      {pauseSubscription.isPending ? 'Pausing...' : 'Pause Subscription'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn btn-danger w-full text-sm"
                      disabled={cancelSubscription.isPending}
                    >
                      {cancelSubscription.isPending ? 'Cancelling...' : 'Cancel Subscription'}
                    </button>
                  </>
                )}
                {subscription.status === 'paused' && (
                  <>
                    <button
                      onClick={handleResume}
                      className="btn btn-primary w-full text-sm"
                      disabled={resumeSubscription.isPending}
                    >
                      {resumeSubscription.isPending ? 'Resuming...' : 'Resume Subscription'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn btn-danger w-full text-sm"
                      disabled={cancelSubscription.isPending}
                    >
                      {cancelSubscription.isPending ? 'Cancelling...' : 'Cancel Subscription'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Related */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Related
              </h3>
              <Link
                to={`/clients/${subscription.client_id}`}
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
