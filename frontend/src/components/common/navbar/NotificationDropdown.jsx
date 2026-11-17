import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationApi } from '../../../services/api';

/**
 * Intelligent categorization for 5-star culinary notifications (pure typography, zero icons)
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
      tag: "CHEF'S SELECTION",
      iconClass: 'notif-icon-culinary',
      ctaText: 'View Recipe & Notes',
      perkText: null,
    };
  }
  return {
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

export const NotificationDropdown = ({ isAuthenticated, userId }) => {
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
  }, [isAuthenticated, userId]);

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

  if (!isAuthenticated) return null;

  return (
    <div className="position-relative" ref={notifRef}>
      <button
        type="button"
        className={`luxury-notif-btn position-relative ${showNotifDropdown ? 'is-active' : ''}`}
        onClick={handleToggleNotifDropdown}
        aria-label="Notifications"
        aria-expanded={showNotifDropdown}
        title="In-App Notifications"
        style={{ width: 'auto', minWidth: '42px', padding: '0.35rem 0.65rem' }}
      >
        <span className="font-monospace fw-semibold" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>
          NOTICES
        </span>
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
                      Mark all as read
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn luxury-notif-close-btn"
                    onClick={() => setShowNotifDropdown(false)}
                    aria-label="Close notifications"
                    title="Close (Esc)"
                  >
                    ✕
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
                  <div className="luxury-notif-empty-icon font-monospace fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                    [ATELIER CLEAR]
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
                        {/* Category Emblem */}
                        <div className={`luxury-notif-avatar font-monospace fw-bold ${meta.iconClass}`} style={{ fontSize: '0.65rem' }}>
                          {meta.tag.split(' ')[0].substring(0, 4)}
                        </div>

                        {/* Body Content */}
                        <div className="flex-grow-1 min-w-0">
                          <div className="d-flex align-items-center justify-content-between mb-1 gap-2">
                            <span className="luxury-notif-tag">{meta.tag}</span>
                            <div
                              className="d-flex align-items-center gap-1 luxury-notif-time"
                              title={new Date(n.createdAt).toLocaleString()}
                            >
                              <span>{formatNotificationTime(n.createdAt)}</span>
                            </div>
                          </div>

                          <h5 className="luxury-notif-item-title mb-1">
                            {n.title}
                          </h5>
                          <p className="luxury-notif-item-message mb-1">
                            {n.message}
                          </p>

                          {/* Perk subtitle */}
                          {meta.perkText && (
                            <p className="luxury-notif-perk">{meta.perkText}</p>
                          )}

                          {/* Action link */}
                          {n.targetUrl && (
                            <div className="luxury-notif-action d-flex align-items-center justify-content-between mt-2 pt-2 border-top border-light">
                              <span className="luxury-notif-action-link d-inline-flex align-items-center gap-1">
                                <span>{meta.ctaText || 'View details'}</span>
                                <span>&rarr;</span>
                              </span>
                              <span className="luxury-notif-tap-hint">Tap to explore</span>
                            </div>
                          )}
                        </div>

                        {/* Unread Indicator Dot */}
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
                <span>&rarr;</span>
              </Link>
              <span className="luxury-notif-footer-brand">Chef James Thew</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
