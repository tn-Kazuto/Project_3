import React from 'react';
import { Link } from 'react-router-dom';
import { FALLBACK_RECIPE_IMAGE } from './homeData';

const RecipeLoadingState = () => (
  <ul className="home-recipe-grid" aria-label="Loading latest recipes" aria-busy="true">
    {[1, 2, 3].map((item) => (
      <li className="home-recipe-skeleton" key={item}>
        <span className="home-recipe-skeleton__image" aria-hidden="true" />
        <span className="home-recipe-skeleton__line" aria-hidden="true" />
        <span className="home-recipe-skeleton__line home-recipe-skeleton__line--short" aria-hidden="true" />
      </li>
    ))}
    <li className="visually-hidden" role="status">Loading latest recipes</li>
  </ul>
);

const RecipeCards = ({ recipes }) => (
  <ul className="home-recipe-grid">
    {recipes.map((recipe) => (
      <li key={recipe.recipeId}>
        <Link className="home-recipe-card" to={'/recipes/' + recipe.recipeId}>
          <span className="home-recipe-card__image">
            <img
              src={recipe.thumbnailUrl || recipe.imageUrl || FALLBACK_RECIPE_IMAGE}
              alt=""
              width="1000"
              height="750"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = FALLBACK_RECIPE_IMAGE;
              }}
            />
          </span>
          <span className="home-recipe-card__meta">
            <span>{recipe.categoryName || 'Recipe'}</span>
            <span>{recipe.isFree ? 'Free' : 'Members'}</span>
          </span>
          <span className="home-recipe-card__title">{recipe.title}</span>
          <span className="home-recipe-card__author">By {recipe.authorName || 'Chef James Thew'}</span>
        </Link>
      </li>
    ))}
  </ul>
);

export const RecipeShelf = ({ data, hasFeaturedRecipe, onRetry }) => (
  <section className="home-recipes home-section" aria-labelledby="recipes-title">
    <div className="home-wrap">
      <div className="home-section-heading">
        <div>
          <span className="roman-numeral d-block mb-1">III · REPERTOIRE</span>
          <h2 id="recipes-title">Latest Free Recipes</h2>
        </div>
        <Link className="home-inline-link" to="/recipes">See all recipes</Link>
      </div>

      <div className="home-recipe-results" aria-busy={data.status === 'loading'}>
        {data.status === 'loading' && <RecipeLoadingState />}
        {data.status === 'error' && (
          <div className="home-state" role="alert">
            <p>Recipes could not load. Try again.</p>
            <button className="home-inline-button" type="button" onClick={onRetry}>Retry recipes</button>
          </div>
        )}
        {data.status === 'empty' && (
          <div className="home-state">
            <p>{hasFeaturedRecipe ? 'The latest free recipe is featured above.' : 'No free recipes have been published yet.'}</p>
            <Link className="home-inline-link" to="/recipes">See free recipes</Link>
          </div>
        )}
        {data.status === 'success' && <RecipeCards recipes={data.items} />}
      </div>
    </div>
  </section>
);
