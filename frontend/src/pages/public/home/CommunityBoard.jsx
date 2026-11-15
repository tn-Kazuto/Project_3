import React from 'react';

export const CommunityBoard = ({ children }) => (
  <section className="home-community home-section field-charcoal" aria-labelledby="contests-title">
    <div className="home-wrap">
      <div className="home-community__intro">
        <span className="roman-numeral d-block mb-1" style={{ color: 'var(--dp-color-accent)' }}>
          IV · COMPETITIVE ARENA
        </span>
        <h2 id="contests-title">Culinary Contests</h2>
        <p>Enter with a recipe or kitchen tip. Winners are announced here.</p>
      </div>
      <div className="home-community__feeds">{children}</div>
    </div>
  </section>
);
