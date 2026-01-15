import { useParams, useNavigate, Link } from 'react-router-dom';
import { useClient, useClientContracts, useClientSubscriptions, useClientInvoices, useClientRevenue, useUpdateClient } from '../hooks/useClients';
import ClientForm from '../components/clients/ClientForm';
import ClientStats from '../components/clients/ClientStats';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id);
  const { data: contracts } = useClientContracts(id);
  const { data: subscriptions } = useClientSubscriptions(id);
  const { data: invoices } = useClientInvoices(id);
  const { data: revenue } = useClientRevenue(id);
  const updateClient = useUpdateClient();

  const handleSubmit = async (data) => {
    await updateClient.mutateAsync({ id, data });
  };

  if (isLoading) return <LoadingSpinner />;

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-12">
            <p className="text-gray-600">Client not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/clients" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
            ← Back to Clients
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{client.company_name}</h1>
          <p className="text-gray-600 mt-1">Client details and overview</p>
        </div>

        {/* Statistics Cards */}
        <ClientStats
          clientId={id}
          contracts={contracts}
          subscriptions={subscriptions}
          invoices={invoices}
          revenue={revenue}
          isLoading={isLoading}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Client Information
              </h2>
              <ClientForm
                client={client}
                onSubmit={handleSubmit}
                isSubmitting={updateClient.isPending}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  to={`/contracts/new?clientId=${id}`}
                  className="btn btn-primary w-full text-center text-sm"
                >
                  + New Contract
                </Link>
                <Link
                  to={`/subscriptions/new?clientId=${id}`}
                  className="btn btn-secondary w-full text-center text-sm"
                >
                  + New Subscription
                </Link>
                <Link
                  to={`/invoices/new?clientId=${id}`}
                  className="btn btn-secondary w-full text-center text-sm"
                >
                  + New Invoice
                </Link>
              </div>
            </div>

            {/* Recent Contracts */}
            {contracts && contracts.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Contracts
                </h3>
                <ul className="space-y-2">
                  {contracts.slice(0, 5).map((contract) => (
                    <li key={contract.id}>
                      <Link
                        to={`/contracts/${contract.id}`}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        {contract.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recent Invoices */}
            {invoices && invoices.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Invoices
                </h3>
                <ul className="space-y-2">
                  {invoices.slice(0, 5).map((invoice) => (
                    <li key={invoice.id}>
                      <Link
                        to={`/invoices/${invoice.id}`}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        {invoice.invoice_number}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
