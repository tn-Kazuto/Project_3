import React from 'react';

export const AnnouncementHeroBanner = () => {
  return (
    <div
      className="field-taupe p-4 p-md-5 mb-5 text-center position-relative overflow-hidden"
      style={{
        backgroundColor: 'var(--dp-color-ground-2)',
        border: '1px solid var(--dp-color-panel-line)',
        backgroundImage:
          'linear-gradient(rgba(244, 240, 234, 0.90), rgba(244, 240, 234, 0.95)), url("https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1600&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className="d-inline-flex align-items-center gap-2 mb-2 px-3 py-1 bg-white border"
        style={{ borderColor: 'var(--dp-color-panel-line)' }}
      >
        <span className="font-monospace fw-bold" style={{ color: 'var(--dp-color-accent)', fontSize: '0.8rem' }}>
          &diams;
        </span>
        <span className="roman-numeral mb-0" style={{ fontSize: '0.8rem' }}>
          V &middot; HALL OF FAME
        </span>
        <span className="font-monospace fw-bold" style={{ color: 'var(--dp-color-accent)', fontSize: '0.8rem' }}>
          &diams;
        </span>
      </div>
      <h1 className="brand-font display-5 mb-3 text-dark">Winner Announcements & News</h1>
      <p className="lead max-w-700 mx-auto mb-0" style={{ color: 'var(--dp-color-ink-2)' }}>
        Competition laureates and winner announcements curated by Chef James Thew.
      </p>
    </div>
  );
};
