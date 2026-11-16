import React from 'react';

export const AdminAnnouncementModal = ({
  show = false,
  onClose,
  onSubmit,
  announcementForm,
  setAnnouncementForm,
  contests = [],
}) => {
  if (!show) return null;

  return (
    <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title fw-bold">Publish Official Announcement</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={onSubmit}>
            <div className="modal-body p-4">
              <div className="mb-3">
                <label className="form-label fw-semibold">Announcement Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Official Winner Declaration: Seafood Challenge"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Link to Contest (Optional)</label>
                  <select
                    className="form-select"
                    value={announcementForm.contestId}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, contestId: e.target.value })}
                  >
                    <option value="">None (General News)</option>
                    {contests.map((c) => (
                      <option key={c.contestId} value={c.contestId}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Winner Entry ID (Optional)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Entry ID of winning submission"
                    value={announcementForm.winnerEntryId}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, winnerEntryId: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Announcement Content *</label>
                <textarea
                  className="form-control"
                  rows="5"
                  placeholder="Write announcement body..."
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  required
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary fw-semibold">
                Publish Announcement
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
