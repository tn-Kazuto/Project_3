import React from 'react';

export const ContestGuestVoteModal = ({
  show,
  activeVoteEntry,
  guestVoteEmail,
  setGuestVoteEmail,
  onClose,
  onSubmit,
  submittingVote,
}) => {
  if (!show || !activeVoteEntry) return null;

  return (
    <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(38, 35, 33, 0.8)' }}>
      <div className="modal-dialog modal-dialog-centered">
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
            <h5 className="modal-title brand-font text-white m-0" style={{ fontSize: '1.2rem' }}>
              Confirm Guest Vote
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="modal-body p-4">
              <p className="small text-muted mb-3">
                You are voting for: <strong className="text-dark">"{activeVoteEntry.title}"</strong>
              </p>
              <p className="small text-muted mb-3">
                To maintain contest integrity and prevent duplicate votes, please enter your email address:
              </p>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Your Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. guest@example.com"
                  value={guestVoteEmail}
                  onChange={(e) => setGuestVoteEmail(e.target.value)}
                  required
                  style={{ borderRadius: 0 }}
                />
              </div>
            </div>

            <div className="modal-footer px-4 py-3 bg-white border-top" style={{ borderColor: 'var(--dp-color-panel-line)' }}>
              <button
                type="button"
                className="btn btn-outline-secondary font-monospace"
                style={{ borderRadius: 0 }}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary font-monospace"
                disabled={submittingVote || !guestVoteEmail.trim()}
                style={{
                  backgroundColor: 'var(--dp-color-field)',
                  color: 'var(--dp-color-on-field)',
                  borderRadius: 0,
                  letterSpacing: '0.1em',
                }}
              >
                {submittingVote ? 'Recording...' : 'Cast My Vote'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
