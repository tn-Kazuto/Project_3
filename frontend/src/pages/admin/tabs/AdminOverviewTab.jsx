import React from 'react';
import { AdminRevenueMetrics } from '../components/AdminRevenueMetrics';

export const AdminOverviewTab = ({
  totalCounts,
  overviewCounts,
  onOpenRecipeModal,
  onOpenTipModal,
  onOpenContestModal,
  onOpenAnnouncementModal,
}) => {
  return (
    <div className="row g-4">
      <div className="col-sm-6 col-xl-3">
        <div
          className="p-4 h-100"
          style={{
            backgroundColor: 'var(--dp-color-ground-2)',
            border: '1px solid var(--dp-color-panel-line)',
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-uppercase small fw-semibold font-monospace" style={{ letterSpacing: '0.12em' }}>Total Recipes</span>
            <span className="font-monospace small text-muted">I.</span>
          </div>
          <h2 className="brand-font display-5 fw-bold mb-1 text-dark">{totalCounts.recipes}</h2>
          <div className="small font-monospace text-muted">
            <span className="fw-semibold text-success">{overviewCounts.recipeFree} Free</span> &middot;{' '}
            <span className="fw-semibold text-dark">{overviewCounts.recipeMembers} Members</span>
          </div>
        </div>
      </div>

      <div className="col-sm-6 col-xl-3">
        <div
          className="p-4 h-100"
          style={{
            backgroundColor: 'var(--dp-color-ground-2)',
            border: '1px solid var(--dp-color-panel-line)',
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-uppercase small fw-semibold font-monospace" style={{ letterSpacing: '0.12em' }}>Cooking Tips</span>
            <span className="font-monospace small text-muted">II.</span>
          </div>
          <h2 className="brand-font display-5 fw-bold mb-1 text-dark">{totalCounts.tips}</h2>
          <div className="small font-monospace text-muted">
            <span className="fw-semibold text-success">{overviewCounts.tipFree} Free</span> &middot;{' '}
            <span className="fw-semibold text-dark">{overviewCounts.tipMembers} Members</span>
          </div>
        </div>
      </div>

      {/* Featured Charcoal Stat Card: Contests */}
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
            <span className="text-uppercase small fw-semibold font-monospace" style={{ letterSpacing: '0.12em', color: 'var(--dp-color-accent)' }}>
              Culinary Contests
            </span>
            <span className="font-monospace small" style={{ color: 'var(--dp-color-accent)' }}>III.</span>
          </div>
          <h2 className="brand-font display-5 fw-bold mb-1 text-white">{totalCounts.contests}</h2>
          <div className="small font-monospace" style={{ color: 'var(--dp-color-on-field-2)' }}>
            <span className="fw-semibold text-success">{overviewCounts.contestsActive} Active</span> &middot;{' '}
            <span>{overviewCounts.contestSubmissions} Total Submissions</span>
          </div>
        </div>
      </div>

      <div className="col-sm-6 col-xl-3">
        <div
          className="p-4 h-100"
          style={{
            backgroundColor: 'var(--dp-color-ground-2)',
            border: '1px solid var(--dp-color-panel-line)',
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-uppercase small fw-semibold font-monospace" style={{ letterSpacing: '0.12em' }}>Feedbacks & Reviews</span>
            <span className="font-monospace small text-muted">IV.</span>
          </div>
          <h2 className="brand-font display-5 fw-bold mb-1 text-dark">{totalCounts.feedback}</h2>
          <div className="small font-monospace text-muted">
            <span>{overviewCounts.recipeFeedback} Recipe Reviews</span> &middot;{' '}
            <span>{overviewCounts.siteFeedback} Site Feedbacks</span>
          </div>
        </div>
      </div>

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
              onClick={onOpenRecipeModal}
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
              onClick={onOpenTipModal}
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
              onClick={onOpenContestModal}
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
              onClick={onOpenAnnouncementModal}
            >
              + Publish Announcement
            </button>
          </div>
        </div>
      </div>

      {/* Executive Treasury & Membership Revenue Analytics */}
      <AdminRevenueMetrics />

      {/* Executive Atelier Intelligence & Architecture Metrics */}
      <div className="col-12 mt-4">
        <div
          className="p-4"
          style={{
            backgroundColor: 'var(--dp-color-ground-2)',
            border: '1px solid var(--dp-color-panel-line)',
          }}
        >
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--dp-color-panel-line)' }}>
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
                <div className="roman-numeral mb-1" style={{ fontSize: '0.75rem' }}>TOTAL ASSETS</div>
                <div className="brand-font h4 mb-0 text-dark">{totalCounts.recipes + totalCounts.tips} Master Items</div>
                <small className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                  {totalCounts.recipes} Recipes &middot; {totalCounts.tips} Tips
                </small>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="p-3 bg-white border" style={{ borderColor: 'var(--dp-color-rule)' }}>
                <div className="roman-numeral mb-1" style={{ fontSize: '0.75rem' }}>PREMIUM GATEKEEPING</div>
                <div className="brand-font h4 mb-0 text-dark">
                  {overviewCounts.recipeMembers + overviewCounts.tipMembers} VIP Reserved
                </div>
                <small className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                  Protected by JWT & Access Filter
                </small>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="p-3 bg-white border" style={{ borderColor: 'var(--dp-color-rule)' }}>
                <div className="roman-numeral mb-1" style={{ fontSize: '0.75rem' }}>CONTEST ENGAGEMENT</div>
                <div className="brand-font h4 mb-0 text-dark">
                  {overviewCounts.contestSubmissions} Submissions
                </div>
                <small className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                  Across {totalCounts.contests} Official Competitions
                </small>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="p-3 bg-white border" style={{ borderColor: 'var(--dp-color-rule)' }}>
                <div className="roman-numeral mb-1" style={{ fontSize: '0.75rem' }}>COMMUNITY FEEDBACK</div>
                <div className="brand-font h4 mb-0 text-dark">{totalCounts.feedback} Reviews</div>
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
