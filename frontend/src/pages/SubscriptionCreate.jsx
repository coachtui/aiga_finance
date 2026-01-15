import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useCreateSubscription } from '../hooks/useSubscriptions';
import SubscriptionForm from '../components/subscriptions/SubscriptionForm';

export default function SubscriptionCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createSubscription = useCreateSubscription();
  const clientId = searchParams.get('clientId');

  const handleSubmit = async (data) => {
    await createSubscription.mutateAsync(data);
    navigate('/subscriptions');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/subscriptions" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
            ← Back to Subscriptions
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Subscription</h1>
          <p className="text-gray-600 mt-1">Create a new recurring revenue subscription</p>
        </div>

        <div className="card">
          <SubscriptionForm
            onSubmit={handleSubmit}
            isSubmitting={createSubscription.isPending}
          />
        </div>
      </div>
    </div>
  );
}
