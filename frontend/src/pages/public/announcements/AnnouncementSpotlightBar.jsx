import React from 'react';

export const AnnouncementSpotlightBar = ({ honoreesCount = 0 }) => {
  return (
    <div
      className="p-4 mb-5 text-white position-relative overflow-hidden"
      style={{
        backgroundColor: 'var(--dp-color-field)',
        borderTop: '2px solid var(--dp-color-accent)',
        borderBottom: '1px solid var(--dp-color-accent)',
        backgroundImage:
          'linear-gradient(rgba(28, 26, 23, 0.85), rgba(28, 26, 23, 0.90)), url("https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="row align-items-center g-4">
        <div className="col-md-8">
          <span
            className="font-monospace small text-uppercase"
            style={{ color: 'var(--dp-color-accent)', letterSpacing: '0.16em' }}
          >
            CHEF JAMES THEW &middot; EXCLUSIVE RECOGNITION
          </span>
          <h4 className="brand-font mt-2 mb-2 text-white" style={{ fontSize: '1.4rem' }}>
            Celebrating Masterful Home Cooks & Emerging Culinary Talents
          </h4>
          <p className="small text-white-50 mb-0" style={{ lineHeight: '1.6' }}>
            Every winning recipe is permanently archived into our culinary annals, endorsed with Chef James Thew's
            signature certification and monetary accolades.
          </p>
        </div>
        <div className="col-md-4 text-md-end">
          <div
            className="d-inline-block p-3 border text-start"
            style={{
              borderColor: 'var(--dp-color-accent)',
              backgroundColor: 'rgba(0,0,0,0.4)',
              minWidth: '180px',
            }}
          >
            <div className="font-monospace small fw-bold" style={{ color: 'var(--dp-color-accent)' }}>
              TOTAL HONOREES
            </div>
            <div className="brand-font h3 mb-0 text-white mt-1">{honoreesCount} Winners</div>
            <div className="small text-white-50 font-monospace" style={{ fontSize: '0.7rem' }}>
              CROWNED BY CHEF THEW
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
