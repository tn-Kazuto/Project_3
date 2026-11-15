import React from 'react';
import { Link } from 'react-router-dom';
import { FALLBACK_RECIPE_IMAGE } from './homeData';

export const HomeHero = ({ recipe }) => (
  <section className="home-hero" aria-labelledby="home-title">
    <div className="home-wrap home-hero__layout">
      <div className="home-hero__content" data-enter>
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="roman-numeral">I · PROLOGUE</span>
          <span className="text-uppercase small fw-bold" style={{ letterSpacing: '0.14em', color: 'var(--dp-color-accent-text)' }}>
            5-Star Executive Chef &middot; Author &middot; Host
          </span>
        </div>
        <h1 id="home-title" className="home-title brand-font">Chef James Thew</h1>
        <p className="home-lead">
          Free recipes and kitchen tips for everyone. Members get the full library and live masterclasses.
        </p>
        <div className="home-actions">
          <Link className="home-button home-button--primary btn btn-primary" to="/recipes">Explore Recipes</Link>
          <Link className="home-button home-button--text" to="/register">Join Member Club ($10/mo)</Link>
        </div>
        <ul className="home-credentials" aria-label="About Chef James Thew">
          <li>Executive chef at Grand Palace Hotel Residency</li>
          <li>Cookbook author</li>
          <li>Television guest</li>
        </ul>
      </div>
      <div className={'home-hero__visual' + (recipe ? ' home-hero__visual--featured' : '')}>
        {recipe ? (
          <Link className="home-featured-recipe" to={'/recipes/' + recipe.recipeId}>
            <span className="home-featured-recipe__image">
              <img
                src={recipe.thumbnailUrl || recipe.imageUrl || FALLBACK_RECIPE_IMAGE}
                alt=""
                width="1200"
                height="900"
                fetchPriority="high"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = FALLBACK_RECIPE_IMAGE;
                }}
              />
            </span>
            <span className="home-featured-recipe__content">
              <span className="home-featured-recipe__meta">
                <span>Latest free recipe</span>
                <span>{recipe.categoryName || 'From the recipe library'}</span>
              </span>
              <h2 className="home-featured-recipe__title">{recipe.title}</h2>
              <span className="home-featured-recipe__action">See recipe</span>
            </span>
          </Link>
        ) : (
          <img
            src={FALLBACK_RECIPE_IMAGE}
            alt=""
            width="1200"
            height="900"
            fetchPriority="high"
          />
        )}
      </div>
    </div>
  </section>
);
