import React from 'react';

/**
 * EmptyState - Editorial Culinary Atelier Empty State
 * Implements the mandatory Empty UI state with high typographic taste & active-voice direction.
 */
export const EmptyState = ({
  title = 'No Repertoire Found',
  message = 'No recipes match your criteria. Try adjusting your search term or category.',
  quote = '“Perfection is not when there is nothing left to add, but when there is nothing left to take away.” — Chef James Thew',
  actionLabel = 'Reset All Filters',
  onAction,
}) => {
  return (
    <div className="col-12 py-4">
      <div className="empty-state-editorial">
        <div className="empty-ornament" aria-hidden="true">
          ❖ &bull; ❖
        </div>
        <h3 className="brand-font mb-2" style={{ fontSize: '1.5rem', color: 'var(--dp-color-ink)' }}>
          {title}
        </h3>
        <p className="empty-quote">
          {quote}
        </p>
        <p className="small mb-4" style={{ color: 'var(--dp-color-ink-2)', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
          {message}
        </p>
        {onAction && actionLabel && (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            style={{
              borderColor: 'var(--dp-color-accent)',
              color: 'var(--dp-color-ink)',
              letterSpacing: '0.14em',
            }}
            onClick={onAction}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
