import React, { useState, useEffect } from 'react';
import { announcementApi } from '../../services/api';

export const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await announcementApi.getAll();
      if (res.data && res.data.success) {
        setAnnouncements(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load announcements at this moment. Please check back later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 luxury-announcements">
      {/* Header Banner */}
      <div
        className="field-taupe p-4 p-md-5 mb-5 text-center"
        style={{
          backgroundColor: 'var(--dp-color-ground-2)',
          border: '1px solid var(--dp-color-panel-line)',
        }}
      >
        <div className="roman-numeral mb-2">V &middot; HALL OF FAME</div>
        <h1 className="brand-font display-5 mb-3 text-dark">Winner Announcements & News</h1>
        <p className="lead max-w-700 mx-auto" style={{ color: 'var(--dp-color-ink-2)' }}>
          Official results from Chef James Thew's culinary competitions, honored contest winners, and special culinary announcements.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger mb-4" style={{ borderRadius: 0 }}>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: 'var(--dp-color-accent)' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading announcements...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div
          className="p-5 text-center mb-4"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--dp-color-rule)',
          }}
        >
          <h4 className="brand-font mb-2">No Announcements Published Yet</h4>
          <p className="text-muted mb-0">
            Contest results and official winner declarations by Chef James Thew will appear here.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {announcements.map((a) => {
            const hasWinner = Boolean(a.winnerName);
            return (
              <div key={a.announcementId} className="col-lg-6">
                <div
                  className="card h-100 p-4 d-flex flex-column"
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
                      {new Date(a.publishedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="brand-font mb-3 text-dark" style={{ fontSize: '1.45rem' }}>
                    {a.title}
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
                        <div className="roman-numeral mb-0" style={{ fontSize: '0.8rem' }}>HONORED WINNER</div>
                        <div className="brand-font h5 fw-bold text-dark mb-0">{a.winnerName}</div>
                        {a.contestTitle && (
                          <small className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                            Competition: {a.contestTitle}
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
                    {a.content}
                  </div>

                  <div
                    className="border-top pt-3 mt-auto d-flex align-items-center justify-content-between text-muted small"
                    style={{ borderColor: 'var(--dp-color-rule)' }}
                  >
                    <span>
                      Published by: <strong>{a.authorName || 'Chef James Thew'}</strong>
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
          })}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
