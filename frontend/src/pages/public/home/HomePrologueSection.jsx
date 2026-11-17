import React from 'react';
import { Link } from 'react-router-dom';

export const HomePrologueSection = ({ fallbackImage }) => {
  return (
    <>
      {/* ── SECTION I: ARCHITECTURAL HERO (Warm Alabaster Ground with Spine) ── */}
      <section className="py-5 border-bottom" style={{ borderColor: 'var(--dp-color-rule)' }}>
        <div className="container py-lg-4">
          <div className="row g-5 align-items-center">
            {/* Margin & Main Editorial Text (Columns 1-7) */}
            <div className="col-lg-7">
              <div className="d-flex align-items-center gap-3 mb-3">
                <span className="roman-numeral">I &middot; PROLOGUE</span>
                <span className="text-uppercase small fw-bold" style={{ letterSpacing: '0.16em', color: 'var(--dp-color-accent-text)' }}>
                  5-Star Executive Chef &middot; Author &middot; Host
                </span>
              </div>

              <h1
                className="brand-font mb-4"
                style={{
                  fontSize: 'clamp(2.75rem, 5.5vw, 4.5rem)',
                  lineHeight: '1.02',
                  letterSpacing: '-0.02em',
                  color: 'var(--dp-color-ink)',
                }}
              >
                Chef James Thew
              </h1>

              <p className="lead mb-4 drop-cap" style={{ color: 'var(--dp-color-ink-2)', lineHeight: '1.75' }}>
                Explore 5-star culinary techniques, artisanal recipes, and weekend masterclasses hosted by Executive Chef James Thew across Juices, Vegetarian, Non-Vegetarian, and Italian cuisines.
              </p>

              <div className="d-flex flex-wrap gap-3 pt-2">
                <Link
                  to="/recipes"
                  className="btn btn-primary btn-lg px-4"
                  style={{
                    backgroundColor: 'var(--dp-color-field)',
                    color: 'var(--dp-color-on-field)',
                    letterSpacing: '0.16em',
                  }}
                >
                  <span>Explore Recipes</span>
                </Link>
                <Link
                  to="/register"
                  className="btn btn-outline-secondary btn-lg px-4"
                  style={{
                    borderColor: 'var(--dp-color-accent)',
                    color: 'var(--dp-color-ink)',
                    letterSpacing: '0.16em',
                  }}
                >
                  Join Member Club ($10/mo)
                </Link>
              </div>

              {/* 5-Star Hotel Atelier Credentials Bar */}
              <div className="row g-3 pt-4 border-top mt-4" style={{ borderColor: 'var(--dp-color-rule)' }}>
                <div className="col-6 col-md-3">
                  <div className="font-monospace small fw-bold text-uppercase" style={{ color: 'var(--dp-color-accent)' }}>
                    3-Michelin
                  </div>
                  <div className="small" style={{ color: 'var(--dp-color-ink-2)' }}>Technique Standard</div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="font-monospace small fw-bold text-uppercase" style={{ color: 'var(--dp-color-accent)' }}>
                    5-Star Hotel
                  </div>
                  <div className="small" style={{ color: 'var(--dp-color-ink-2)' }}>Grand Palace Residency</div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="font-monospace small fw-bold text-uppercase" style={{ color: 'var(--dp-color-accent)' }}>
                    18+ Master
                  </div>
                  <div className="small" style={{ color: 'var(--dp-color-ink-2)' }}>Tested Recipes</div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="font-monospace small fw-bold text-uppercase" style={{ color: 'var(--dp-color-accent)' }}>
                    VIP Atelier
                  </div>
                  <div className="small" style={{ color: 'var(--dp-color-ink-2)' }}>Member Privileges</div>
                </div>
              </div>
            </div>

            {/* Editorial Portrait Column (Columns 8-12) */}
            <div className="col-lg-5">
              <div
                className="p-3"
                style={{
                  backgroundColor: 'var(--dp-color-ground-2)',
                  border: '1px solid var(--dp-color-panel-line)',
                }}
              >
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <img
                    src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80"
                    alt="Chef James Thew Culinary Atelier"
                    className="img-fluid w-100"
                    style={{
                      maxHeight: '460px',
                      objectFit: 'cover',
                      filter: 'grayscale(15%) contrast(105%)',
                    }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallbackImage;
                    }}
                  />
                  <div
                    className="p-3"
                    style={{
                      backgroundColor: 'var(--dp-color-field)',
                      color: 'var(--dp-color-on-field)',
                      borderTop: '1px solid var(--dp-color-accent)',
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="small text-uppercase fw-semibold" style={{ letterSpacing: '0.16em' }}>
                        The Grand Palace Atelier
                      </span>
                      <span className="roman-numeral" style={{ fontSize: '0.9rem' }}>EST. 2012</span>
                    </div>
                    <div className="mt-1 small font-monospace text-white-50" style={{ fontSize: '0.75rem' }}>
                      Fifth Avenue Atelier Suite &bull; Private Chef Residence
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
