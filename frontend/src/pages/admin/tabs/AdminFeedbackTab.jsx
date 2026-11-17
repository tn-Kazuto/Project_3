import React from 'react';

export const AdminFeedbackTab = ({
  filteredFeedbacks,
  feedbackFilter,
  setFeedbackFilter,
  setListLoading,
  setPages,
  totalCounts,
  overviewCounts,
  pageSize,
  pages,
  listError,
  onDeleteFeedback,
  renderManagementTableState,
  renderManagementPagination,
  loadManagementPage,
}) => {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <h5 className="fw-bold mb-0">User Reviews & Feedback</h5>
        <div className="btn-group btn-group-sm">
          <button
            className={`btn ${feedbackFilter === 'ALL' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => { setListLoading(true); setFeedbackFilter('ALL'); setPages((current) => ({ ...current, feedback: 1 })); }}
          >
            All ({totalCounts.feedback})
          </button>
          <button
            className={`btn ${feedbackFilter === 'RECIPE' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => { setListLoading(true); setFeedbackFilter('RECIPE'); setPages((current) => ({ ...current, feedback: 1 })); }}
          >
            Recipe Reviews ({overviewCounts.recipeFeedback})
          </button>
          <button
            className={`btn ${feedbackFilter === 'GENERAL' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => { setListLoading(true); setFeedbackFilter('GENERAL'); setPages((current) => ({ ...current, feedback: 1 })); }}
          >
            Website Feedback ({overviewCounts.siteFeedback})
          </button>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Sender</th>
              <th>Target</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Media Attachment</th>
              <th>Date</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {renderManagementTableState(filteredFeedbacks, 7, 'No feedback matches this filter yet.', () => loadManagementPage('feedback', pages.feedback, pageSize, feedbackFilter))}
            {!listError && filteredFeedbacks.map((f) => (
              <tr key={f.feedbackId}>
                <td>
                  <div className="fw-semibold">{f.senderName}</div>
                  <small className="text-muted">{f.senderEmail}</small>
                  <div className="mt-1">
                    <span className={`badge ${f.isGuest ? 'bg-secondary' : 'bg-info text-dark'}`}>
                      {f.isGuest ? 'Guest' : 'Member'}
                    </span>
                  </div>
                </td>
                <td>
                  {f.recipeTitle ? (
                    <span className="badge bg-light text-primary border">🍲 Recipe: {f.recipeTitle}</span>
                  ) : (
                    <span className="badge bg-light text-dark border">🌐 General Website</span>
                  )}
                </td>
                <td>
                  {f.rating > 0 ? (
                    <div className="d-flex align-items-center gap-1 font-monospace small" style={{ color: '#b69355' }}>
                      <span>{f.rating} / 5</span>
                    </div>
                  ) : (
                    <span className="text-muted small">-</span>
                  )}
                </td>
                <td style={{ maxWidth: '300px', whiteSpace: 'pre-line' }}>{f.comment}</td>
                <td>
                  {f.mediaUrl ? (
                    <a href={f.mediaUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.75rem' }}>
                      <span>View Media</span>
                    </a>
                  ) : (
                    <span className="text-muted small">None</span>
                  )}
                </td>
                <td className="small text-muted">{new Date(f.createdAt).toLocaleDateString()}</td>
                <td className="text-end">
                  <button
                    className="btn btn-sm btn-outline-danger"
                    title="Delete Feedback"
                    aria-label="Delete feedback"
                    onClick={() => onDeleteFeedback(f.feedbackId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderManagementPagination('feedback', 'Feedback entries')}
    </div>
  );
};
