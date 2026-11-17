import React from 'react';

export const AdminAnnouncementsTab = ({
  announcements,
  listError,
  onOpenAnnouncementModal,
  onDeleteAnnouncement,
  renderManagementTableState,
  renderManagementPagination,
  onReload,
}) => {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="fw-bold mb-0">Announcements Management</h5>
        <button className="btn btn-secondary btn-sm d-flex align-items-center gap-1" onClick={onOpenAnnouncementModal}>
          + Publish Announcement
        </button>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Title</th>
              <th>Contest Linked</th>
              <th>Winner Declared</th>
              <th>Published Date</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {renderManagementTableState(announcements, 5, 'No announcements have been published yet.', onReload)}
            {!listError && announcements.map((a) => (
              <tr key={a.announcementId}>
                <td className="fw-bold text-dark">{a.title}</td>
                <td>{a.contestTitle || <span className="text-muted">—</span>}</td>
                <td>
                  {a.winnerName ? (
                    <span className="badge bg-warning text-dark fw-bold">
                      {a.winnerName}
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="small text-muted">{new Date(a.publishedAt).toLocaleDateString()}</td>
                <td className="text-end">
                  <button
                    className="btn btn-sm btn-outline-danger"
                    title="Delete Announcement"
                    onClick={() => onDeleteAnnouncement(a.announcementId, a.title)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderManagementPagination('announcements', 'Announcements')}
    </div>
  );
};
