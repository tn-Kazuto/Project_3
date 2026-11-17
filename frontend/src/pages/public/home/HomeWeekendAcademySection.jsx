import React from 'react';
import { Link } from 'react-router-dom';

export const HomeWeekendAcademySection = ({ fallbackImage }) => {
  return (
    <section
      className="field-taupe py-5 border-top"
      style={{
        backgroundColor: 'var(--dp-color-ground-2, #EDE8DF)',
        borderColor: 'var(--dp-color-panel-line, rgba(0, 0, 0, 0.08))',
      }}
      aria-labelledby="weekend-academy-cta"
    >
      <div className="container py-lg-4">
        <div className="row g-5 align-items-center">
          {/* Left Content Column */}
          <div className="col-lg-6">
            <h2
              id="weekend-academy-cta"
              className="brand-font mb-0"
              style={{
                fontSize: 'clamp(2.35rem, 4.2vw, 3.5rem)',
                lineHeight: '1.08',
                letterSpacing: '-0.025em',
                color: 'var(--dp-color-ink, #1C1917)',
                fontWeight: 500,
              }}
            >
              Weekend Culinary Academy
            </h2>

            <p
              className="mt-3 mb-4"
              style={{
                color: 'var(--dp-color-ink-2, #6B635B)',
                fontSize: '1.0625rem',
                lineHeight: '1.65',
                maxWidth: '44ch',
              }}
            >
              Weekend classes, member recipes, technique videos, talk shows and live masterclasses.
            </p>

            <div
              className="py-3 my-4"
              style={{
                borderTop: '1px solid var(--dp-color-panel-line, rgba(0, 0, 0, 0.12))',
                borderBottom: '1px solid var(--dp-color-panel-line, rgba(0, 0, 0, 0.12))',
              }}
            >
              <div className="row g-4">
                <div className="col-sm-6">
                  <div
                    className="small fw-semibold text-uppercase"
                    style={{
                      letterSpacing: '0.08em',
                      color: 'var(--dp-color-accent-text, #8C7355)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    Classes
                  </div>
                  <div
                    className="mt-1 fw-medium"
                    style={{
                      color: 'var(--dp-color-ink, #1C1917)',
                      fontSize: '1.05rem',
                    }}
                  >
                    Every Saturday &amp; Sunday
                  </div>
                </div>
                <div className="col-sm-6">
                  <div
                    className="small fw-semibold text-uppercase"
                    style={{
                      letterSpacing: '0.08em',
                      color: 'var(--dp-color-accent-text, #8C7355)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    Membership
                  </div>
                  <div
                    className="mt-1 fw-medium"
                    style={{
                      color: 'var(--dp-color-ink, #1C1917)',
                      fontSize: '1.05rem',
                    }}
                  >
                    $10 monthly or $100 yearly
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/register"
                className="btn text-white fw-semibold px-4 py-3"
                style={{
                  backgroundColor: 'var(--dp-color-field, #1E1B18)',
                  borderRadius: 0,
                  fontSize: '0.9375rem',
                  letterSpacing: '0.03em',
                  transition: 'all 180ms ease',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--dp-color-field-deep, #141210)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--dp-color-field, #1E1B18)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Join the membership
              </Link>
            </div>
          </div>

          {/* Right Visual Column */}
          <div className="col-lg-6">
            <div
              className="overflow-hidden"
              style={{
                aspectRatio: '16/11',
                borderBottom: '2px solid var(--dp-color-accent, #B69355)',
                backgroundColor: 'var(--dp-color-ground-2, #EDE8DF)',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1300&q=85"
                alt="Weekend Culinary Academy Masterclass with Chef James Thew"
                className="w-100 h-100"
                style={{ objectFit: 'cover', display: 'block' }}
                loading="lazy"
                width="1300"
                height="900"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackImage;
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
