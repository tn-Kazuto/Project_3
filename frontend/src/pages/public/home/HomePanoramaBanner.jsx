import React from 'react';

export const HomePanoramaBanner = () => {
  return (
    <section
      className="py-5 position-relative text-white overflow-hidden"
      style={{
        backgroundColor: 'var(--dp-color-field)',
        backgroundImage: 'linear-gradient(rgba(28, 26, 23, 0.82), rgba(28, 26, 23, 0.88)), url("https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1600&q=85")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderTop: '1px solid var(--dp-color-accent)',
        borderBottom: '1px solid var(--dp-color-accent)',
      }}
    >
      <div className="container py-lg-4 text-center">
        <div className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-3 border" style={{ borderColor: 'var(--dp-color-accent)', backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
          <span className="font-monospace small text-uppercase" style={{ color: 'var(--dp-color-accent)', letterSpacing: '0.2em' }}>
            HAUTE CUISINE ATELIER &middot; GRAND SIGNATURE
          </span>
        </div>

        <h2
          className="brand-font mb-3 mx-auto text-white"
          style={{
            color: '#ffffff',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
            maxWidth: '850px',
            letterSpacing: '-0.01em',
            lineHeight: '1.2',
          }}
        >
          "Culinary art is the architectural harmony of classical technique, seasonal purity, and quiet mastery."
        </h2>

        <p className="lead mx-auto mb-4 text-white-50" style={{ maxWidth: '700px', fontSize: '1.05rem', fontStyle: 'italic' }}>
          &mdash; Executive Chef James Thew, The Grand Palace
        </p>

        <div className="d-flex flex-wrap justify-content-center gap-3 pt-2">
          <div className="p-3 border" style={{ borderColor: 'rgba(182, 147, 85, 0.3)', backgroundColor: 'rgba(0, 0, 0, 0.35)', minWidth: '220px' }}>
            <div className="font-monospace small fw-bold" style={{ color: 'var(--dp-color-accent)' }}>[01] 5-COURSE TASTING</div>
            <div className="small text-white-50 mt-1">Michelin-standard gastronomy</div>
          </div>
          <div className="p-3 border" style={{ borderColor: 'rgba(182, 147, 85, 0.3)', backgroundColor: 'rgba(0, 0, 0, 0.35)', minWidth: '220px' }}>
            <div className="font-monospace small fw-bold" style={{ color: 'var(--dp-color-accent)' }}>[02] BOTANICAL & MEATS</div>
            <div className="small text-white-50 mt-1">Juices, Pastas & Dry-Aged Cuts</div>
          </div>
          <div className="p-3 border" style={{ borderColor: 'rgba(182, 147, 85, 0.3)', backgroundColor: 'rgba(0, 0, 0, 0.35)', minWidth: '220px' }}>
            <div className="font-monospace small fw-bold" style={{ color: 'var(--dp-color-accent)' }}>[03] VIP SENSORY CLINIC</div>
            <div className="small text-white-50 mt-1">Direct feedback from Chef James</div>
          </div>
        </div>
      </div>
    </section>
  );
};
