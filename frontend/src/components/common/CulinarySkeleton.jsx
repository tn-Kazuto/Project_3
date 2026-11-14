import React from 'react';

/**
 * CulinarySkeleton - 5-Star Architectural Shimmer Loader
 * Replaces generic spinners with deliberate typographic & layout skeletons.
 */
export const CulinarySkeleton = ({ count = 6, variant = 'recipe-card' }) => {
  return (
    <div className="row g-4" role="status" aria-label="Loading culinary repertoire">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="col-md-6 col-lg-4">
          <div
            className="card h-100 p-4 border"
            style={{
              backgroundColor: '#ffffff',
              borderColor: 'var(--dp-color-rule)',
              borderRadius: 0,
            }}
          >
            {/* Header tags skeleton */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div
                className="culinary-skeleton-block"
                style={{ width: '80px', height: '1.25rem' }}
              />
              <div
                className="culinary-skeleton-block"
                style={{ width: '90px', height: '1.25rem' }}
              />
            </div>

            {/* Media thumbnail skeleton */}
            <div
              className="culinary-skeleton-block mb-3"
              style={{ aspectRatio: '16/9', width: '100%' }}
            />

            {/* Title and author skeleton */}
            <div className="culinary-skeleton-block culinary-skeleton-title mb-2" />
            <div
              className="culinary-skeleton-block mb-3"
              style={{ width: '45%', height: '0.85rem' }}
            />

            {/* Text lines skeleton */}
            <div className="culinary-skeleton-block culinary-skeleton-text" />
            <div
              className="culinary-skeleton-block culinary-skeleton-text"
              style={{ width: '85%' }}
            />

            {/* Footer action skeleton */}
            <div className="border-top pt-3 mt-3 d-flex justify-content-between align-items-center">
              <div
                className="culinary-skeleton-block"
                style={{ width: '60px', height: '0.85rem' }}
              />
              <div
                className="culinary-skeleton-block"
                style={{ width: '50px', height: '0.85rem' }}
              />
            </div>
          </div>
        </div>
      ))}
      <span className="visually-hidden">Loading culinary repertoire...</span>
    </div>
  );
};

export default CulinarySkeleton;
