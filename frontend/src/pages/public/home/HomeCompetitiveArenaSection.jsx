import React from 'react';
import { Link } from 'react-router-dom';

export const HomeCompetitiveArenaSection = ({ contests, announcements }) => {
  return (
    <section
      className="field-charcoal py-5 position-relative overflow-hidden"
      style={{
        backgroundColor: 'var(--dp-color-field)',
        color: 'var(--dp-color-on-field)',
        borderTop: '1px solid var(--dp-color-accent)',
        backgroundImage: 'linear-gradient(rgba(26, 25, 24, 0.92), rgba(26, 25, 24, 0.95)), url("https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="container py-lg-4">
        {/* Contests Header */}
        <div className="row g-5 align-items-center mb-5">
          <div className="col-lg-5">
            <div className="roman-numeral mb-2" style={{ color: 'var(--dp-color-accent)' }}>
              IV &middot; COMPETITIVE ARENA
            </div>
            <h2 className="brand-font display-6 mb-3 text-white">Culinary Contests</h2>
            <p style={{ color: 'var(--dp-color-on-field-2)', lineHeight: '1.75' }}>
              Competitive culinary challenges open to members and guests. Submit your original dishes to be judged by Chef James Thew.
            </p>
            <Link
              to="/contests"
              className="btn btn-warning text-white fw-bold px-4 py-3 mt-2"
              style={{
                backgroundColor: 'var(--dp-color-accent)',
                borderColor: 'var(--dp-color-accent)',
                letterSpacing: '0.16em',
                borderRadius: 0,
              }}
            >
              Explore All Competitions
            </Link>
          </div>

          <div className="col-lg-7">
            <div className="d-flex flex-column gap-3">
              {contests.length > 0 ? (
                contests.map((c) => (
                  <div
                    key={c.contestId}
                    className="p-4 atelier-card-hover"
                    style={{
                      backgroundColor: 'var(--dp-color-field-deep)',
                      border: '1px solid var(--dp-color-field-line)',
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span
                        className="badge text-white font-monospace"
                        style={{
                          backgroundColor: 'var(--dp-color-accent)',
                          borderRadius: 0,
                        }}
                      >
                        {c.contestType} CONTEST
                      </span>
                      <span className="badge bg-success font-monospace" style={{ borderRadius: 0 }}>
                        Active Now
                      </span>
                    </div>
                    <h4 className="brand-font mb-2 text-white" style={{ fontSize: '1.35rem' }}>
                      {c.title}
                    </h4>
                    <p className="small mb-3" style={{ color: 'var(--dp-color-on-field-2)' }}>
                      {c.description}
                    </p>
                    <div
                      className="d-flex justify-content-between align-items-center pt-3 small"
                      style={{ borderTop: '1px solid var(--dp-color-field-line)' }}
                    >
                      <span style={{ color: 'var(--dp-color-on-field-2)' }}>
                        Deadline: {new Date(c.endDate).toLocaleDateString()}
                      </span>
                      <Link
                        to={`/contests/${c.contestId}`}
                        className="btn btn-sm btn-outline-light px-3"
                        style={{
                          borderColor: 'var(--dp-color-accent)',
                          letterSpacing: '0.12em',
                          borderRadius: 0,
                        }}
                      >
                        Submit Entry
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="p-4 text-center"
                  style={{
                    backgroundColor: 'var(--dp-color-field-deep)',
                    border: '1px solid var(--dp-color-field-line)',
                    color: 'var(--dp-color-on-field-2)',
                  }}
                >
                  New contests will be announced soon by Chef James.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Announcements / Hall of Fame */}
        <div className="pt-4 border-top" style={{ borderColor: 'var(--dp-color-field-line)' }}>
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <div className="roman-numeral mb-1" style={{ color: 'var(--dp-color-accent)' }}>
                V &middot; HALL OF FAME
              </div>
              <h3 className="brand-font text-white m-0" style={{ fontSize: '1.75rem' }}>
                Contest Winner Announcements
              </h3>
            </div>
            <Link
              to="/announcements"
              className="text-uppercase fw-semibold small gold-underline d-inline-flex align-items-center gap-2"
              style={{ letterSpacing: '0.16em', color: 'var(--dp-color-on-field)' }}
            >
              <span>All Announcements</span>
            </Link>
          </div>

          <div className="row g-4">
            {announcements.length > 0 ? (
              announcements.map((a) => (
                <div key={a.announcementId} className="col-md-6">
                  <div
                    className="p-4 h-100 atelier-card-hover"
                    style={{
                      backgroundColor: 'var(--dp-color-field-deep)',
                      border: '1px solid var(--dp-color-field-line)',
                    }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-2" style={{ color: 'var(--dp-color-accent)' }}>
                      <span className="text-uppercase small fw-bold" style={{ letterSpacing: '0.14em' }}>
                        Winner Declaration
                      </span>
                    </div>
                    <h4 className="brand-font mb-2 text-white" style={{ fontSize: '1.25rem' }}>
                      {a.title}
                    </h4>
                    <p className="small mb-3" style={{ color: 'var(--dp-color-on-field-2)' }}>
                      {a.content}
                    </p>
                    <div className="small font-monospace" style={{ color: 'var(--dp-color-on-field-2)', opacity: 0.8 }}>
                      Published: {new Date(a.publishedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-4" style={{ color: 'var(--dp-color-on-field-2)' }}>
                Check back soon for latest contest winners!
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
