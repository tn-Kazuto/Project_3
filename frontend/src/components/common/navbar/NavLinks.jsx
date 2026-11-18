import React from 'react';
import { NavLink } from 'react-router-dom';

export const NavLinks = ({ isAdminPage, isAuthenticated, isAdmin, onNavClick }) => {
  if (isAdminPage) {
    return (
      <ul className="navbar-nav mx-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-2 gap-xl-3" onClick={onNavClick}>
        <li className="nav-item">
          <NavLink to="/admin" className="nav-link nav-link-admin" end onClick={onNavClick}>
            Admin Dashboard
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/" className="nav-link" onClick={onNavClick}>
            View Public Site
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/recipes" className="nav-link" onClick={onNavClick}>
            Recipes & Tips
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/contests" className="nav-link" onClick={onNavClick}>
            Contests
          </NavLink>
        </li>
      </ul>
    );
  }

  return (
    <ul className="navbar-nav mx-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-1 gap-xl-2" onClick={onNavClick}>
      {/* 1. Home Page (Guest, Member, Admin) */}
      <li className="nav-item">
        <NavLink to="/" className="nav-link" end onClick={onNavClick}>
          Home
        </NavLink>
      </li>

      {/* 2. Recipes & Tips (Guest, Member, Admin) */}
      <li className="nav-item">
        <NavLink to="/recipes" className="nav-link" onClick={onNavClick}>
          Recipes & Tips
        </NavLink>
      </li>

      {/* 3. My Recipes & Tips (Member only; Admin manages recipes via Admin Dashboard) */}
      {isAuthenticated && !isAdmin && (
        <li className="nav-item">
          <NavLink to="/my-recipes" className="nav-link" onClick={onNavClick}>
            My Recipes & Tips
          </NavLink>
        </li>
      )}

      {/* 4. Contests (Guest, Member, Admin) */}
      <li className="nav-item">
        <NavLink to="/contests" className="nav-link" onClick={onNavClick}>
          Contests
        </NavLink>
      </li>

      {/* 5. Announcements (Guest, Member, Admin) */}
      <li className="nav-item">
        <NavLink to="/announcements" className="nav-link" onClick={onNavClick}>
          Announcements
        </NavLink>
      </li>

      {/* 6. Feedback (Guest, Member, Admin) */}
      <li className="nav-item">
        <NavLink to="/feedback" className="nav-link" onClick={onNavClick}>
          Feedback
        </NavLink>
      </li>

      {/* 7. FAQs (Guest, Member, Admin) */}
      <li className="nav-item">
        <NavLink to="/faqs" className="nav-link" onClick={onNavClick}>
          FAQ's
        </NavLink>
      </li>

      {/* 8. Admin Dashboard (Admin only) */}
      {isAdmin && (
        <li className="nav-item">
          <NavLink to="/admin" className="nav-link nav-link-admin" onClick={onNavClick}>
            Admin Dashboard
          </NavLink>
        </li>
      )}
    </ul>
  );
};
