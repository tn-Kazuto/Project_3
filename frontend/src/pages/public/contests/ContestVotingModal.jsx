import React from 'react';
import { CulinarySkeleton } from '../../../components/common/CulinarySkeleton';

export const ContestVotingModal = ({
  selectedContestForVoting,
  onClose,
  votingEntries,
  loadingVotingEntries,
  sortVotesDescending,
  onToggleSort,
  onVote,
  submittingVote,
  voteMessage,
  onOpenSubmitModal,
}) => {
  if (!selectedContestForVoting) return null;

  return (
    <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(38, 35, 33, 0.85)' }}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div
          className="modal-content"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--dp-color-accent)',
            borderRadius: 0,
          }}
        >
          <div
            className="modal-header py-3 px-4 d-flex justify-content-between align-items-center"
            style={{
              backgroundColor: 'var(--dp-color-field)',
              color: 'var(--dp-color-on-field)',
              borderBottom: '1px solid var(--dp-color-accent)',
              borderRadius: 0,
            }}
          >
            <div>
              <span className="font-monospace small text-uppercase" style={{ color: 'var(--dp-color-accent)', letterSpacing: '0.14em' }}>
                COMMUNITY ARENA &middot; TASTING JURY
              </span>
              <h5 className="modal-title brand-font text-white m-0" style={{ fontSize: '1.4rem' }}>
                Entries for: {selectedContestForVoting.title}
              </h5>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body p-4" style={{ backgroundColor: 'var(--dp-color-ground-1)' }}>
            {voteMessage.text && (
              <div className={`alert alert-${voteMessage.type} mb-4`} style={{ borderRadius: 0 }}>
                <span>{voteMessage.text}</span>
              </div>
            )}

            {/* Sub-toolbar: Sort order and Count */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4 p-3 bg-white border" style={{ borderColor: 'var(--dp-color-panel-line)' }}>
              <div className="d-flex align-items-center gap-2">
                <span className="font-monospace small text-muted text-uppercase" style={{ letterSpacing: '0.1em' }}>
                  Submissions:
                </span>
                <span className="badge bg-dark font-monospace" style={{ borderRadius: 0 }}>
                  {votingEntries.length} Entries
                </span>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary font-monospace"
                style={{ borderRadius: 0, letterSpacing: '0.08em' }}
                onClick={onToggleSort}
              >
                <span>Order: {sortVotesDescending ? 'Most Voted First' : 'Newest Submissions'}</span>
              </button>
            </div>

            {loadingVotingEntries ? (
              <div className="py-4">
                <CulinarySkeleton count={2} />
              </div>
            ) : votingEntries.length === 0 ? (
              <div className="text-center py-5 bg-white border p-4" style={{ borderColor: 'var(--dp-color-panel-line)' }}>
                <h5 className="brand-font text-dark mb-2">No Submissions Yet</h5>
                <p className="text-muted small mb-3">Be the first culinarian to enter this contest and collect community votes!</p>
                <button
                  className="btn btn-primary btn-sm px-3"
                  style={{
                    backgroundColor: 'var(--dp-color-field)',
                    color: 'var(--dp-color-on-field)',
                    borderRadius: 0,
                  }}
                  onClick={() => {
                    onClose();
                    onOpenSubmitModal(selectedContestForVoting);
                  }}
                >
                  Submit An Entry Now
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {votingEntries.map((entry, idx) => {
                  const isTopVoted = idx === 0 && sortVotesDescending && (entry.voteCount || 0) > 0;
                  return (
                    <div key={entry.entryId} className="col-12 col-lg-6">
                      <div
                        className="card h-100 shadow-sm atelier-card-hover"
                        style={{
                          backgroundColor: '#ffffff',
                          border: isTopVoted ? '1px solid var(--dp-color-accent)' : '1px solid var(--dp-color-panel-line)',
                          borderRadius: 0,
                        }}
                      >
                        <div className="card-body p-4 d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className="font-monospace small text-muted">
                              by {entry.participantName || entry.guestName || 'Anonymous Culinarian'}
                            </span>
                            {isTopVoted && (
                              <span
                                className="badge font-monospace"
                                style={{
                                  backgroundColor: 'var(--dp-color-accent)',
                                  color: 'var(--dp-color-field)',
                                  borderRadius: 0,
                                  fontSize: '0.75rem',
                                }}
                              >
                                ★ Community Favorite
                              </span>
                            )}
                          </div>

                          <h4 className="brand-font text-dark mb-3" style={{ fontSize: '1.25rem' }}>
                            {entry.title}
                          </h4>

                          {entry.ingredients && (
                            <div className="mb-3 small">
                              <strong className="text-dark d-block mb-1">Key Ingredients:</strong>
                              <p className="text-muted mb-0" style={{ whiteSpace: 'pre-line', maxHeight: '100px', overflowY: 'auto' }}>
                                {entry.ingredients}
                              </p>
                            </div>
                          )}

                          {entry.cookingProcedure && (
                            <div className="mb-3 small flex-grow-1">
                              <strong className="text-dark d-block mb-1">Cooking Method:</strong>
                              <p className="text-muted mb-0" style={{ whiteSpace: 'pre-line', maxHeight: '120px', overflowY: 'auto' }}>
                                {entry.cookingProcedure}
                              </p>
                            </div>
                          )}

                          {entry.tipContent && (
                            <div className="mb-3 small flex-grow-1">
                              <strong className="text-dark d-block mb-1">Culinary Tip:</strong>
                              <p className="text-muted mb-0" style={{ whiteSpace: 'pre-line', maxHeight: '120px', overflowY: 'auto' }}>
                                {entry.tipContent}
                              </p>
                            </div>
                          )}

                          <div
                            className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center"
                            style={{ borderColor: 'var(--dp-color-panel-line)' }}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <span style={{ color: '#b69355', fontSize: '1.1rem' }}>♥</span>
                              <span className="font-monospace fw-bold" style={{ color: 'var(--dp-color-ink)', fontSize: '1.05rem' }}>
                                {entry.voteCount || 0}
                              </span>
                              <span className="text-muted small">votes</span>
                            </div>

                            <div>
                              {entry.hasUserVoted ? (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-success font-monospace"
                                  disabled
                                  style={{ borderRadius: 0, fontSize: '0.8rem', letterSpacing: '0.08em' }}
                                >
                                  ✓ You Voted
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-primary font-monospace"
                                  disabled={submittingVote}
                                  onClick={() => onVote(entry)}
                                  style={{
                                    backgroundColor: 'var(--dp-color-field)',
                                    color: 'var(--dp-color-on-field)',
                                    borderRadius: 0,
                                    fontSize: '0.8rem',
                                    letterSpacing: '0.1em',
                                  }}
                                >
                                  Vote for Entry
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="modal-footer px-4 py-3 bg-white border-top" style={{ borderColor: 'var(--dp-color-rule)' }}>
            <button
              type="button"
              className="btn btn-outline-secondary font-monospace"
              style={{ borderRadius: 0, letterSpacing: '0.1em' }}
              onClick={onClose}
            >
              Close Arena
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
