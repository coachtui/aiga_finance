import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import ContractStatusBadge from './ContractStatusBadge';

export default function ContractCard({ contract, onDelete }) {
  const daysUntilExpiration = contract.end_date
    ? Math.ceil(
        (new Date(contract.end_date) - new Date()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const isExpiringSoon = daysUntilExpiration && daysUntilExpiration <= 30 && daysUntilExpiration > 0;

  return (
    <div className="card flex justify-between items-start hover:shadow-md transition-shadow">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-semibold text-gray-900 text-lg">
            {contract.title}
          </h3>
          <ContractStatusBadge status={contract.status} />
          {isExpiringSoon && (
            <span className="text-xs font-medium px-2 py-1 rounded bg-yellow-100 text-yellow-800">
              Expiring in {daysUntilExpiration} days
            </span>
          )}
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          {contract.client_name && (
            <p>
              <span className="font-medium">Client:</span> {contract.client_name}
            </p>
          )}
          <p>
            <span className="font-medium">Type:</span> {contract.type.charAt(0).toUpperCase() + contract.type.slice(1)}
          </p>
          {contract.value && (
            <p>
              <span className="font-medium">Value:</span> ${parseFloat(contract.value).toFixed(2)}
            </p>
          )}
          <p>
            <span className="font-medium">Start:</span> {format(new Date(contract.start_date), 'MMM dd, yyyy')}
          </p>
          {contract.end_date && (
            <p>
              <span className="font-medium">End:</span> {format(new Date(contract.end_date), 'MMM dd, yyyy')}
            </p>
          )}
        </div>

        {contract.description && (
          <p className="text-sm text-gray-700 mt-3 line-clamp-2">
            {contract.description}
          </p>
        )}
      </div>

      <div className="flex gap-2 ml-4">
        <Link
          to={`/contracts/${contract.id}`}
          className="btn btn-secondary text-sm"
        >
          View
        </Link>
        <button
          onClick={() => onDelete(contract.id)}
          className="btn btn-danger text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
