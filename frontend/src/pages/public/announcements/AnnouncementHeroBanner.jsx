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
      <p className="lead max-w-700 mx-auto" style={{ color: 'var(--dp-color-ink-2)' }}>
        The Grand Palace Hotel gazette celebrates culinary mastery, crowning our esteemed competition laureates and
        announcing distinguished epicurean dispatches from Chef James Thew.
      </p>
      <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
        <span
          className="badge font-monospace px-3 py-2"
          style={{
            backgroundColor: 'var(--dp-color-field)',
            color: 'var(--dp-color-on-field)',
            borderRadius: 0,
          }}
        >
          Permanent Culinary Honor Roll
        </span>
        <span
          className="badge font-monospace px-3 py-2"
          style={{
            backgroundColor: 'var(--dp-color-accent)',
            color: '#ffffff',
            borderRadius: 0,
          }}
        >
          &star; Certified by Chef James Thew
        </span>
      </div>
    </div>
  );
};
