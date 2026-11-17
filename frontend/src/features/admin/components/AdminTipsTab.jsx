import React from 'react';

export const AdminTipsTab = ({
  tips = [],
  setShowTipModal,
  handleToggleTipFree,
  handleDeleteTip,
}) => {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="fw-bold mb-0">Cooking Tips Management</h5>
        <button
          className="btn btn-info text-white btn-sm d-flex align-items-center gap-1"
          onClick={() => setShowTipModal(true)}
        >
          + Add Tip
        </button>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Author</th>
              <th>Access Tier</th>
              <th>Date</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tips.map((t) => (
              <tr key={t.tipId}>
                <td className="fw-bold text-dark" style={{ maxWidth: '360px' }}>
                  <div className="text-truncate" title={t.title}>{t.title}</div>
                </td>
                <td>
                  <span className="badge bg-light text-dark border font-monospace text-uppercase" style={{ fontSize: '0.72rem' }}>
                    {t.categoryName || 'TECHNIQUE'}
                  </span>
                </td>
                <td>{t.authorName || 'James Thew'}</td>
                <td>
                  <span className={`badge ${t.isFree ? 'bg-success' : 'bg-warning text-dark'}`} style={{ fontSize: '0.72rem' }}>
                    {t.isFree ? 'Free Access' : 'Members Only'}
                  </span>
                </td>
                <td className="small text-muted font-monospace">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="text-end">
                  <button
                    className={`btn btn-sm me-2 ${t.isFree ? 'btn-outline-warning' : 'btn-outline-success'}`}
                    title={t.isFree ? 'Set to Members Only' : 'Set to Free Access'}
                    onClick={() => handleToggleTipFree(t)}
                  >
                    {t.isFree ? 'Set Member-only' : 'Set Free'}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    title="Delete Tip"
                    onClick={() => handleDeleteTip(t.tipId, t.title)}
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
