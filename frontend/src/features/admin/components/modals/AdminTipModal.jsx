import React from 'react';

export const AdminTipModal = ({
  show = false,
  onClose,
  onSubmit,
  tipForm,
  setTipForm,
  categories = [],
}) => {
  if (!show) return null;

  return (
    <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-info text-white">
            <h5 className="modal-title fw-bold">Add New Culinary Tip</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={onSubmit}>
            <div className="modal-body p-4">
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label fw-semibold">Tip Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Master Chef Knife Sharpening Angle"
                    value={tipForm.title}
                    onChange={(e) => setTipForm({ ...tipForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Category *</label>
                  <select
                    className="form-select"
                    value={tipForm.categoryId}
                    onChange={(e) => setTipForm({ ...tipForm, categoryId: e.target.value })}
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Tip Content & Technique *</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Describe the kitchen tip or culinary technique..."
                    value={tipForm.content}
                    onChange={(e) => setTipForm({ ...tipForm, content: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="col-12">
                  <div className="form-check form-switch p-3 bg-light rounded-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="adminTipIsFreeSwitch"
                      checked={tipForm.isFree}
                      onChange={(e) => setTipForm({ ...tipForm, isFree: e.target.checked })}
                    />
                    <label className="form-check-label fw-semibold ms-2" htmlFor="adminTipIsFreeSwitch">
                      {tipForm.isFree
                        ? '🔓 Free Access (Open to Guests)'
                        : '🔒 Members Only (Paid Subscription)'}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-info text-white fw-semibold">
                Save Cooking Tip
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
