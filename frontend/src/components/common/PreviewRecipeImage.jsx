import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Displays a recipe image with an optional luxury blur and lock overlay
 * when the visitor is viewing a 50% members-only preview.
 */
export const PreviewRecipeImage = ({
  src,
  alt,
  fallbackSrc,
  blurred = false,
  overlayLabel = 'EXCLUSIVE · PREVIEW 50%',
  actionHref = null,
  actionState = undefined,
  actionLabel = 'Want to Continue? Register to Unlock →',
  containerClassName = '',
  containerStyle = {},
  imgClassName = 'w-100 h-100',
  imgStyle = {},
}) => {
  return (
    <div
      className={`position-relative overflow-hidden ${containerClassName}`}
      style={containerStyle}
    >
      <img
        src={src}
        alt={alt}
        className={imgClassName}
        style={{
          objectFit: 'cover',
          transition: 'filter 0.25s ease',
          ...(blurred ? { filter: 'blur(6px)', transform: 'scale(1.06)' } : {}),
          ...imgStyle,
        }}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.onerror = null;
          if (fallbackSrc) {
            e.currentTarget.src = fallbackSrc;
          }
        }}
      />

      {blurred && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 text-center"
          style={{
            background: 'linear-gradient(rgba(20, 18, 16, 0.35), rgba(20, 18, 16, 0.68))',
          }}
        >
          <span
            className="badge font-monospace text-uppercase px-3 py-2"
            style={{
              backgroundColor: 'rgba(20, 18, 16, 0.88)',
              color: 'var(--dp-color-accent)',
              border: '1px solid var(--dp-color-accent)',
              borderRadius: 0,
              letterSpacing: '0.12em',
              fontSize: '0.7rem',
            }}
          >
            🔒 {overlayLabel}
          </span>

          {actionHref && (
            <Link
              to={actionHref}
              state={actionState}
              className="btn btn-sm btn-primary font-monospace text-uppercase mt-3 px-3 py-2"
              style={{
                borderRadius: 0,
                letterSpacing: '0.1em',
                fontSize: '0.72rem',
              }}
            >
              {actionLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
