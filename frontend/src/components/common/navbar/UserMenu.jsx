import React from 'react';
import { Link } from 'react-router-dom';

export const UserMenu = ({ user, isAuthenticated, isAdmin, onLogout, onNavClick }) => {
  if (!isAuthenticated) {
    return (
      <div className="d-flex align-items-center gap-2">
        <Link to="/login" className="btn luxury-login-btn">
          Log In
        </Link>
        <Link to="/register" className="btn luxury-register-btn fw-semibold">
          Subscribe & Register
        </Link>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center gap-2 gap-xl-3">
      {/* Hairline Divider */}
      <div className="luxury-nav-divider" aria-hidden="true"></div>

      {/* User Profile Pill */}
      <Link
        to="/profile"
        className="luxury-user-pill"
        title="View Profile"
        onClick={onNavClick}
      >
        <div className="luxury-user-avatar">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName || user.username}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
              }}
            />
          ) : (
            (user?.fullName || user?.username || 'U').charAt(0).toUpperCase()
          )}
        </div>
        <span className="luxury-user-name" title={user?.fullName || user?.username}>
          {user?.fullName || user?.username}
        </span>
        {isAdmin ? (
          <span className="badge badge-luxury-admin">
            ADMIN
          </span>
        ) : (
          <span className="badge badge-luxury-gold">
            {user?.subscriptionPlan || 'MEMBER'}
          </span>
        )}
      </Link>

      {/* Logout Button (Pure Typography, Zero Icons) */}
      <button
        onClick={onLogout}
        className="btn luxury-logout-btn"
        title="Log out"
      >
        <span>Logout</span>
      </button>
    </div>
  );
};
