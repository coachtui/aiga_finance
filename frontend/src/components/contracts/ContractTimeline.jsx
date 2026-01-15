import { format } from 'date-fns';

export default function ContractTimeline({ contract }) {
  const events = [
    {
      date: contract.created_at,
      label: 'Created',
      status: 'completed',
    },
    {
      date: contract.start_date,
      label: 'Started',
      status: ['active', 'completed', 'cancelled'].includes(contract.status) ? 'completed' : 'pending',
    },
    {
      date: contract.signed_date,
      label: 'Signed',
      status: contract.signed_date ? 'completed' : 'pending',
    },
    {
      date: contract.end_date,
      label: 'Ends',
      status: contract.status === 'completed' ? 'completed' : 'pending',
    },
  ].filter((event) => event.date);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Contract Timeline</h3>
      <div className="relative">
        {events.map((event, index) => (
          <div key={index} className="flex gap-4 pb-6 last:pb-0">
            {/* Timeline dot */}
            <div className="flex flex-col items-center">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  event.status === 'completed'
                    ? 'bg-green-500 border-green-500'
                    : 'bg-gray-300 border-gray-300'
                }`}
              />
              {index < events.length - 1 && (
                <div className="w-0.5 h-12 bg-gray-300 mt-2" />
              )}
            </div>

            {/* Timeline content */}
            <div>
              <p className="font-medium text-gray-900">{event.label}</p>
              <p className="text-sm text-gray-600">
                {format(new Date(event.date), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
