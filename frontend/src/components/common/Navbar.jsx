import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationApi } from '../../services/api';
import {
  ChefHat,
  User,
  LogOut,
  Shield,
  Bell,
  Crown,
  Trophy,
  Sparkles,
  Clock,
  CheckCheck,
  ChevronRight,
  ArrowRight,
  X,
} from 'lucide-react';

/**
 * Intelligent categorization for 5-star culinary notifications
 */
const getNotificationMeta = (title = '', message = '') => {
  const text = `${title} ${message}`.toLowerCase();
  if (
    text.includes('vip') ||
    text.includes('pass') ||
    text.includes('subscription') ||
    text.includes('member') ||
    text.includes('plan')
  ) {
    return {
      icon: Crown,
      tag: 'VIP PRIVILEGE',
      iconClass: 'notif-icon-vip',
      ctaText: 'Access VIP Privileges',
      perkText: 'Exclusive Masterclasses • Secret Recipes • Contests',
    };
  }
  if (
    text.includes('contest') ||
    text.includes('winner') ||
    text.includes('award') ||
    text.includes('crown') ||
    text.includes('competition')
  ) {
    return {
      icon: Trophy,
      tag: 'CONTEST & AWARDS',
      iconClass: 'notif-icon-contest',
      ctaText: 'View Contest Results',
      perkText: null,
    };
  }
  if (
    text.includes('recipe') ||
    text.includes('dish') ||
    text.includes('menu') ||
    text.includes('tip') ||
    text.includes('cuisine') ||
    text.includes('masterclass')
  ) {
    return {
      icon: ChefHat,
      tag: "CHEF'S SELECTION",
      iconClass: 'notif-icon-culinary',
      ctaText: 'View Recipe & Notes',
      perkText: null,
    };
  }
  return {
    icon: Sparkles,
    tag: 'CONCIERGE ALERT',
    iconClass: 'notif-icon-general',
    ctaText: 'View Details',
    perkText: null,
  };
};

/**
 * Luxury relative time formatter (e.g. "Just now", "15m ago", "2h ago", "Yesterday")
 */
const formatNotificationTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60 && diffSec >= 0) return 'Just now';
  if (diffMin < 60 && diffMin >= 0) return `${diffMin}m ago`;
  if (diffHours < 24 && diffHours >= 0) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7 && diffDays > 0) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

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
  const [notifFilter, setNotifFilter] = useState('all');
  const notifRef = useRef(null);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showNotifDropdown) {
        setShowNotifDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showNotifDropdown]);

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
    <nav className="navbar navbar-expand-lg navbar-light luxury-navbar sticky-top">
      <div className="container-fluid px-3 px-md-4 px-xl-5">
        {/* Brand Logo in EB Garamond */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 text-decoration-none" onClick={handleNavClick}>
          <div className="luxury-brand-badge">
            <ChefHat className="luxury-gold-icon" size={20} />
          </div>
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
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-1 gap-xl-2" onClick={handleNavClick}>
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
                <NavLink to="/admin" className="nav-link nav-link-admin d-flex align-items-center gap-1">
                  <Shield size={14} />
                  <span>Admin Dashboard</span>
                </NavLink>
              </li>
            )}
          </ul>

          {/* Right Action / Auth Buttons */}
          <div className="luxury-navbar-actions d-flex align-items-center gap-2 gap-xl-3">
            {!isAuthenticated ? (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn luxury-login-btn">
                  Log In
                </Link>
                <Link to="/register" className="btn luxury-register-btn fw-semibold">
                  Subscribe & Register
                </Link>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2 gap-xl-3 w-100 justify-content-between justify-content-lg-end">
                {/* In-App Notification Bell */}
                <div className="position-relative" ref={notifRef}>
                  <button
                    type="button"
                    className={`luxury-notif-btn position-relative ${showNotifDropdown ? 'is-active' : ''}`}
                    onClick={handleToggleNotifDropdown}
                    aria-label="Notifications"
                    aria-expanded={showNotifDropdown}
                    title="In-App Notifications"
                  >
                    <Bell size={18} className="luxury-gold-icon" />
                    {unreadCount > 0 && (
                      <span
                        className="luxury-notif-badge position-absolute top-0 start-100 translate-middle"
                        data-testid="unread-badge"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifDropdown && (
                    <>
                      {/* Luxury Semi-transparent Backdrop Overlay */}
                      <div
                        className="luxury-notif-backdrop"
                        onClick={() => setShowNotifDropdown(false)}
                        aria-hidden="true"
                      />

                      {/* 5-Star Right-Side Concierge Drawer */}
                      <div
                        className="luxury-notif-drawer"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Notifications concierge panel"
                      >
                        {/* Luxury Header */}
                        <div className="luxury-notif-header">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="luxury-notif-eyebrow">Concierge Desk</span>
                            <span className="font-monospace text-muted" style={{ fontSize: '0.62rem' }}>
                              Chef James Thew
                            </span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <h3 className="luxury-notif-header-title mb-0">Notifications</h3>
                              {unreadCount > 0 && (
                                <span className="luxury-notif-count-pill">
                                  {unreadCount} new
                                </span>
                              )}
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              {unreadCount > 0 && (
                                <button
                                  type="button"
                                  className="btn luxury-notif-mark-all"
                                  onClick={handleMarkAllAsRead}
                                >
                                  <CheckCheck size={13} className="me-1" />
                                  <span>Mark all as read</span>
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn luxury-notif-close-btn"
                                onClick={() => setShowNotifDropdown(false)}
                                aria-label="Close notifications"
                                title="Close (Esc)"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Filter Tabs */}
                          <div className="luxury-notif-tabs d-flex gap-2">
                            <button
                              type="button"
                              className={`luxury-notif-tab ${notifFilter === 'all' ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setNotifFilter('all');
                              }}
                            >
                              All ({notifications.length})
                            </button>
                            <button
                              type="button"
                              className={`luxury-notif-tab ${notifFilter === 'unread' ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setNotifFilter('unread');
                              }}
                            >
                              Unread ({unreadCount})
                            </button>
                          </div>
                        </div>

                        {/* Scrollable Notification List */}
                        <div className="luxury-notif-list">
                          {(notifFilter === 'unread'
                            ? notifications.filter((n) => !n.isRead)
                            : notifications
                          ).length === 0 ? (
                            <div className="luxury-notif-empty">
                              <div className="luxury-notif-empty-icon">
                                <ChefHat size={26} />
                              </div>
                              <h4 className="luxury-notif-empty-title">
                                {notifFilter === 'unread' ? 'No Unread Alerts' : 'All Caught Up'}
                              </h4>
                              <p className="luxury-notif-empty-desc">
                                {notifFilter === 'unread'
                                  ? 'You have reviewed all concierge notifications.'
                                  : 'Your culinary concierge is up to date. Explore today’s seasonal recipes and tasting events.'}
                              </p>
                              <Link
                                to="/recipes"
                                className="luxury-notif-empty-btn"
                                onClick={() => setShowNotifDropdown(false)}
                              >
                                <span>Explore Recipes & Tips</span>
                              </Link>
                            </div>
                          ) : (
                            (notifFilter === 'unread'
                              ? notifications.filter((n) => !n.isRead)
                              : notifications
                            ).map((n) => {
                              const meta = getNotificationMeta(n.title, n.message);
                              const Icon = meta.icon;
                              return (
                                <div
                                  key={n.notificationId}
                                  className={`luxury-notif-item ${!n.isRead ? 'is-unread' : 'is-read'}`}
                                  onClick={() => handleNotificationClick(n)}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      handleNotificationClick(n);
                                    }
                                  }}
                                >
                                  <div className="d-flex align-items-start gap-3">
                                    {/* Category Icon Emblem */}
                                    <div className={`luxury-notif-avatar ${meta.iconClass}`}>
                                      <Icon size={16} />
                                    </div>

                                    {/* Body Content */}
                                    <div className="flex-grow-1 min-w-0">
                                      <div className="d-flex align-items-center justify-content-between mb-1 gap-2">
                                        <span className="luxury-notif-tag">{meta.tag}</span>
                                        <div
                                          className="d-flex align-items-center gap-1 luxury-notif-time"
                                          title={new Date(n.createdAt).toLocaleString()}
                                        >
                                          <Clock size={11} />
                                          <span>{formatNotificationTime(n.createdAt)}</span>
                                        </div>
                                      </div>

                                      <h4 className="luxury-notif-title mb-1">
                                        {n.title}
                                      </h4>

                                      <p className="luxury-notif-message mb-0">
                                        {n.message}
                                      </p>

                                      {meta.perkText && (
                                        <div className="luxury-notif-perk-pill">
                                          <span>{meta.perkText}</span>
                                        </div>
                                      )}

                                      {n.targetUrl && (
                                        <div className="luxury-notif-action-row">
                                          <span className="luxury-notif-cta-btn">
                                            <span>{meta.ctaText || 'View details'}</span>
                                            <ArrowRight size={12} className="luxury-notif-arrow" />
                                          </span>
                                          <span className="luxury-notif-tap-hint">Tap to explore</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Unread Glowing Dot */}
                                    {!n.isRead && (
                                      <div className="luxury-notif-dot-wrapper">
                                        <span className="luxury-notif-dot" title="Unread"></span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Footer Bar */}
                        <div className="luxury-notif-footer d-flex justify-content-between align-items-center">
                          <Link
                            to="/announcements"
                            className="luxury-notif-footer-link d-inline-flex align-items-center gap-1"
                            onClick={() => setShowNotifDropdown(false)}
                          >
                            <span>View Announcements</span>
                            <ArrowRight size={12} />
                          </Link>
                          <span className="luxury-notif-footer-brand">Chef James Thew</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Hairline Divider */}
                <div className="luxury-nav-divider" aria-hidden="true"></div>

                {/* User Profile Pill */}
                <Link
                  to="/profile"
                  className="luxury-user-pill"
                  title="View Profile"
                  onClick={handleNavClick}
                >
                  <div className="luxury-user-avatar">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName || user.username}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      (user.fullName || user.username || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="luxury-user-name" title={user.fullName || user.username}>
                    {user.fullName || user.username}
                  </span>
                  {isAdmin ? (
                    <span className="badge badge-luxury-admin">
                      ADMIN
                    </span>
                  ) : (
                    <span className="badge badge-luxury-gold">
                      {user.subscriptionPlan || 'MEMBER'}
                    </span>
                  )}
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="btn luxury-logout-btn"
                  title="Log out"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
