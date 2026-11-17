import React from 'react';

export const ContestSubmitModal = ({
  selectedContest,
  onClose,
  onSubmit,
  formData,
  setFormData,
  submitting,
  submitSuccess,
  submitError,
  isAuthenticated,
  user,
}) => {
  if (!selectedContest) return null;

  return (
    <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(38, 35, 33, 0.7)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div
          className="modal-content"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--dp-color-accent)',
            borderRadius: 0,
          }}
        >
          <div
            className="modal-header py-3 px-4"
            style={{
              backgroundColor: 'var(--dp-color-field)',
              color: 'var(--dp-color-on-field)',
              borderBottom: '1px solid var(--dp-color-accent)',
              borderRadius: 0,
            }}
          >
            <h5 className="modal-title brand-font text-white m-0" style={{ fontSize: '1.25rem' }}>
              Submit to: {selectedContest.title}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body p-4">
            {submitSuccess ? (
              <div className="text-center py-4">
                <div className="text-success font-monospace fw-bold fs-4 mb-3">[SUCCESS]</div>
                <h4 className="brand-font text-dark mb-2">Submission Received!</h4>
                <p className="text-muted mb-4">{submitSuccess}</p>
                <button
                  className="btn btn-primary px-4 py-2"
                  style={{
                    backgroundColor: 'var(--dp-color-field)',
                    color: 'var(--dp-color-on-field)',
                    letterSpacing: '0.14em',
                    borderRadius: 0,
                  }}
                  onClick={onClose}
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit}>
                {submitError && (
                  <div className="alert alert-danger mb-3" style={{ borderRadius: 0 }}>
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Submitter Info Notice */}
                {isAuthenticated ? (
                  <div
                    className="p-3 mb-3 small"
                    style={{
                      backgroundColor: 'var(--dp-color-ground-2)',
                      border: '1px solid var(--dp-color-panel-line)',
                    }}
                  >
                    <span>
                      Submitting as registered member: <strong>{user?.fullName}</strong> ({user?.email})
                    </span>
                  </div>
                ) : (
                  <div
                    className="p-3 mb-3"
                    style={{
                      backgroundColor: 'var(--dp-color-ground-2)',
                      border: '1px solid var(--dp-color-panel-line)',
                    }}
                  >
                    <p className="small text-muted mb-3">
                      <strong className="text-dark">Guest Participant:</strong> No account required to enter! Please provide your name and email so we can reach you when winners are announced.
                    </p>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Your Full Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. John Doe"
                          value={formData.guestName}
                          onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Your Email Address *</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="john@example.com"
                          value={formData.guestEmail}
                          onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submission Title */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Submission Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={
                      selectedContest.contestType === 'RECIPE'
                        ? 'e.g. Authentic Sicilian Truffle Risotto'
                        : 'e.g. Secret to Keeping Herbs Fresh for 3 Weeks'
                    }
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                {/* Dynamic Fields based on contest type */}
                {selectedContest.contestType === 'RECIPE' ? (
                  <>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Ingredients List *</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="- 200g Arborio rice"
                        value={formData.ingredients}
                        onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Step-by-step Cooking Procedure *</label>
                      <textarea
                        className="form-control"
                        rows="6"
                        placeholder="Step 1: Sauté minced shallots"
                        value={formData.cookingProcedure}
                        onChange={(e) => setFormData({ ...formData, cookingProcedure: e.target.value })}
                        required
                      ></textarea>
                    </div>
                  </>
                ) : (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Culinary Tip / Secret *</label>
                    <textarea
                      className="form-control"
                      rows="6"
                      placeholder="Describe your unique kitchen tip"
                      value={formData.tipContent}
                      onChange={(e) => setFormData({ ...formData, tipContent: e.target.value })}
                      required
                    ></textarea>
                  </div>
                )}

                <div className="modal-footer px-0 pb-0 pt-3 border-top" style={{ borderColor: 'var(--dp-color-rule)' }}>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    style={{ borderRadius: 0 }}
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                    style={{
                      backgroundColor: 'var(--dp-color-field)',
                      color: 'var(--dp-color-on-field)',
                      borderRadius: 0,
                      letterSpacing: '0.14em',
                    }}
                  >
                    {submitting ? 'Submitting to Atelier...' : 'Submit Entry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
