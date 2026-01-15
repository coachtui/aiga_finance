import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useContract, useUpdateContract, useSignContract, useActivateContract, useCompleteContract, useCancelContract } from '../hooks/useContracts';
import ContractForm from '../components/contracts/ContractForm';
import ContractTimeline from '../components/contracts/ContractTimeline';
import ContractStatusBadge from '../components/contracts/ContractStatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { data: contract, isLoading } = useContract(id);
  const updateContract = useUpdateContract();
  const signContract = useSignContract();
  const activateContract = useActivateContract();
  const completeContract = useCompleteContract();
  const cancelContract = useCancelContract();

  const handleSubmit = async (data) => {
    await updateContract.mutateAsync({ id, data });
    setIsEditing(false);
  };

  const handleSign = async () => {
    await signContract.mutateAsync(id);
  };

  const handleActivate = async () => {
    await activateContract.mutateAsync(id);
  };

  const handleComplete = async () => {
    await completeContract.mutateAsync(id);
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this contract?')) {
      await cancelContract.mutateAsync(id);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-12">
            <p className="text-gray-600">Contract not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/contracts" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
            ← Back to Contracts
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{contract.title}</h1>
            <ContractStatusBadge status={contract.status} />
          </div>
          <p className="text-gray-600">Contract details and management</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {isEditing ? (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Edit Contract
                </h2>
                <ContractForm
                  contract={contract}
                  onSubmit={handleSubmit}
                  isSubmitting={updateContract.isPending}
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
                {/* Contract Details */}
                <div className="card mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Client</h3>
                      <p className="mt-2 text-lg text-gray-900">
                        {contract.client_name}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Type</h3>
                      <p className="mt-2 text-lg text-gray-900 capitalize">
                        {contract.type}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Value</h3>
                      <p className="mt-2 text-lg text-gray-900">
                        ${parseFloat(contract.value || 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Auto-Renewal
                      </h3>
                      <p className="mt-2 text-lg text-gray-900">
                        {contract.autoRenewal ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>

                  {contract.description && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-500">
                        Description
                      </h3>
                      <p className="mt-2 text-gray-900 whitespace-pre-wrap">
                        {contract.description}
                      </p>
                    </div>
                  )}

                  {contract.notes && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-500">
                        Internal Notes
                      </h3>
                      <p className="mt-2 text-gray-900 whitespace-pre-wrap">
                        {contract.notes}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-secondary mt-6 w-full"
                  >
                    Edit Contract
                  </button>
                </div>

                {/* Timeline */}
                <ContractTimeline contract={contract} />
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Dates */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Key Dates
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Start Date</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(contract.start_date), 'MMM dd, yyyy')}
                  </p>
                </div>
                {contract.end_date && (
                  <div>
                    <p className="text-gray-500">End Date</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(contract.end_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
                {contract.signed_date && (
                  <div>
                    <p className="text-gray-500">Signed Date</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(contract.signed_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              <div className="space-y-2">
                {contract.status === 'draft' && (
                  <button
                    onClick={handleSign}
                    className="btn btn-primary w-full text-sm"
                    disabled={signContract.isPending}
                  >
                    {signContract.isPending ? 'Signing...' : 'Mark as Signed'}
                  </button>
                )}
                {contract.status === 'pending_signature' && (
                  <button
                    onClick={handleActivate}
                    className="btn btn-primary w-full text-sm"
                    disabled={activateContract.isPending}
                  >
                    {activateContract.isPending ? 'Activating...' : 'Activate Contract'}
                  </button>
                )}
                {contract.status === 'active' && (
                  <button
                    onClick={handleComplete}
                    className="btn btn-primary w-full text-sm"
                    disabled={completeContract.isPending}
                  >
                    {completeContract.isPending ? 'Completing...' : 'Mark as Completed'}
                  </button>
                )}
                {['draft', 'pending_signature', 'active'].includes(contract.status) && (
                  <button
                    onClick={handleCancel}
                    className="btn btn-danger w-full text-sm"
                    disabled={cancelContract.isPending}
                  >
                    {cancelContract.isPending ? 'Cancelling...' : 'Cancel Contract'}
                  </button>
                )}
              </div>
            </div>

            {/* Related */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Related
              </h3>
              <Link
                to={`/clients/${contract.client_id}`}
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
