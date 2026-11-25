import React from 'react';
import { Link } from 'react-router-dom';
import { CULINARY_SVG_PLACEHOLDER } from './homeData';
import { PreviewRecipeImage } from '../../../components/common/PreviewRecipeImage';

const HomeRecipeCard = ({ recipe, fallbackImage, isPreviewTeaser = false }) => (
  <div className="col-md-4">
    <div
      className="card h-100 p-4 atelier-card-hover"
      style={{
        backgroundColor: '#ffffff',
        border: isPreviewTeaser ? '1px solid var(--dp-color-accent)' : '1px solid var(--dp-color-rule)',
        borderRadius: 0,
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3 gap-1 flex-wrap">
        <span className="badge bg-light text-dark border font-monospace">
          {recipe.categoryName}
        </span>
        <span
          className="badge font-monospace"
          style={{
            backgroundColor: recipe.isFree ? '#1b4d3e' : 'var(--dp-color-field)',
            color: '#ffffff',
            borderRadius: 0,
          }}
        >
          {recipe.isFree ? 'Free Access' : 'Members Only'}
        </span>
      </div>

      <PreviewRecipeImage
        src={recipe.imageUrl || fallbackImage || CULINARY_SVG_PLACEHOLDER}
        alt={recipe.title}
        fallbackSrc={CULINARY_SVG_PLACEHOLDER}
        blurred={isPreviewTeaser}
        overlayLabel="MEMBERS EXCLUSIVE"
        containerClassName="mb-3"
        containerStyle={{ aspectRatio: '16/9', backgroundColor: 'var(--dp-color-ground-2)', border: '1px solid var(--dp-color-panel-line)' }}
      />

      <h4 className="brand-font mb-2" style={{ fontSize: '1.35rem' }}>
        {recipe.title}
      </h4>

      <p className="small mb-4 line-clamp-2" style={{ color: 'var(--dp-color-ink-2)' }}>
        {isPreviewTeaser
          ? 'Members-exclusive recipe — open to read a preview, then register to unlock the full dish.'
          : `${(recipe.ingredients || '').substring(0, 100)}...`}
      </p>

      <div
        className="mt-auto pt-3 d-flex justify-content-between align-items-center small"
        style={{ borderTop: '1px solid var(--dp-color-rule)' }}
      >
        <span style={{ color: 'var(--dp-color-ink-2)' }}>By {recipe.authorName}</span>
        <Link
          to={`/recipes/${recipe.recipeId}`}
          className="text-uppercase fw-semibold gold-underline"
          style={{ fontSize: '0.75rem', letterSpacing: '0.12em' }}
        >
          View Recipe &rarr;
        </Link>
      </div>
    </div>
  </div>
);

export const HomeRepertoireSection = ({ recipes, memberPreviews = [], isAuthenticated = false, fallbackImage }) => {
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
              <HomeRecipeCard key={r.recipeId} recipe={r} fallbackImage={fallbackImage} />
            ))
          ) : (
            <div className="col-12 text-center py-5" style={{ color: 'var(--dp-color-ink-2)' }}>
              <p className="mb-0">No recipes posted yet. Be the first to share your culinary creation!</p>
            </div>
          )}
        </div>

        {memberPreviews.length > 0 && (
          <div className="mt-5 pt-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 gap-3 border-bottom pb-3" style={{ borderColor: 'var(--dp-color-rule)' }}>
              <div>
                <div className="roman-numeral mb-1" style={{ color: 'var(--dp-color-accent)' }}>
                  MEMBERS ATELIER &middot; EXCLUSIVE VAULT
                </div>
                <h3 className="brand-font h2 m-0">
                  Exclusive Member Recipes
                </h3>
              </div>
              <Link
                to="/recipes"
                className="text-uppercase fw-semibold small gold-underline d-inline-flex align-items-center gap-2"
                style={{ letterSpacing: '0.16em', color: 'var(--dp-color-ink)' }}
              >
                <span>Explore Member Recipes</span>
              </Link>
            </div>

            <div className="row g-4">
              {memberPreviews.map((r) => (
                <HomeRecipeCard
                  key={r.recipeId}
                  recipe={r}
                  fallbackImage={fallbackImage}
                  isPreviewTeaser={!isAuthenticated || r.accessLevel === 'PREVIEW'}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
