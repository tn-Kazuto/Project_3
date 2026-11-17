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
                Welcome to my culinary sanctuary. Working as an executive chef in luxury 5-star hotels,
                hosting culinary television programs, and authoring renowned cookbooks across Juices, Vegetarian,
                Non-Vegetarian, and Italian cuisines. Explore my recipes, take part in competitive cook-offs,
                or join our weekend masterclasses!
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

      {/* ── FIVE-STAR HOTEL DINING SUITES & SALONS SHOWCASE ── */}
      <section className="py-5 border-bottom" style={{ backgroundColor: 'var(--dp-color-ground)', borderColor: 'var(--dp-color-rule)' }}>
        <div className="container py-lg-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--dp-color-rule)' }}>
            <div>
              <span className="font-monospace small text-uppercase" style={{ letterSpacing: '0.14em', color: 'var(--dp-color-accent)' }}>
                THE GRAND PALACE HOSPITALITY &middot; THREE ICONIC SPACES
              </span>
              <h2 className="brand-font display-6 m-0 text-dark">Distinguished Dining Salons</h2>
            </div>
            <span className="small font-monospace text-muted mt-2 mt-md-0">
              RESERVATIONS &middot; PRIVATE DINING &middot; SALON PRIV&Eacute;
            </span>
          </div>

          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card h-100 border-0 bg-white atelier-card-hover" style={{ border: '1px solid var(--dp-color-rule)', borderRadius: 0 }}>
                <div style={{ aspectRatio: '16/10', overflow: 'hidden' }}>
                  <img
                    src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=700&q=80"
                    alt="Le Salon Gastronomique"
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallbackImage;
                    }}
                  />
                </div>
                <div className="p-4 d-flex flex-column flex-grow-1">
                  <span className="font-monospace text-uppercase small" style={{ color: 'var(--dp-color-accent)', letterSpacing: '0.12em' }}>
                    SUITE I &middot; HAUTE CUISINE
                  </span>
                  <h4 className="brand-font mt-2 mb-2" style={{ fontSize: '1.35rem' }}>Le Salon Gastronomique</h4>
                  <p className="small text-muted flex-grow-1 mb-3" style={{ lineHeight: '1.65' }}>
                    The flagship 5-star hotel dining room offering 5-course tasting menus, wine pairings curated by master sommeliers, and classical European tableside service.
                  </p>
                  <div className="border-top pt-2 d-flex justify-content-between align-items-center small font-monospace" style={{ borderColor: 'var(--dp-color-rule)' }}>
                    <span>DÉGUSTATION MENU</span>
                    <span style={{ color: 'var(--dp-color-accent)' }}>&bull; EVENINGS</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card h-100 border-0 bg-white atelier-card-hover" style={{ border: '1px solid var(--dp-color-rule)', borderRadius: 0 }}>
                <div style={{ aspectRatio: '16/10', overflow: 'hidden' }}>
                  <img
                    src="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=700&q=80"
                    alt="The Botanical & Nectar Lounge"
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallbackImage;
                    }}
                  />
                </div>
                <div className="p-4 d-flex flex-column flex-grow-1">
                  <span className="font-monospace text-uppercase small" style={{ color: 'var(--dp-color-accent)', letterSpacing: '0.12em' }}>
                    SUITE II &middot; REJUVENATION
                  </span>
                  <h4 className="brand-font mt-2 mb-2" style={{ fontSize: '1.35rem' }}>The Botanical & Nectar Lounge</h4>
                  <p className="small text-muted flex-grow-1 mb-3" style={{ lineHeight: '1.65' }}>
                    Specialized cold-pressed botanical extractions, antioxidant wellness blends, and bespoke herbal infusions crafted from organic heirloom orchards.
                  </p>
                  <div className="border-top pt-2 d-flex justify-content-between align-items-center small font-monospace" style={{ borderColor: 'var(--dp-color-rule)' }}>
                    <span>COLD-PRESSED JUICES</span>
                    <span style={{ color: 'var(--dp-color-accent)' }}>&bull; ALL DAY</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card h-100 border-0 bg-white atelier-card-hover" style={{ border: '1px solid var(--dp-color-rule)', borderRadius: 0 }}>
                <div style={{ aspectRatio: '16/10', overflow: 'hidden' }}>
                  <img
                    src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=700&q=80"
                    alt="The Chef's Private Atelier"
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallbackImage;
                    }}
                  />
                </div>
                <div className="p-4 d-flex flex-column flex-grow-1">
                  <span className="font-monospace text-uppercase small" style={{ color: 'var(--dp-color-accent)', letterSpacing: '0.12em' }}>
                    SALON III &middot; PRIVATE ATELIER
                  </span>
                  <h4 className="brand-font mt-2 mb-2" style={{ fontSize: '1.35rem' }}>L'Atelier Privé & Studio</h4>
                  <p className="small text-muted flex-grow-1 mb-3" style={{ lineHeight: '1.65' }}>
                    Intimate hands-on workshops with Chef James Thew in the hotel's state-of-the-art studio kitchen. Restricted to 12 participants per session.
                  </p>
                  <div className="border-top pt-2 d-flex justify-content-between align-items-center small font-monospace" style={{ borderColor: 'var(--dp-color-rule)' }}>
                    <span>WEEKEND WORKSHOPS</span>
                    <span style={{ color: 'var(--dp-color-accent)' }}>&bull; 10:00 &ndash; 15:00</span>
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
