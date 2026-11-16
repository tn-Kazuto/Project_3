import React from 'react';

export const AdminFeedbackTab = ({
  feedbacks = [],
  filteredFeedbacks = [],
  feedbackFilter = 'ALL',
  setFeedbackFilter,
  handleDeleteFeedback,
}) => {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <h5 className="fw-bold mb-0">User Reviews & Feedback</h5>
        <div className="btn-group btn-group-sm">
          <button
            className={`btn ${feedbackFilter === 'ALL' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFeedbackFilter('ALL')}
          >
            All ({feedbacks.length})
          </button>
          <button
            className={`btn ${feedbackFilter === 'RECIPE' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFeedbackFilter('RECIPE')}
          >
            Recipe Reviews ({feedbacks.filter((f) => f.recipeId).length})
          </button>
          <button
            className={`btn ${feedbackFilter === 'GENERAL' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFeedbackFilter('GENERAL')}
          >
            Website Feedback ({feedbacks.filter((f) => !f.recipeId).length})
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
            {filteredFeedbacks.map((f) => (
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
                    <a
                      href={f.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-secondary"
                      style={{ fontSize: '0.75rem' }}
                    >
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
                    onClick={() => handleDeleteFeedback(f.feedbackId)}
                    title="Delete feedback"
                    aria-label="Delete feedback"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
