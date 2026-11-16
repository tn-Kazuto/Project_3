import React from 'react';

export const AdminOverviewTab = ({
  recipes = [],
  tips = [],
  contests = [],
  feedbacks = [],
  setShowRecipeModal,
  setShowTipModal,
  setShowContestModal,
  setShowAnnouncementModal,
}) => {
  return (
    <div className="row g-4">
      {/* 1. Total Recipes Card */}
      <div className="col-sm-6 col-xl-3">
        <div
          className="p-4 h-100"
          style={{
            backgroundColor: 'var(--dp-color-ground-2)',
            border: '1px solid var(--dp-color-panel-line)',
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-uppercase small fw-semibold font-monospace" style={{ letterSpacing: '0.12em' }}>
              Total Recipes
            </span>
            <span className="font-monospace small text-muted">I.</span>
          </div>
          <h2 className="brand-font display-5 fw-bold mb-1 text-dark">{recipes.length}</h2>
          <div className="small font-monospace text-muted">
            <span className="fw-semibold text-success">{recipes.filter((r) => r.isFree).length} Free</span> &middot;{' '}
            <span className="fw-semibold text-dark">{recipes.filter((r) => !r.isFree).length} Members</span>
          </div>
        </div>
      </div>

      {/* 2. Cooking Tips Card */}
      <div className="col-sm-6 col-xl-3">
        <div
          className="p-4 h-100"
          style={{
            backgroundColor: 'var(--dp-color-ground-2)',
            border: '1px solid var(--dp-color-panel-line)',
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-uppercase small fw-semibold font-monospace" style={{ letterSpacing: '0.12em' }}>
              Cooking Tips
            </span>
            <span className="font-monospace small text-muted">II.</span>
          </div>
          <h2 className="brand-font display-5 fw-bold mb-1 text-dark">{tips.length}</h2>
          <div className="small font-monospace text-muted">
            <span className="fw-semibold text-success">{tips.filter((t) => t.isFree).length} Free</span> &middot;{' '}
            <span className="fw-semibold text-dark">{tips.filter((t) => !t.isFree).length} Members</span>
          </div>
        </div>
      </div>

      {/* 3. Featured Charcoal Stat Card: Contests */}
      <div className="col-sm-6 col-xl-3">
        <div
          className="p-4 h-100"
          style={{
            backgroundColor: 'var(--dp-color-field)',
            color: 'var(--dp-color-on-field)',
            border: '1px solid var(--dp-color-accent)',
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span
              className="text-uppercase small fw-semibold font-monospace"
              style={{ letterSpacing: '0.12em', color: 'var(--dp-color-accent)' }}
            >
              Culinary Contests
            </span>
            <span className="font-monospace small" style={{ color: 'var(--dp-color-accent)' }}>
              III.
            </span>
          </div>
          <h2 className="brand-font display-5 fw-bold mb-1 text-white">{contests.length}</h2>
          <div className="small font-monospace" style={{ color: 'var(--dp-color-on-field-2)' }}>
            <span className="fw-semibold text-success">{contests.filter((c) => c.isActive).length} Active</span> &middot;{' '}
            <span>{contests.reduce((acc, c) => acc + (c.entryCount || 0), 0)} Total Submissions</span>
          </div>
        </div>
      </div>

      {/* 4. Feedbacks & Reviews Card */}
      <div className="col-sm-6 col-xl-3">
        <div
          className="p-4 h-100"
          style={{
            backgroundColor: 'var(--dp-color-ground-2)',
            border: '1px solid var(--dp-color-panel-line)',
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-uppercase small fw-semibold font-monospace" style={{ letterSpacing: '0.12em' }}>
              Feedbacks & Reviews
            </span>
            <span className="font-monospace small text-muted">IV.</span>
          </div>
          <h2 className="brand-font display-5 fw-bold mb-1 text-dark">{feedbacks.length}</h2>
          <div className="small font-monospace text-muted">
            <span>{feedbacks.filter((f) => f.recipeId).length} Recipe Reviews</span> &middot;{' '}
            <span>{feedbacks.filter((f) => !f.recipeId).length} Site Feedbacks</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="col-12 mt-4">
        <div
          className="p-4"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--dp-color-rule)',
          }}
        >
          <div className="mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--dp-color-rule)' }}>
            <h5 className="brand-font mb-0 text-dark">Quick Actions</h5>
          </div>
          <div className="d-flex flex-wrap gap-3">
            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              style={{
                backgroundColor: 'var(--dp-color-field)',
                color: 'var(--dp-color-on-field)',
                letterSpacing: '0.12em',
                borderRadius: 0,
              }}
              onClick={() => setShowRecipeModal(true)}
            >
              + New Recipe
            </button>
            <button
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              style={{
                borderColor: 'var(--dp-color-rule)',
                color: 'var(--dp-color-ink)',
                letterSpacing: '0.12em',
                borderRadius: 0,
              }}
              onClick={() => setShowTipModal(true)}
            >
              + New Cooking Tip
            </button>
            <button
              className="btn btn-warning text-white fw-semibold d-flex align-items-center gap-2"
              style={{
                backgroundColor: 'var(--dp-color-accent)',
                borderColor: 'var(--dp-color-accent)',
                letterSpacing: '0.12em',
                borderRadius: 0,
              }}
              onClick={() => setShowContestModal(true)}
            >
              + Launch Contest
            </button>
            <button
              className="btn btn-outline-dark d-flex align-items-center gap-2"
              style={{
                borderColor: 'var(--dp-color-accent)',
                letterSpacing: '0.12em',
                borderRadius: 0,
              }}
              onClick={() => setShowAnnouncementModal(true)}
            >
              + Publish Announcement
            </button>
          </div>
        </div>
      </div>

      {/* Executive Atelier Intelligence & Architecture Metrics */}
      <div className="col-12 mt-4">
        <div
          className="p-4"
          style={{
            backgroundColor: 'var(--dp-color-ground-2)',
            border: '1px solid var(--dp-color-panel-line)',
          }}
        >
          <div
            className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom"
            style={{ borderColor: 'var(--dp-color-panel-line)' }}
          >
            <div>
              <h5 className="brand-font mb-0 text-dark">Executive Atelier Architecture & System Metrics</h5>
            </div>
            <span
              className="badge font-monospace"
              style={{
                backgroundColor: 'var(--dp-color-field)',
                color: 'var(--dp-color-accent)',
                border: '1px solid var(--dp-color-accent)',
                borderRadius: 0,
              }}
            >
              100% Operational Integrity
            </span>
          </div>

          <div className="row g-3">
            <div className="col-md-3 col-sm-6">
              <div className="p-3 bg-white border" style={{ borderColor: 'var(--dp-color-rule)' }}>
                <div className="roman-numeral mb-1" style={{ fontSize: '0.75rem' }}>
                  TOTAL ASSETS
                </div>
                <div className="brand-font h4 mb-0 text-dark">{recipes.length + tips.length} Master Items</div>
                <small className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                  {recipes.length} Recipes &middot; {tips.length} Tips
                </small>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="p-3 bg-white border" style={{ borderColor: 'var(--dp-color-rule)' }}>
                <div className="roman-numeral mb-1" style={{ fontSize: '0.75rem' }}>
                  PREMIUM GATEKEEPING
                </div>
                <div className="brand-font h4 mb-0 text-dark">
                  {recipes.filter((r) => !r.isFree).length + tips.filter((t) => !t.isFree).length} VIP Reserved
                </div>
                <small className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                  Protected by JWT & Access Filter
                </small>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="p-3 bg-white border" style={{ borderColor: 'var(--dp-color-rule)' }}>
                <div className="roman-numeral mb-1" style={{ fontSize: '0.75rem' }}>
                  CONTEST ENGAGEMENT
                </div>
                <div className="brand-font h4 mb-0 text-dark">
                  {contests.reduce((acc, c) => acc + (c.entryCount || 0), 0)} Submissions
                </div>
                <small className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                  Across {contests.length} Official Competitions
                </small>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="p-3 bg-white border" style={{ borderColor: 'var(--dp-color-rule)' }}>
                <div className="roman-numeral mb-1" style={{ fontSize: '0.75rem' }}>
                  COMMUNITY FEEDBACK
                </div>
                <div className="brand-font h4 mb-0 text-dark">{feedbacks.length} Reviews</div>
                <small className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                  Two-Way Atelier Communication
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
