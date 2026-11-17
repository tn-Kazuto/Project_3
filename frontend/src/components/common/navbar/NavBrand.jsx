import React from 'react';
import { Link } from 'react-router-dom';

export const NavBrand = ({ isAdminPage, onNavClick }) => {
  return (
    <Link to="/" className="navbar-brand d-flex align-items-center gap-2 text-decoration-none" onClick={onNavClick}>
      <div className="luxury-brand-badge font-monospace fw-bold" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
        JT
      </div>
      <span className="navbar-brand-title">James Thew</span>
      {isAdminPage && (
        <span
          className="badge font-monospace text-uppercase ms-1 px-2 py-1"
          style={{
            backgroundColor: 'var(--dp-color-field, #1a1a1a)',
            color: 'var(--dp-color-accent, #b69355)',
            fontSize: '0.62rem',
            letterSpacing: '0.12em',
            borderRadius: 0,
          }}
        >
          Executive Nexus
        </span>
      )}
    </Link>
  );
};
