import React from 'react';

export const AdminHeader = ({ loadAllDashboardData, statusMessage, setStatusMessage }) => {
  return (
    <>
      <div
        className="d-flex flex-wrap justify-content-between align-items-end mb-4 pb-3 border-bottom"
        style={{ borderColor: 'var(--dp-color-rule)' }}
      >
        <div>
          <div className="roman-numeral mb-1">EXECUTIVE &middot; ADMINISTRATIVE NEXUS</div>
          <span
            className="badge font-monospace mb-2 px-3 py-1"
            style={{
              backgroundColor: 'var(--dp-color-field)',
              color: 'var(--dp-color-accent)',
              borderRadius: 0,
              border: '1px solid var(--dp-color-accent)',
            }}
          >
            Master Chef Administration
          </span>
          <h1 className="brand-font display-6 fw-bold mb-1 text-dark">Chef James Thew Executive Dashboard</h1>
          <p className="text-muted mb-0 small">
            Complete platform management for recipes, contests, announcements, and feedbacks.
          </p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
            style={{ borderRadius: 0, borderColor: 'var(--dp-color-rule)', letterSpacing: '0.12em' }}
            onClick={loadAllDashboardData}
          >
            Refresh
          </button>
        </div>
      </div>

      {statusMessage?.text && (
        <div
          className={`alert alert-${statusMessage.type} alert-dismissible fade show d-flex align-items-center gap-2`}
          role="alert"
          style={{ borderRadius: 0 }}
        >
          <span>{statusMessage.text}</span>
          <button type="button" className="btn-close" onClick={() => setStatusMessage({ type: '', text: '' })}></button>
        </div>
      )}
    </>
  );
};
