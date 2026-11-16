import React from 'react';

export const AnnouncementCard = ({ announcement }) => {
  const hasWinner = Boolean(announcement.winnerName);

  return (
    <div className="col-lg-6">
      <div
        className="card h-100 p-4 d-flex flex-column atelier-card-hover"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--dp-color-rule)',
          borderTop: hasWinner ? '2px solid var(--dp-color-accent)' : '2px solid var(--dp-color-field)',
          borderRadius: 0,
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span
            className="badge font-monospace"
            style={{
              backgroundColor: hasWinner ? 'var(--dp-color-accent)' : 'var(--dp-color-field)',
              color: '#ffffff',
              borderRadius: 0,
            }}
          >
            {hasWinner ? '🏆 Contest Winner Announcement' : '📢 Official News'}
          </span>
          <span className="small text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
            {new Date(announcement.publishedAt).toLocaleDateString()}
          </span>
        </div>

        <h3 className="brand-font mb-3 text-dark" style={{ fontSize: '1.45rem' }}>
          {announcement.title}
        </h3>

        {/* Winner Highlight Box if winner exists */}
        {hasWinner && (
          <div
            className="p-3 mb-3 d-flex align-items-center gap-3"
            style={{
              backgroundColor: 'var(--dp-color-ground-2)',
              border: '1px solid var(--dp-color-accent)',
            }}
          >
            <div
              className="p-2 d-flex align-items-center justify-content-center flex-shrink-0 font-monospace fw-bold"
              style={{
                backgroundColor: 'var(--dp-color-field)',
                color: 'var(--dp-color-accent)',
                minWidth: '36px',
              }}
            >
              [1st]
            </div>
            <div>
              <div className="roman-numeral mb-0" style={{ fontSize: '0.8rem' }}>
                HONORED WINNER
              </div>
              <div className="brand-font h5 fw-bold text-dark mb-0">{announcement.winnerName}</div>
              {announcement.contestTitle && (
                <small className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                  Competition: {announcement.contestTitle}
                </small>
              )}
            </div>
          </div>
        )}

        <div
          className="card-text mb-4 flex-grow-1"
          style={{
            color: 'var(--dp-color-ink-2)',
            whiteSpace: 'pre-line',
            lineHeight: '1.75',
          }}
        >
          {announcement.content}
        </div>

        <div
          className="border-top pt-3 mt-auto d-flex align-items-center justify-content-between text-muted small"
          style={{ borderColor: 'var(--dp-color-rule)' }}
        >
          <span>
            Published by: <strong>{announcement.authorName || 'Chef James Thew'}</strong>
          </span>
          <span
            className="badge font-monospace"
            style={{
              backgroundColor: 'var(--dp-color-ground-2)',
              color: 'var(--dp-color-ink)',
              border: '1px solid var(--dp-color-panel-line)',
              borderRadius: 0,
            }}
          >
            Verified Announcement
          </span>
        </div>
      </div>
    </div>
  );
};
