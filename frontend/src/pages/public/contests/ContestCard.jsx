import React from 'react';

export const ContestCard = ({ contest, onOpenVoting, onOpenSubmit }) => {
  const isEnded = !contest.isActive || new Date(contest.endDate) < new Date();

  return (
    <div className="col-lg-6">
      <div
        className="card h-100 p-4 d-flex flex-column atelier-card-hover"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--dp-color-rule)',
          borderTop: '2px solid var(--dp-color-accent)',
          borderRadius: 0,
        }}
      >
        <div className="d-flex justify-content-between align-items-start mb-3">
          <span
            className="badge font-monospace"
            style={{
              backgroundColor: 'var(--dp-color-field)',
              color: 'var(--dp-color-on-field)',
              borderRadius: 0,
            }}
          >
            {contest.contestType === 'RECIPE' ? 'Recipe Contest' : 'Tip Contest'}
          </span>
          <span
            className="badge font-monospace"
            style={{
              backgroundColor: isEnded ? 'var(--dp-color-ink-2)' : '#1b4d3e',
              color: '#ffffff',
              borderRadius: 0,
            }}
          >
            {isEnded ? 'Closed' : 'Active & Open'}
          </span>
        </div>

        <h3 className="brand-font mb-2 text-dark" style={{ fontSize: '1.45rem' }}>
          {contest.title}
        </h3>
        <p className="text-muted small flex-grow-1 mb-4" style={{ whiteSpace: 'pre-line', lineHeight: '1.7' }}>
          {contest.description}
        </p>

        <div
          className="p-3 mb-4 small"
          style={{
            backgroundColor: 'var(--dp-color-ground-2)',
            border: '1px solid var(--dp-color-panel-line)',
          }}
        >
          <div className="row g-2">
            <div className="col-sm-6">
              <span><strong>Starts:</strong> {new Date(contest.startDate).toLocaleDateString()}</span>
            </div>
            <div className="col-sm-6">
              <span><strong>Ends:</strong> {new Date(contest.endDate).toLocaleDateString()}</span>
            </div>
            <div className="col-12 mt-2 pt-2 border-top d-flex justify-content-between" style={{ borderColor: 'var(--dp-color-panel-line)' }}>
              <span><strong>Curated by:</strong> {contest.creatorName || 'Chef James Thew'}</span>
              <span className="font-monospace fw-semibold" style={{ color: 'var(--dp-color-accent-text)' }}>
                {contest.entryCount || 0} Submissions
              </span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-2 d-flex flex-column gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary w-100 font-monospace text-uppercase"
            style={{
              borderColor: 'var(--dp-color-rule)',
              color: 'var(--dp-color-ink)',
              borderRadius: 0,
              fontSize: '0.8rem',
              letterSpacing: '0.12em',
            }}
            onClick={() => onOpenVoting(contest)}
          >
            <span>View Entries & Vote ({contest.entryCount || 0})</span>
          </button>

          {isEnded ? (
            <button className="btn btn-outline-secondary w-100" disabled style={{ borderRadius: 0 }}>
              Contest has Closed
            </button>
          ) : (
            <button
              className="btn btn-primary w-100 fw-semibold"
              style={{
                backgroundColor: 'var(--dp-color-field)',
                color: 'var(--dp-color-on-field)',
                letterSpacing: '0.14em',
                borderRadius: 0,
              }}
              onClick={() => onOpenSubmit(contest)}
            >
              Submit Your Entry Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
