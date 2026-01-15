import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useCreateContract } from '../hooks/useContracts';
import ContractForm from '../components/contracts/ContractForm';

export default function ContractCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createContract = useCreateContract();
  const clientId = searchParams.get('clientId');

  const handleSubmit = async (data) => {
    await createContract.mutateAsync(data);
    navigate('/contracts');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/contracts" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
            ← Back to Contracts
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Contract</h1>
          <p className="text-gray-600 mt-1">Create a new business contract</p>
        </div>

        <div className="card">
          <ContractForm
            onSubmit={handleSubmit}
            isSubmitting={createContract.isPending}
          />
        </div>
      </div>
    </div>
  );
}
