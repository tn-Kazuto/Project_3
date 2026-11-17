import React from 'react';

export const HomeMasterclassesSection = ({ fallbackImage }) => {
  return (
    <section className="field-taupe py-5" style={{ backgroundColor: 'var(--dp-color-ground-2)' }}>
      <div className="container py-lg-4">
        <div className="row g-5">
          <div className="col-lg-4">
            <div className="roman-numeral mb-2">II &middot; MASTERCLASSES</div>
            <h2 className="brand-font display-6 mb-3">Masterclasses &amp; Tasting Atelier</h2>
            <p style={{ color: 'var(--dp-color-ink-2)', lineHeight: '1.7' }}>
              Intensive in-person workshops curated for epicurean enthusiasts, aspiring chefs, and passionate home cooks.
            </p>
            <div
              className="p-3 mt-4"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--dp-color-panel-line)',
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="fw-semibold small text-uppercase" style={{ letterSpacing: '0.12em', color: 'var(--dp-color-accent, #b69355)' }}>
                  Exclusive Member Privilege
                </span>
              </div>
              <p className="small mb-0" style={{ color: 'var(--dp-color-ink-2)' }}>
                Free booking inquiries and prioritized registration available for registered members!
              </p>
            </div>

            <div className="mt-4 overflow-hidden border" style={{ borderColor: 'var(--dp-color-rule)' }}>
              <img
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
                alt="Live Culinary Masterclass"
                className="w-100"
                style={{ height: '170px', objectFit: 'cover' }}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackImage;
                }}
              />
              <div className="p-2 text-center" style={{ backgroundColor: 'var(--dp-color-field)', color: 'var(--dp-color-on-field)' }}>
                <span className="font-monospace small text-uppercase" style={{ letterSpacing: '0.14em', fontSize: '0.75rem' }}>
                  THE GRAND PALACE &middot; STUDIO KITCHEN
                </span>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            {/* Ruled Rows Pattern */}
            <div className="ruled-row d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div className="d-flex align-items-start gap-3">
                <span className="font-monospace fw-bold text-muted mt-1 flex-shrink-0">I.</span>
                <div>
                  <h5 className="brand-font mb-1">Weekend Schedule & Tasting Sessions</h5>
                  <p className="small mb-0" style={{ color: 'var(--dp-color-ink-2)' }}>
                    Curriculum tasting sessions (10:00 AM – 3:00 PM) with 5-course tasting menu preparation
                  </p>
                </div>
              </div>
              <span className="badge bg-light text-dark font-monospace align-self-start align-self-md-center">
                10 AM - 3 PM
              </span>
            </div>

            <div className="ruled-row d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div className="d-flex align-items-start gap-3">
                <span className="font-monospace fw-bold text-muted mt-1 flex-shrink-0">II.</span>
                <div>
                  <h5 className="brand-font mb-1">Four Fundamental Culinary Pillars</h5>
                  <p className="small mb-0" style={{ color: 'var(--dp-color-ink-2)' }}>
                    Focus on Italian Pastas, Gourmet Meats & Fresh Juice Blends, and Seasonal Plant-Forward Gastronomy
                  </p>
                </div>
              </div>
              <span className="badge bg-light text-dark font-monospace align-self-start align-self-md-center">
                CURRICULUM
              </span>
            </div>

            <div className="ruled-row d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div className="d-flex align-items-start gap-3">
                <span className="font-monospace fw-bold text-muted mt-1 flex-shrink-0">III.</span>
                <div>
                  <h5 className="brand-font mb-1">Intimate Atelier Setting</h5>
                  <p className="small mb-0" style={{ color: 'var(--dp-color-ink-2)' }}>
                    Small groups (max 12 seats) for personalized mentorship directly from Chef James Thew
                  </p>
                </div>
              </div>
              <span className="badge bg-light text-dark font-monospace align-self-start align-self-md-center">
                MAX 12 SEATS
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
