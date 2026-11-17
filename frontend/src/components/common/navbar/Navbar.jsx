import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { NavBrand } from './NavBrand';
import { NavLinks } from './NavLinks';
import { NotificationDropdown } from './NotificationDropdown';
import { UserMenu } from './UserMenu';

/**
 * Dynamic Architectural Navigation:
 * - Pure typographic aesthetic (Zero icons across the navigation bar)
 * - Streamlined Executive layout on Admin pages to prevent horizontal overflow and clutter
 */
export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavClick = () => {
    setIsNavCollapsed(true);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light luxury-navbar sticky-top">
      <div className="container-fluid px-3 px-md-4 px-xl-5">
        {/* Brand Logo */}
        <NavBrand isAdminPage={isAdminPage} onNavClick={handleNavClick} />

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          aria-controls="mainNavbar"
          aria-expanded={!isNavCollapsed}
          aria-label="Toggle navigation"
          onClick={() => setIsNavCollapsed(!isNavCollapsed)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links */}
        <div className={`navbar-collapse ${isNavCollapsed ? 'collapse' : 'show'}`} id="mainNavbar">
          <NavLinks
            isAdminPage={isAdminPage}
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            onNavClick={handleNavClick}
          />

          {/* Right Action / Auth Buttons */}
          <div className="luxury-navbar-actions d-flex align-items-center gap-2 gap-xl-3">
            <div className="d-flex align-items-center gap-2 gap-xl-3 w-100 justify-content-between justify-content-lg-end">
              {/* In-App Notification Trigger & Drawer */}
              <NotificationDropdown
                isAuthenticated={isAuthenticated}
                userId={user?.userId}
              />

              {/* User Profile Pill or Login/Register buttons */}
              <UserMenu
                user={user}
                isAuthenticated={isAuthenticated}
                isAdmin={isAdmin}
                onLogout={handleLogout}
                onNavClick={handleNavClick}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
