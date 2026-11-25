import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Luxury Atelier gatekeeping CTA card shown when unregistered visitors reach the 50% preview limit.
 */
export const PreviewGateCard = ({
  returnTo,
  isAuthenticated = false,
  headerTag = '50% COMPLIMENTARY PREVIEW REACHED',
  title = 'Want to See the Rest? Register to Continue',
  description = 'You are viewing a 50% complimentary preview. Register as a Member ($10/month or $100/year) to unlock all remaining steps, full ingredient quantities, and HD masterclass videos.',
  compact = false,
  compactMessage = 'Showing 50% of ingredients. Want to see the rest?',
  onNavigateAway,
}) => {
  const registerState = {
    from: returnTo,
    message: 'Register for a membership ($10/mo or $100/yr) to unlock complete recipes, ingredients, and Chef James Thew masterclass videos.',
  };

  if (compact) {
    return (
      <div
        className="mt-3 p-3 d-flex flex-column gap-2"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--dp-color-accent)',
          borderLeft: '3px solid var(--dp-color-accent)',
        }}
      >
        <div className="small text-dark fw-semibold font-monospace" style={{ fontSize: '0.75rem' }}>
          🔒 {compactMessage}
        </div>
        <div>
          {isAuthenticated ? (
            <Link
              to="/profile"
              onClick={onNavigateAway}
              className="btn btn-sm btn-primary font-monospace text-uppercase"
              style={{ fontSize: '0.72rem', letterSpacing: '0.08em', borderRadius: 0 }}
            >
              Renew Membership
            </Link>
          ) : (
            <Link
              to="/register"
              state={registerState}
              onClick={onNavigateAway}
              className="btn btn-sm btn-primary font-monospace text-uppercase"
              style={{ fontSize: '0.72rem', letterSpacing: '0.08em', borderRadius: 0 }}
            >
              Want to See More? Register to Unlock &rarr;
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="mt-4 p-4 text-center"
      style={{
        backgroundColor: 'var(--dp-color-field)',
        color: 'var(--dp-color-on-field)',
        border: '1px solid var(--dp-color-accent)',
      }}
    >
      <div className="roman-numeral mb-2" style={{ color: 'var(--dp-color-accent)', fontSize: '0.85rem' }}>
        {headerTag}
      </div>
      <h3 className="brand-font h3 text-white mb-2">
        {title}
      </h3>
      <p className="small mb-4 max-w-600 mx-auto" style={{ color: 'var(--dp-color-on-field-2)', lineHeight: '1.65' }}>
        {description}
      </p>
      <div className="d-flex flex-wrap justify-content-center gap-3">
        {isAuthenticated ? (
          <Link
            to="/profile"
            onClick={onNavigateAway}
            className="btn btn-primary text-uppercase font-monospace px-4 py-2"
            style={{ letterSpacing: '0.1em' }}
          >
            Renew Membership
          </Link>
        ) : (
          <>
            <Link
              to="/register"
              state={registerState}
              onClick={onNavigateAway}
              className="btn btn-primary text-uppercase font-monospace px-4 py-2"
              style={{ letterSpacing: '0.1em', fontWeight: 600 }}
            >
              Want to Continue? Register to Unlock ($10/mo)
            </Link>
            <Link
              to="/login"
              state={{ from: returnTo }}
              onClick={onNavigateAway}
              className="btn btn-outline-light text-uppercase font-monospace px-4 py-2"
              style={{ letterSpacing: '0.1em' }}
            >
              Already a Member? Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
