import React from 'react';

/**
 * Standard 5-Star Hotel Haute Cuisine Page Banner.
 * Consistent across all pages: dark field background, dual gold accent borders,
 * subtle culinary background scrim, gold Roman numeral sequencing, and white serif title.
 */
export const PageBanner = ({
  tag,
  title,
  subtitle,
  imageUrl = 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1600&q=80',
  className = '',
  centered = false,
  children,
}) => {
  return (
    <div
      className={`p-4 p-md-5 mb-4 text-white position-relative overflow-hidden ${centered ? 'text-center' : ''} ${className}`}
      style={{
        backgroundColor: 'var(--dp-color-field)',
        borderTop: '2px solid var(--dp-color-accent)',
        borderBottom: '1px solid var(--dp-color-accent)',
        backgroundImage: `linear-gradient(rgba(28, 26, 23, 0.86), rgba(28, 26, 23, 0.90)), url("${imageUrl}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className={`row align-items-center g-4 ${centered ? 'justify-content-center' : ''}`}>
        <div className={centered ? 'col-lg-10 d-flex flex-column align-items-center text-center' : 'col-lg-12'}>
          {tag && (
            <div className="roman-numeral mb-1" style={{ color: 'var(--dp-color-accent)' }}>
              {tag}
            </div>
          )}
          <h1 className="brand-font display-5 mb-2 text-white">{title}</h1>
          {subtitle && (
            <p className={`small text-white-50 mb-0 ${centered ? 'mx-auto' : ''}`} style={{ maxWidth: '650px', lineHeight: '1.65' }}>
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};
