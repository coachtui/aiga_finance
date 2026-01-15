import { useNavigate, Link } from 'react-router-dom';
import { useCreateClient } from '../hooks/useClients';
import ClientForm from '../components/clients/ClientForm';

export default function ClientCreate() {
  const navigate = useNavigate();
  const createClient = useCreateClient();

  const handleSubmit = async (data) => {
    await createClient.mutateAsync(data);
    navigate('/clients');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/clients" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
            ← Back to Clients
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Client</h1>
          <p className="text-gray-600 mt-1">Create a new client record</p>
        </div>

        <div className="card">
          <ClientForm
            onSubmit={handleSubmit}
            isSubmitting={createClient.isPending}
          />
        </div>
      </div>
    </div>
  );
}
