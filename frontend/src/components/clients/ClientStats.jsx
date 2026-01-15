import LoadingSpinner from '../common/LoadingSpinner';

export default function ClientStats({ clientId, contracts, subscriptions, invoices, revenue, isLoading }) {
  if (isLoading) return <LoadingSpinner />;

  const activeContracts = contracts?.filter(c => c.status === 'active').length || 0;
  const activeSubscriptions = subscriptions?.filter(s => s.status === 'active').length || 0;
  const totalInvoices = invoices?.length || 0;
  const paidInvoices = invoices?.filter(i => i.status === 'paid').length || 0;
  const outstandingBalance = revenue?.outstandingBalance || 0;
  const totalRevenue = revenue?.totalRevenue || 0;

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${parseFloat(totalRevenue).toFixed(2)}`,
      color: 'text-green-600',
    },
    {
      label: 'Active Contracts',
      value: activeContracts,
      color: 'text-blue-600',
    },
    {
      label: 'Active Subscriptions',
      value: activeSubscriptions,
      color: 'text-purple-600',
    },
    {
      label: 'Invoices',
      value: `${paidInvoices}/${totalInvoices}`,
      color: 'text-gray-600',
    },
    {
      label: 'Outstanding Balance',
      value: `$${parseFloat(outstandingBalance).toFixed(2)}`,
      color: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className="card">
          <p className="text-sm font-medium text-gray-600">{stat.label}</p>
          <p className={`mt-2 text-2xl font-semibold ${stat.color}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
