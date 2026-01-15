import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function ClientCard({ client, onDelete }) {
  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      prospect: 'bg-blue-100 text-blue-800',
      churned: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.inactive;
  };

  return (
    <div className="card flex justify-between items-start hover:shadow-md transition-shadow">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-semibold text-gray-900 text-lg">
            {client.company_name}
          </h3>
          <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(client.status)}`}>
            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
          </span>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          {client.contact_name && (
            <p>
              <span className="font-medium">Contact:</span> {client.contact_name}
            </p>
          )}
          {client.contact_email && (
            <p>
              <span className="font-medium">Email:</span>{' '}
              <a href={`mailto:${client.contact_email}`} className="text-primary-600 hover:text-primary-700">
                {client.contact_email}
              </a>
            </p>
          )}
          {client.contact_phone && (
            <p>
              <span className="font-medium">Phone:</span> {client.contact_phone}
            </p>
          )}
          {client.country && (
            <p>
              <span className="font-medium">Location:</span> {client.country}
            </p>
          )}
          <p className="text-gray-500 mt-2">
            Added {format(new Date(client.created_at), 'MMM dd, yyyy')}
          </p>
        </div>
      </div>

      <div className="flex gap-2 ml-4">
        <Link
          to={`/clients/${client.id}`}
          className="btn btn-secondary text-sm"
        >
          View
        </Link>
        <button
          onClick={() => onDelete(client.id)}
          className="btn btn-danger text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
