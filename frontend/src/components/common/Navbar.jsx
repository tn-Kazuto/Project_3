import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationApi } from '../../services/api';
import { ChefHat, User, LogOut, Shield, Bell } from 'lucide-react';

/**
 * Dynamic Architectural Navigation strictly following SRS Section 2.1 matrix:
 * - Guest: Home, Login, Register, Recipes & Tips, Contests, Announcements, Feedback, FAQs
 * - Member: Home, User Profile, Recipes & Tips, My Recipes & Tips, Contests, Announcements, Feedback, FAQs, Logout (Hide Login/Register)
 * - Admin: Home, User Profile, Recipes & Tips, Upload Recipes & Tips, Contests, Announcements, Feedback, FAQs, Admin Dashboard, Logout
 */
export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isMember, logout } = useAuth();
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setUnreadCount(0);
      setNotifications([]);
      setShowNotifDropdown(false);
    }
  }, [isAuthenticated, user?.userId]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getSummary();
      if (res.data?.success && res.data.data) {
        setUnreadCount(res.data.data.unreadCount || 0);
        setNotifications(res.data.data.recentNotifications || []);
      }
    } catch {
      // Non-blocking fallback
    }
  };

  const handleToggleNotifDropdown = () => {
    const nextState = !showNotifDropdown;
    setShowNotifDropdown(nextState);
    if (nextState) {
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // quiet catch
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationApi.markAsRead(notif.notificationId);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.notificationId === notif.notificationId ? { ...n, isRead: true } : n))
        );
      } catch {
        // quiet catch
      }
    }
    setShowNotifDropdown(false);
    if (notif.targetUrl) {
      navigate(notif.targetUrl);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavClick = () => {
    setIsNavCollapsed(true);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light luxury-navbar sticky-top py-3">
      <div className="container">
        {/* Brand Logo in EB Garamond */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2" onClick={handleNavClick}>
          <ChefHat className="luxury-gold-icon" size={26} />
          <span className="navbar-brand-title">James Thew</span>
        </Link>

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
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1" onClick={handleNavClick}>
            {/* 1. Home Page (Guest, Member, Admin) */}
            <li className="nav-item">
              <NavLink to="/" className="nav-link" end>
                Home
              </NavLink>
            </li>

            {/* 2. Recipes & Tips (Guest, Member, Admin) */}
            <li className="nav-item">
              <NavLink to="/recipes" className="nav-link">
                Recipes & Tips
              </NavLink>
            </li>

            {/* 3. My Recipes & Tips / Upload (Member or Admin) */}
            {isAuthenticated && (
              <li className="nav-item">
                <NavLink to="/my-recipes" className="nav-link">
                  {isAdmin ? 'Upload & Manage Recipes' : 'My Recipes & Tips'}
                </NavLink>
              </li>
            )}

            {/* 4. Contests (Guest, Member, Admin) */}
            <li className="nav-item">
              <NavLink to="/contests" className="nav-link">
                Contests
              </NavLink>
            </li>

            {/* 5. Announcements (Guest, Member, Admin) */}
            <li className="nav-item">
              <NavLink to="/announcements" className="nav-link">
                Announcements
              </NavLink>
            </li>

            {/* 6. Feedback (Guest, Member, Admin) */}
            <li className="nav-item">
              <NavLink to="/feedback" className="nav-link">
                Feedback
              </NavLink>
            </li>

            {/* 7. FAQs (Guest, Member, Admin) */}
            <li className="nav-item">
              <NavLink to="/faqs" className="nav-link">
                FAQ's
              </NavLink>
            </li>

            {/* 8. Admin Dashboard (Admin only) */}
            {isAdmin && (
              <li className="nav-item">
                <NavLink to="/admin" className="nav-link text-danger fw-bold d-flex align-items-center gap-1">
                  <Shield size={16} />
                  Admin Dashboard
                </NavLink>
              </li>
            )}
          </ul>

          {/* Right Action / Auth Buttons */}
          <div className="d-flex align-items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn btn-outline-secondary btn-sm px-3">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm px-3 fw-semibold">
                  Subscribe & Register
                </Link>
              </>
            ) : (
              <div className="d-flex align-items-center gap-3">
                {/* In-App Notification Bell */}
                <div className="position-relative">
                  <button
                    type="button"
                    className="btn btn-link text-dark p-1 position-relative d-flex align-items-center"
                    style={{ textDecoration: 'none', border: 'none', color: 'var(--dp-color-ink)' }}
                    onClick={handleToggleNotifDropdown}
                    aria-label="Notifications"
                    title="In-App Notifications"
                  >
                    <Bell size={20} className="luxury-gold-icon" />
                    {unreadCount > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger font-monospace"
                        style={{ fontSize: '0.65rem' }}
                        data-testid="unread-badge"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifDropdown && (
                    <div
                      className="dropdown-menu show p-0 shadow-lg end-0 position-absolute"
                      style={{
                        width: '320px',
                        maxWidth: '90vw',
                        right: 0,
                        top: '100%',
                        marginTop: '10px',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--dp-color-accent)',
                        borderRadius: 0,
                        zIndex: 1050,
                      }}
                    >
                      <div
                        className="d-flex justify-content-between align-items-center p-3 border-bottom"
                        style={{ backgroundColor: 'var(--dp-color-ground-2)', borderColor: 'var(--dp-color-panel-line)' }}
                      >
                        <span className="font-monospace small fw-bold text-uppercase" style={{ letterSpacing: '0.1em' }}>
                          Notifications {unreadCount > 0 && `(${unreadCount})`}
                        </span>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            className="btn btn-link p-0 small text-decoration-none font-monospace"
                            style={{ fontSize: '0.75rem', color: 'var(--dp-color-accent-text)' }}
                            onClick={handleMarkAllAsRead}
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-muted small font-monospace">
                            No notifications at this time
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.notificationId}
                              className={`p-3 border-bottom text-start ${!n.isRead ? 'bg-light' : ''}`}
                              style={{
                                cursor: 'pointer',
                                borderColor: 'var(--dp-color-panel-line)',
                                transition: 'background-color 0.15s ease',
                              }}
                              onClick={() => handleNotificationClick(n)}
                            >
                              <div className="d-flex justify-content-between align-items-start mb-1">
                                <strong className="small brand-font" style={{ fontSize: '0.95rem', color: 'var(--dp-color-field)' }}>
                                  {n.title}
                                </strong>
                                {!n.isRead && (
                                  <span
                                    className="p-1 rounded-circle ms-2 flex-shrink-0"
                                    style={{ width: '8px', height: '8px', backgroundColor: '#b69355' }}
                                  ></span>
                                )}
                              </div>
                              <p className="small text-muted mb-1" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                                {n.message}
                              </p>
                              <span className="font-monospace text-muted" style={{ fontSize: '0.7rem' }}>
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Link */}
                <Link
                  to="/profile"
                  className="text-decoration-none text-dark d-flex align-items-center gap-2 px-2 py-1"
                >
                  <User size={18} className="luxury-gold-icon" />
                  <span className="fw-semibold small">{user.fullName || user.username}</span>
                  {isAdmin ? (
                    <span className="badge bg-danger text-white font-monospace" style={{ fontSize: '0.65rem' }}>
                      ADMIN
                    </span>
                  ) : (
                    <span className="badge bg-warning text-white font-monospace" style={{ fontSize: '0.65rem' }}>
                      {user.subscriptionPlan || 'MEMBER'}
                    </span>
                  )}
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-dark btn-sm d-flex align-items-center gap-1"
                  title="Log out"
                >
                  <LogOut size={15} />
                  <span className="d-none d-md-inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
