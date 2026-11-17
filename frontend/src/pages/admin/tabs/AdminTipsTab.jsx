import React from 'react';

export const AdminTipsTab = ({
  tips,
  listError,
  onOpenTipModal,
  onToggleTipFree,
  onDeleteTip,
  renderManagementTableState,
  renderManagementPagination,
  onReload,
}) => {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="fw-bold mb-0">Cooking Tips Management</h5>
        <button className="btn btn-info text-white btn-sm d-flex align-items-center gap-1" onClick={onOpenTipModal}>
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
            {renderManagementTableState(tips, 6, 'No cooking tips are available yet.', onReload)}
            {!listError && tips.map((t) => (
              <tr key={t.tipId}>
                <td className="fw-bold text-dark">{t.title}</td>
                <td><span className="badge bg-light text-dark border">{t.categoryName}</span></td>
                <td>{t.authorName}</td>
                <td>
                  <span
                    className="badge font-monospace"
                    style={{
                      backgroundColor: t.isFree ? '#1b4d3e' : '#8a6d3b',
                      color: '#ffffff',
                      borderRadius: 0,
                      fontSize: '0.72rem',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {t.isFree ? 'FREE ACCESS' : 'MEMBERS ONLY'}
                  </span>
                </td>
                <td className="small text-muted font-monospace">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="text-end">
                  <div className="d-flex align-items-center justify-content-end gap-2 text-nowrap">
                    <button
                      className={`btn btn-sm text-nowrap ${t.isFree ? 'btn-outline-warning' : 'btn-outline-success'}`}
                      title={t.isFree ? 'Set to Members Only' : 'Set to Free Access'}
                      onClick={() => onToggleTipFree(t)}
                      style={{ minWidth: '115px' }}
                    >
                      {t.isFree ? 'Set Member-only' : 'Set Free'}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger text-nowrap"
                      title="Delete Tip"
                      onClick={() => onDeleteTip(t.tipId, t.title)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderManagementPagination('tips', 'Cooking tips')}
    </div>
  );
};
