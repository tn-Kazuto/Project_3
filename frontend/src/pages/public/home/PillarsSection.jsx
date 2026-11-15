import React from 'react';
import { Link } from 'react-router-dom';
import { FALLBACK_RECIPE_IMAGE } from './homeData';

const PILLARS = [
  {
    name: 'Juices',
    imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=900&q=85',
    subject: 'fresh juice',
  },
  {
    name: 'Vegetarian',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85',
    subject: 'vegetarian salad',
  },
  {
    name: 'Non-Vegetarian',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85',
    subject: 'prepared meat dish',
  },
  {
    name: 'Italian',
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=85',
    subject: 'Italian pasta',
  },
];

export const PillarsSection = () => (
  <section className="home-pillars home-section" aria-labelledby="pillars-title">
    <div className="home-wrap home-pillars__layout">
      <div className="home-pillars__intro">
        <h2 id="pillars-title">Browse by cuisine</h2>
      </div>
      <ul className="home-pillar-list">
        {PILLARS.map((pillar) => (
          <li key={pillar.name}>
            <Link
              className="home-pillar-link"
              aria-label={'Browse ' + pillar.name + ' recipes'}
              to={'/recipes?category=' + encodeURIComponent(pillar.name)}
            >
              <span className="home-pillar-link__image">
                <img
                  src={pillar.imageUrl}
                  alt=""
                  width="900"
                  height="675"
                  loading="lazy"
                  decoding="async"
                  data-source="stand-in"
                  data-subject={pillar.subject}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = FALLBACK_RECIPE_IMAGE;
                  }}
                />
              </span>
              <h3>{pillar.name}</h3>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
