import React from 'react';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const AdminPagination = ({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  disabled = false,
  label = 'management list',
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  const displayedTotalPages = Math.max(1, totalPages);
  const startItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  return (
    <nav
      className="d-flex flex-wrap justify-content-between align-items-center gap-3 p-3"
      aria-label={`${label} pagination`}
    >
      <div className="d-flex flex-wrap align-items-center gap-3">
        <span className="small text-muted" aria-live="polite">
          Showing {startItem}–{endItem} of {totalCount}
        </span>
        <label className="d-flex align-items-center gap-2 small text-muted">
          Rows per page
          <select
            className="form-select form-select-sm w-auto"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            disabled={disabled}
            aria-label={`${label} rows per page`}
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
          aria-label="Previous page"
        >
          Previous
        </button>
        <span className="small text-muted" aria-current="page">
          Page {totalPages === 0 ? 1 : page} of {displayedTotalPages}
        </span>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= totalPages}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </nav>
  );
};

export default AdminPagination;
