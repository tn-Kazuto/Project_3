import React from 'react';

const AdminTableState = ({ colSpan, loading, error, emptyMessage, onRetry }) => {
  if (!loading && !error) {
    return (
      <tr>
        <td colSpan={colSpan} className="text-center text-muted py-5">
          {emptyMessage}
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-5">
        {loading ? (
          <span role="status" className="text-muted">Loading management data…</span>
        ) : (
          <div role="alert" className="d-flex flex-column align-items-center gap-2">
            <span className="text-danger">{error}</span>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={onRetry}>
              Retry
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default AdminTableState;
