import React from 'react';
import { Link } from 'react-router-dom';
import { CULINARY_SVG_PLACEHOLDER } from './homeData';

export const HomeRepertoireSection = ({ recipes, fallbackImage }) => {
  return (
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
                  className="card h-100 p-4 atelier-card-hover"
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

                  <div className="mb-3 overflow-hidden" style={{ aspectRatio: '16/9', backgroundColor: 'var(--dp-color-ground-2)', border: '1px solid var(--dp-color-panel-line)' }}>
                    <img
                      src={r.imageUrl || fallbackImage || CULINARY_SVG_PLACEHOLDER}
                      alt={r.title}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = CULINARY_SVG_PLACEHOLDER;
                      }}
                    />
                  </div>

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
  );
};
