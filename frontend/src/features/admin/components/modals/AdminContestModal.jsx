import React from 'react';

export const AdminContestModal = ({
  show = false,
  onClose,
  onSubmit,
  contestForm,
  setContestForm,
}) => {
  if (!show) return null;

  return (
    <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-warning text-dark">
            <h5 className="modal-title fw-bold">Launch New Culinary Contest</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={onSubmit}>
            <div className="modal-body p-4">
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label fw-semibold">Contest Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Master Chef Mediterranean Seafood Cup"
                    value={contestForm.title}
                    onChange={(e) => setContestForm({ ...contestForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Contest Type *</label>
                  <select
                    className="form-select"
                    value={contestForm.contestType}
                    onChange={(e) => setContestForm({ ...contestForm, contestType: e.target.value })}
                    required
                  >
                    <option value="RECIPE">Recipe Contest (Món ăn)</option>
                    <option value="TIP">Tip Contest (Mẹo bếp)</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Contest Description & Rules *</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Explain contest challenge, scoring criteria, and prizes..."
                    value={contestForm.description}
                    onChange={(e) => setContestForm({ ...contestForm, description: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Start Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={contestForm.startDate}
                    onChange={(e) => setContestForm({ ...contestForm, startDate: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">End Date (Submission Deadline) *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={contestForm.endDate}
                    onChange={(e) => setContestForm({ ...contestForm, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-warning text-dark fw-bold">
                Launch Contest
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
