import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recipeApi, contestApi, announcementApi } from '../../services/api';

export const HomePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [contests, setContests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [recipeRes, contestRes, announceRes] = await Promise.all([
          recipeApi.getAll(),
          contestApi.getAll({ activeOnly: true }),
          announcementApi.getAll(),
        ]);

        if (recipeRes.data?.success) setRecipes(recipeRes.data.data.slice(0, 3));
        if (contestRes.data?.success) setContests(contestRes.data.data.slice(0, 2));
        if (announceRes.data?.success) setAnnouncements(announceRes.data.data.slice(0, 2));
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="luxury-homepage">
      {/* ── SECTION I: ARCHITECTURAL HERO (Warm Alabaster Ground with Spine) ── */}
      <section className="py-5 border-bottom" style={{ borderColor: 'var(--dp-color-rule)' }}>
        <div className="container py-lg-4">
          <div className="row g-5 align-items-center">
            {/* Margin & Main Editorial Text (Columns 1-7) */}
            <div className="col-lg-7">
              <div className="d-flex align-items-center gap-3 mb-3">
                <span className="roman-numeral">I &middot; PROLOGUE</span>
                <span className="text-uppercase small fw-bold" style={{ letterSpacing: '0.16em', color: 'var(--dp-color-accent-text)' }}>
                  5-Star Executive Chef &middot; Author &middot; Host
                </span>
              </div>

              <h1
                className="brand-font mb-4"
                style={{
                  fontSize: 'clamp(2.75rem, 5.5vw, 4.5rem)',
                  lineHeight: '1.02',
                  letterSpacing: '-0.02em',
                  color: 'var(--dp-color-ink)',
                }}
              >
                Chef James Thew
              </h1>

              <p className="lead mb-4" style={{ color: 'var(--dp-color-ink-2)', lineHeight: '1.75' }}>
                Welcome to my culinary sanctuary. Working as an executive chef in luxury 5-star hotels,
                hosting culinary television programs, and authoring renowned cookbooks across Juices, Vegetarian,
                Non-Vegetarian, and Italian cuisines. Explore my recipes, take part in competitive cook-offs,
                or join our weekend masterclasses!
              </p>

              <div className="d-flex flex-wrap gap-3 pt-2">
                <Link
                  to="/recipes"
                  className="btn btn-primary btn-lg px-4"
                  style={{
                    backgroundColor: 'var(--dp-color-field)',
                    color: 'var(--dp-color-on-field)',
                    letterSpacing: '0.16em',
                  }}
                >
                  <span>Explore Recipes</span>
                </Link>
                <Link
                  to="/register"
                  className="btn btn-outline-secondary btn-lg px-4"
                  style={{
                    borderColor: 'var(--dp-color-accent)',
                    color: 'var(--dp-color-ink)',
                    letterSpacing: '0.16em',
                  }}
                >
                  Join Member Club ($10/mo)
                </Link>
              </div>
            </div>

            {/* Editorial Portrait Column (Columns 8-12) */}
            <div className="col-lg-5">
              <div
                className="p-3"
                style={{
                  backgroundColor: 'var(--dp-color-ground-2)',
                  border: '1px solid var(--dp-color-panel-line)',
                }}
              >
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <img
                    src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80"
                    alt="Chef James Thew Culinary Atelier"
                    className="img-fluid w-100"
                    style={{
                      maxHeight: '460px',
                      objectFit: 'cover',
                      filter: 'grayscale(20%) contrast(105%)',
                    }}
                  />
                  <div
                    className="p-3"
                    style={{
                      backgroundColor: 'var(--dp-color-field)',
                      color: 'var(--dp-color-on-field)',
                      borderTop: '1px solid var(--dp-color-accent)',
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="small text-uppercase fw-semibold" style={{ letterSpacing: '0.16em' }}>
                        The Grand Palace Atelier
                      </span>
                      <span className="roman-numeral" style={{ fontSize: '0.9rem' }}>EST. 2012</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION II: PALE TAUPE FIELD – WEEKEND CULINARY ACADEMY (Ruled Rows) ── */}
      <section className="field-taupe py-5" style={{ backgroundColor: 'var(--dp-color-ground-2)' }}>
        <div className="container py-lg-4">
          <div className="row g-5">
            <div className="col-lg-4">
              <div className="roman-numeral mb-2">II &middot; MASTERCLASSES</div>
              <h2 className="brand-font display-6 mb-3">Weekend Culinary Academy</h2>
              <p style={{ color: 'var(--dp-color-ink-2)', lineHeight: '1.7' }}>
                Intensive in-person workshops curated for epicurean enthusiasts, aspiring chefs, and passionate home cooks.
              </p>
              <div
                className="p-3 mt-4"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--dp-color-panel-line)',
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="fw-semibold small text-uppercase" style={{ letterSpacing: '0.12em', color: 'var(--dp-color-accent, #b69355)' }}>
                    Exclusive Member Privilege
                  </span>
                </div>
                <p className="small mb-0" style={{ color: 'var(--dp-color-ink-2)' }}>
                  Free booking inquiries and prioritized registration available for registered members!
                </p>
              </div>
            </div>

            <div className="col-lg-8">
              {/* Ruled Rows Pattern */}
              <div className="ruled-row d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div className="d-flex align-items-start gap-3">
                  <span className="font-monospace fw-bold text-muted mt-1 flex-shrink-0">I.</span>
                  <div>
                    <h5 className="brand-font mb-1">Weekend Schedule & Tasting Sessions</h5>
                    <p className="small mb-0" style={{ color: 'var(--dp-color-ink-2)' }}>
                      Every Saturday & Sunday (10:00 AM – 3:00 PM) with 5-course tasting menu preparation
                    </p>
                  </div>
                </div>
                <span className="badge bg-light text-dark font-monospace align-self-start align-self-md-center">
                  10 AM - 3 PM
                </span>
              </div>

              <div className="ruled-row d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div className="d-flex align-items-start gap-3">
                  <span className="font-monospace fw-bold text-muted mt-1 flex-shrink-0">II.</span>
                  <div>
                    <h5 className="brand-font mb-1">Four Fundamental Culinary Pillars</h5>
                    <p className="small mb-0" style={{ color: 'var(--dp-color-ink-2)' }}>
                      Focus on Italian Pastas, Gourmet Meats & Fresh Juice Blends, and Seasonal Plant-Forward Gastronomy
                    </p>
                  </div>
                </div>
                <span className="badge bg-light text-dark font-monospace align-self-start align-self-md-center">
                  CURRICULUM
                </span>
              </div>

              <div className="ruled-row d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div className="d-flex align-items-start gap-3">
                  <span className="font-monospace fw-bold text-muted mt-1 flex-shrink-0">III.</span>
                  <div>
                    <h5 className="brand-font mb-1">Intimate Atelier Setting</h5>
                    <p className="small mb-0" style={{ color: 'var(--dp-color-ink-2)' }}>
                      Small groups (max 12 seats) for personalized mentorship directly from Chef James Thew
                    </p>
                  </div>
                </div>
                <span className="badge bg-light text-dark font-monospace align-self-start align-self-md-center">
                  MAX 12 SEATS
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION III: WARM ALABASTER – LATEST FREE RECIPES ── */}
      <section className="py-5" style={{ backgroundColor: 'var(--dp-color-ground)' }}>
        <div className="container py-lg-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5 gap-3 border-bottom pb-3" style={{ borderColor: 'var(--dp-color-rule)' }}>
            <div>
              <div className="roman-numeral mb-1">III &middot; REPERTOIRE</div>
              <h2 className="brand-font display-6 m-0">Latest Free Recipes</h2>
            </div>
            <Link
              to="/recipes"
              className="text-uppercase fw-semibold small gold-underline d-inline-flex align-items-center gap-2"
              style={{ letterSpacing: '0.16em', color: 'var(--dp-color-ink)' }}
            >
              <span>Explore All Recipes</span>
            </Link>
          </div>

          <div className="row g-4">
            {recipes.length > 0 ? (
              recipes.map((r) => (
                <div key={r.recipeId} className="col-md-4">
                  <div
                    className="card h-100 p-4"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--dp-color-rule)',
                      borderRadius: 0,
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="badge bg-light text-dark border font-monospace">
                        {r.categoryName}
                      </span>
                      <span
                        className="badge font-monospace"
                        style={{
                          backgroundColor: r.isFree ? '#1b4d3e' : 'var(--dp-color-field)',
                          color: '#ffffff',
                          borderRadius: 0,
                        }}
                      >
                        {r.isFree ? 'Free Access' : 'Members Only'}
                      </span>
                    </div>

                    {r.imageUrl && (
                      <div className="mb-3 overflow-hidden" style={{ aspectRatio: '16/9', backgroundColor: 'var(--dp-color-ground-2)', border: '1px solid var(--dp-color-panel-line)' }}>
                        <img
                          src={r.imageUrl}
                          alt={r.title}
                          className="w-100 h-100"
                          style={{ objectFit: 'cover' }}
                          loading="lazy"
                        />
                      </div>
                    )}

                    <h4 className="brand-font mb-2" style={{ fontSize: '1.35rem' }}>
                      {r.title}
                    </h4>

                    <p className="small mb-4 line-clamp-2" style={{ color: 'var(--dp-color-ink-2)' }}>
                      {r.ingredients.substring(0, 100)}...
                    </p>

                    <div
                      className="mt-auto pt-3 d-flex justify-content-between align-items-center small"
                      style={{ borderTop: '1px solid var(--dp-color-rule)' }}
                    >
                      <span style={{ color: 'var(--dp-color-ink-2)' }}>By {r.authorName}</span>
                      <Link
                        to={`/recipes/${r.recipeId}`}
                        className="text-uppercase fw-semibold gold-underline"
                        style={{ fontSize: '0.75rem', letterSpacing: '0.12em' }}
                      >
                        View Recipe &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5" style={{ color: 'var(--dp-color-ink-2)' }}>
                <p className="mb-0">No recipes posted yet. Be the first to share your culinary creation!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION IV: CHARCOAL FIELD – CULINARY CONTESTS & WINNERS ── */}
      <section
        className="field-charcoal py-5"
        style={{
          backgroundColor: 'var(--dp-color-field)',
          color: 'var(--dp-color-on-field)',
          borderTop: '1px solid var(--dp-color-accent)',
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
                Are you ready to test your skills? Chef James Thew frequently hosts competitive cooking contests.
                <strong className="text-white"> Non-members and guests are welcome to participate!</strong> Winners are honored
                on our global announcement board.
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
                      className="p-4"
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
                      className="p-4 h-100"
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
    </div>
  );
};

export default HomePage;
