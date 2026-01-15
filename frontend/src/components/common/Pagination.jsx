export default function Pagination({ pagination, onPageChange }) {
  const { page, totalPages, totalItems, limit } = pagination;

  if (totalPages <= 1) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  return (
    <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white border border-gray-200 rounded-md">
      <div className="text-sm text-gray-600">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>

      <div className="flex gap-2">
        <button
          className="btn btn-secondary text-sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>

        <span className="flex items-center px-4 text-sm text-gray-700">
          Page {page} of {totalPages}
        </span>

        <button
          className="btn btn-secondary text-sm"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
