import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 404 Not Found Page for James Thew Culinary Platform.
 * Luxury Architectural Styling with prominent EB Garamond typography (zero icons).
 */
export const NotFoundPage = () => {
  return (
    <div className="container py-5 my-5 text-center luxury-notfound">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="roman-numeral mb-2" style={{ fontSize: '1rem', letterSpacing: '0.15em' }}>
            VACANT REPERTOIRE
          </div>

          <h1
            className="brand-font mb-2"
            style={{
              fontSize: 'clamp(4rem, 10vw, 6.5rem)',
              lineHeight: '1',
              color: 'var(--dp-color-accent)',
              fontFamily: 'var(--dp-typography-serif)',
            }}
          >
            404
          </h1>

          <h2 className="brand-font h3 text-dark mb-3">Recipe Not Found in the Kitchen</h2>
          <p className="lead text-muted mb-5 mx-auto max-w-500" style={{ lineHeight: '1.7' }}>
            Oops! The culinary dish or page you are searching for might have been consumed, moved, or never existed on Chef James Thew's menu.
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link
              to="/"
              className="btn btn-primary btn-lg fw-semibold d-inline-flex align-items-center gap-2"
              style={{
                backgroundColor: 'var(--dp-color-field)',
                color: 'var(--dp-color-on-field)',
                letterSpacing: '0.14em',
                borderRadius: 0,
              }}
            >
              <span>Return to Home</span>
            </Link>
            <Link
              to="/recipes"
              className="btn btn-outline-secondary btn-lg fw-semibold d-inline-flex align-items-center gap-2"
              style={{
                borderColor: 'var(--dp-color-accent)',
                color: 'var(--dp-color-ink)',
                letterSpacing: '0.14em',
                borderRadius: 0,
              }}
            >
              <span>Browse 5-Star Recipes</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
