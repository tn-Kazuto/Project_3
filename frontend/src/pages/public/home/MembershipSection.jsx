import React from 'react';
import { Link } from 'react-router-dom';

const CLASS_IMAGE = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1300&q=85';

export const MembershipSection = () => (
  <section className="home-membership home-section field-taupe" aria-labelledby="academy-title">
    <div className="home-wrap home-membership__layout">
      <div className="home-membership__content">
        <span className="roman-numeral d-block mb-2">II · MASTERCLASSES</span>
        <h2 id="academy-title">Weekend Culinary Academy</h2>
        <p>Weekend classes, member recipes, technique videos, talk shows and live masterclasses.</p>

        <div className="home-membership__curriculum mb-4">
          <div className="ruled-row py-2 border-bottom d-flex justify-content-between align-items-center">
            <span><strong>Schedule:</strong> Every Saturday &amp; Sunday (10:00 AM – 3:00 PM)</span>
            <span className="badge bg-light text-dark font-monospace">10 AM - 3 PM</span>
          </div>
          <div className="ruled-row py-2 border-bottom d-flex justify-content-between align-items-center">
            <span><strong>Curriculum:</strong> Four Fundamental Culinary Pillars (Juices, Vegetarian, Non-Veg, Italian)</span>
            <span className="badge bg-light text-dark font-monospace">CURRICULUM</span>
          </div>
          <div className="ruled-row py-2 border-bottom d-flex justify-content-between align-items-center">
            <span><strong>Atmosphere:</strong> Intimate Atelier Setting with direct chef mentorship</span>
            <span className="badge bg-light text-dark font-monospace">ATELIER</span>
          </div>
        </div>

        <dl className="home-membership__facts">
          <div>
            <dt>Classes</dt>
            <dd>Saturday &amp; Sunday</dd>
          </div>
          <div>
            <dt>Membership</dt>
            <dd>$10 monthly or $100 yearly</dd>
          </div>
        </dl>
        <Link className="home-button home-button--primary" to="/register">Join the membership</Link>
      </div>
      <div className="home-membership__visual">
        <img
          src={CLASS_IMAGE}
          alt=""
          width="1300"
          height="900"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80';
          }}
        />
      </div>
    </div>
  </section>
);
