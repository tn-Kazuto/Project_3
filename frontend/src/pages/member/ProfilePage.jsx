import React, { useState, useEffect } from 'react';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageBanner } from '../../components/common/PageBanner';

// ── helpers ────────────────────────────────────────────────────────────────────

const planLabel = (plan) => {
  if (plan === 'ANNUAL') return 'Annual Pass';
  if (plan === 'MONTHLY') return 'Monthly Pass';
  return plan || 'Standard Member';
};

const planPrice = (plan) => {
  if (plan === 'ANNUAL') return '$100 / yr';
  if (plan === 'MONTHLY') return '$10 / mo';
  return '—';
};

const daysRemaining = (endDate) => {
  if (!endDate) return null;
  const diff = Math.ceil((new Date(endDate) - new Date()) / 86400000);
  return diff > 0 ? diff : 0;
};

// green > 30 days, yellow ≤ 30, red ≤ 7
const progressColor = (remaining) => {
  if (remaining === null) return 'var(--dp-color-accent)';
  if (remaining <= 7)  return '#ef4444';
  if (remaining <= 30) return '#f59e0b';
  return '#22c55e';
};

const daysTotal = (startDate, endDate) => {
  if (!startDate || !endDate) return 1;
  const diff = Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000);
  return diff > 0 ? diff : 1;
};

const initials = (name) =>
  (name || '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

// ── sub-components ─────────────────────────────────────────────────────────────

const StatusAlert = ({ success, error }) => (
  <>
    {success && (
      <div className="alert alert-success small py-2 mb-3" style={{ borderRadius: 0 }}>
        {success}
      </div>
    )}
    {error && (
      <div className="alert alert-danger small py-2 mb-3" style={{ borderRadius: 0 }}>
        {error}
      </div>
    )}
  </>
);

// ── main component ─────────────────────────────────────────────────────────────

export const ProfilePage = () => {
  const { user: authUser, updateUser } = useAuth();

  const [profile, setProfile]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [activeTab, setActiveTab]   = useState('profile');

  // Edit Profile
  const [fullName, setFullName]             = useState('');
  const [phone, setPhone]                   = useState('');
  const [savingProfile, setSavingProfile]   = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError]     = useState('');

  // Change Password
  const [currentPassword, setCurrentPassword]   = useState('');
  const [newPassword, setNewPassword]           = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');
  const [savingPassword, setSavingPassword]     = useState(false);
  const [passwordSuccess, setPasswordSuccess]   = useState('');
  const [passwordError, setPasswordError]       = useState('');

  // Renew modal
  const [showRenewModal, setShowRenewModal]         = useState(false);
  const [renewPlan, setRenewPlan]                   = useState('YEARLY');
  const [cardHolderName, setCardHolderName]         = useState('');
  const [cardNumber, setCardNumber]                 = useState('');
  const [expiryDate, setExpiryDate]                 = useState('');
  const [cvv, setCvv]                               = useState('');
  const [renewLoading, setRenewLoading]             = useState(false);
  const [renewSuccess, setRenewSuccess]             = useState('');
  const [renewError, setRenewError]                 = useState('');
  const [renewIdempotencyKey, setRenewIdempotencyKey] = useState('');

  // ── data fetching ────────────────────────────────────────────────────────────

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await authApi.getProfile();
        if (!alive) return;
        if (res.data?.success) {
          const d = res.data.data;
          setProfile(d);
          setFullName(d.fullName || '');
          setPhone(d.phone || '');
        }
      } catch {
        if (alive) setError('Unable to load your profile. Please try again.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // ── handlers ────────────────────────────────────────────────────────────────

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    if (!fullName.trim()) { setProfileError('Full name cannot be empty.'); return; }
    try {
      setSavingProfile(true);
      const res = await authApi.updateProfile({ fullName, phone: phone.trim() || null });
      if (res.data?.success) {
        setProfile(res.data.data);
        setProfileSuccess('Profile updated successfully!');
        updateUser?.(res.data.data);
      } else {
        setProfileError(res.data?.message || 'Failed to update profile.');
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Update failed.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');
    if (!currentPassword) { setPasswordError('Please enter your current password.'); return; }
    if (!newPassword || newPassword.length < 6) { setPasswordError('New password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('New passwords do not match.'); return; }
    try {
      setSavingPassword(true);
      const res = await authApi.changePassword({ currentPassword, newPassword });
      if (res.data?.success) {
        setPasswordSuccess('Password changed successfully!');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      } else {
        setPasswordError(res.data?.message || 'Failed to change password.');
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRenewSubscription = async (e) => {
    e.preventDefault();
    setRenewSuccess(''); setRenewError('');
    if (!cardHolderName.trim() || !cardNumber.trim() || !expiryDate.trim() || !cvv.trim()) {
      setRenewError('Please complete all payment card details.'); return;
    }
    try {
      setRenewLoading(true);
      const key = renewIdempotencyKey || crypto.randomUUID();
      setRenewIdempotencyKey(key);
      const res = await authApi.renewSubscription(
        { planType: renewPlan, cardHolderName: cardHolderName.trim(), cardNumber: cardNumber.trim(), expiryDate: expiryDate.trim(), cvv: cvv.trim() },
        key,
      );
      if (res.data?.success) {
        setProfile(res.data.data);
        setRenewSuccess('Subscription successfully renewed!');
        updateUser?.(res.data.data);
        setRenewIdempotencyKey('');
        setTimeout(() => { setShowRenewModal(false); setRenewSuccess(''); setCardNumber(''); setCvv(''); }, 1200);
      } else {
        setRenewError(res.data?.message || 'Failed to renew subscription.');
      }
    } catch (err) {
      setRenewError(err.response?.data?.message || 'Payment simulation failed.');
    } finally {
      setRenewLoading(false);
    }
  };

  // ── loading state ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="container py-5" role="status" aria-label="Loading profile">
        <div className="p-4 p-md-5 mb-4" style={{ border: '1px solid var(--dp-color-rule)' }}>
          <div className="culinary-skeleton-block mb-3" style={{ width: '160px', height: '1.1rem' }} />
          <div className="culinary-skeleton-block mb-4" style={{ width: '300px', height: '2.4rem' }} />
          <div className="row g-4">
            {[1, 2].map((i) => (
              <div key={i} className="col-md-6">
                <div className="culinary-skeleton-block" style={{ height: '200px' }} />
              </div>
            ))}
          </div>
        </div>
        <span className="visually-hidden">Loading member profile…</span>
      </div>
    );
  }

  // ── computed values ──────────────────────────────────────────────────────────

  const remaining = profile ? daysRemaining(profile.subscriptionEnd) : null;
  const total     = profile ? daysTotal(profile.subscriptionStart, profile.subscriptionEnd) : 1;
  const pct       = remaining !== null ? Math.round((remaining / total) * 100) : 0;
  const isExpiring = remaining !== null && remaining <= 30;

  const TAB_STYLE = (key) => ({
    background: activeTab === key ? 'var(--dp-color-field)' : 'transparent',
    color: activeTab === key ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
    border: activeTab === key ? '1px solid var(--dp-color-accent)' : '1px solid var(--dp-color-rule)',
    borderRadius: 0,
    letterSpacing: '0.12em',
    fontFamily: 'monospace',
    fontSize: '0.78rem',
    padding: '0.45rem 1.1rem',
    cursor: 'pointer',
  });

  const INPUT_STYLE = {
    borderColor: 'var(--dp-color-rule)',
    borderRadius: 0,
    backgroundColor: 'var(--dp-color-ground-2)',
  };

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="container py-5 luxury-profile">

      <PageBanner
        tag="III · CULINARY DOSSIER"
        title="My Account Profile"
        subtitle="Manage your culinary profile, subscription, and security settings."
        imageUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=80"
        className="mb-4"
      />

      {error && (
        <div className="alert alert-danger mb-4" style={{ borderRadius: 0 }}>{error}</div>
      )}

      {profile && (
        <div className="row g-4 align-items-start">

          {/* ── LEFT: Identity & Membership card ───────────────────────── */}
          <div className="col-lg-4">

            {/* Avatar + name */}
            <div
              className="p-4 p-md-5 mb-3 text-center position-relative overflow-hidden"
              style={{
                backgroundColor: 'var(--dp-color-field)',
                border: '1px solid var(--dp-color-accent)',
                borderTop: '3px solid var(--dp-color-accent)',
              }}
            >
              {/* Avatar circle */}
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{
                  width: 88, height: 88,
                  borderRadius: '50%',
                  backgroundColor: 'var(--dp-color-accent)',
                  color: 'var(--dp-color-field)',
                  fontSize: '1.9rem',
                  fontFamily: 'var(--dp-font-brand)',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  border: '3px solid rgba(255,255,255,0.15)',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                {initials(profile.fullName || profile.username)}
              </div>

              <h2
                className="brand-font text-white mb-1"
                style={{ fontSize: '1.45rem', lineHeight: 1.2 }}
              >
                {profile.fullName || profile.username}
              </h2>
              <p className="font-monospace mb-3" style={{ color: 'var(--dp-color-on-field-2)', fontSize: '0.8rem' }}>
                @{profile.username}
              </p>

              <span
                className="badge font-monospace px-3 py-1"
                style={{
                  backgroundColor: profile.role === 'ADMIN' ? '#8b0000' : 'var(--dp-color-accent)',
                  color: profile.role === 'ADMIN' ? '#fff' : 'var(--dp-color-field)',
                  borderRadius: 0,
                  fontSize: '0.7rem',
                  letterSpacing: '0.15em',
                }}
              >
                {profile.role}
              </span>

              {/* Divider */}
              <div className="mt-4 mb-3" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }} />

              {/* Contact info */}
              <div className="d-flex flex-column gap-2 text-start">
                {[
                  { label: 'EMAIL', value: profile.email },
                  { label: 'TEL', value: profile.phone || 'Not registered' },
                ].map(({ label, value }) => (
                  <div key={label} className="d-flex justify-content-between align-items-center gap-2">
                    <span className="font-monospace" style={{ color: 'var(--dp-color-accent)', fontSize: '0.7rem', letterSpacing: '0.12em', flexShrink: 0 }}>
                      {label}
                    </span>
                    <span className="font-monospace text-end text-white-50" style={{ fontSize: '0.78rem', wordBreak: 'break-all' }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Membership card */}
            <div
              className="p-4 vip-gold-sheen"
              style={{
                backgroundColor: 'var(--dp-color-field)',
                border: '1px solid var(--dp-color-accent)',
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="roman-numeral" style={{ color: 'var(--dp-color-accent)', fontSize: '0.72rem' }}>
                  MEMBERSHIP PASS
                </span>
                <span
                  className={`badge font-monospace`}
                  style={{
                    backgroundColor: profile.isSubscriptionActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    color: profile.isSubscriptionActive ? '#4ade80' : '#f87171',
                    border: `1px solid ${profile.isSubscriptionActive ? '#4ade80' : '#f87171'}`,
                    borderRadius: 0,
                    fontSize: '0.65rem',
                    letterSpacing: '0.1em',
                  }}
                >
                  {profile.isSubscriptionActive ? '● ACTIVE' : '● EXPIRED'}
                </span>
              </div>

              {/* Plan name */}
              <div className="mb-1">
                <span className="text-white fw-bold" style={{ fontSize: '1.05rem', fontFamily: 'var(--dp-font-brand)' }}>
                  {planLabel(profile.subscriptionPlan)}
                </span>
                <span className="font-monospace ms-2" style={{ color: 'var(--dp-color-accent)', fontSize: '0.78rem' }}>
                  {planPrice(profile.subscriptionPlan)}
                </span>
              </div>

              {/* Dates */}
              <div className="d-flex flex-column gap-1 mb-3" style={{ fontSize: '0.75rem', color: 'var(--dp-color-on-field-2)' }}>
                {profile.subscriptionStart && (
                  <div className="d-flex justify-content-between">
                    <span>Active since</span>
                    <span className="text-white font-monospace">{fmt(profile.subscriptionStart)}</span>
                  </div>
                )}
                {profile.subscriptionEnd && (
                  <div className="d-flex justify-content-between">
                    <span>Renews</span>
                    <span className={`font-monospace ${isExpiring ? 'text-warning' : 'text-white'}`}>
                      {fmt(profile.subscriptionEnd)}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {remaining !== null && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'monospace' }}>
                    <span style={{ color: progressColor(remaining) }}>
                      {remaining <= 7 ? '⚠ Expiring very soon' : remaining <= 30 ? '⚠ Expiring soon' : `${remaining} days remaining`}
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div style={{ height: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: progressColor(remaining),
                        borderRadius: 3,
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              {profile.role !== 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => {
                    setRenewError(''); setRenewSuccess('');
                    setCardHolderName(profile.fullName || profile.username);
                    setShowRenewModal(true);
                  }}
                  className="btn w-100 font-monospace text-uppercase fw-semibold py-2 mt-1"
                  style={{
                    border: '1px solid var(--dp-color-accent)',
                    color: 'var(--dp-color-accent)',
                    backgroundColor: 'transparent',
                    borderRadius: 0,
                    fontSize: '0.75rem',
                    letterSpacing: '0.14em',
                  }}
                >
                  Renew or Upgrade Pass
                </button>
              )}
            </div>
          </div>

          {/* ── RIGHT: Tabs ─────────────────────────────────────────────── */}
          <div className="col-lg-8">

            {/* Tab nav */}
            <div className="d-flex gap-0 mb-0">
              {[
                { key: 'profile', label: 'Edit Profile' },
                { key: 'security', label: 'Security' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  style={{
                    background: activeTab === key ? '#ffffff' : 'var(--dp-color-ground-2)',
                    color: activeTab === key ? 'var(--dp-color-field)' : 'var(--dp-color-ink)',
                    borderTop: `2px solid ${activeTab === key ? 'var(--dp-color-accent)' : 'var(--dp-color-rule)'}`,
                    borderLeft: `1px solid ${activeTab === key ? 'var(--dp-color-rule)' : 'var(--dp-color-rule)'}`,
                    borderRight: `1px solid ${activeTab === key ? 'var(--dp-color-rule)' : 'var(--dp-color-rule)'}`,
                    borderBottom: activeTab === key ? '1px solid #ffffff' : '1px solid var(--dp-color-rule)',
                    borderRadius: 0,
                    letterSpacing: '0.1em',
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    padding: '0.55rem 1.4rem',
                    cursor: 'pointer',
                    marginBottom: activeTab === key ? '-1px' : 0,
                    fontWeight: activeTab === key ? 600 : 400,
                    zIndex: activeTab === key ? 1 : 0,
                    position: 'relative',
                  }}
                  onClick={() => setActiveTab(key)}
                  aria-pressed={activeTab === key}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab panel */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--dp-color-rule)',
              }}
              className="p-4 p-md-5"
            >

              {/* ── Tab: Edit Profile ───────────────────────────────── */}
              {activeTab === 'profile' && (
                <>
                  <h4 className="brand-font mb-1 text-dark">Edit Profile Details</h4>
                  <p className="small text-muted mb-4" style={{ lineHeight: 1.65 }}>
                    Update your display name and contact phone number.
                  </p>

                  <StatusAlert success={profileSuccess} error={profileError} />

                  <form onSubmit={handleUpdateProfile}>
                    <div className="row g-3 mb-4">
                      <div className="col-12">
                        <label className="form-label small fw-semibold" htmlFor="pf-fullname">Full Name *</label>
                        <input
                          id="pf-fullname"
                          type="text"
                          className="form-control"
                          style={INPUT_STYLE}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-semibold" htmlFor="pf-username">
                          Username <span className="font-monospace fw-normal text-muted" style={{ fontSize: '0.7rem' }}>· read-only</span>
                        </label>
                        <input
                          id="pf-username"
                          type="text"
                          className="form-control"
                          style={{ ...INPUT_STYLE, opacity: 0.6, cursor: 'not-allowed' }}
                          value={profile.username}
                          readOnly
                          aria-readonly="true"
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-semibold" htmlFor="pf-email">
                          Email Address <span className="font-monospace fw-normal text-muted" style={{ fontSize: '0.7rem' }}>· read-only</span>
                        </label>
                        <input
                          id="pf-email"
                          type="email"
                          className="form-control"
                          style={{ ...INPUT_STYLE, opacity: 0.6, cursor: 'not-allowed' }}
                          value={profile.email}
                          readOnly
                          aria-readonly="true"
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-semibold" htmlFor="pf-phone">Phone Number</label>
                        <input
                          id="pf-phone"
                          type="tel"
                          className="form-control"
                          style={INPUT_STYLE}
                          placeholder="+1 (555) 000-0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="btn px-5 fw-semibold"
                      style={{
                        backgroundColor: 'var(--dp-color-accent)',
                        color: 'var(--dp-color-field)',
                        border: '1px solid var(--dp-color-accent)',
                        letterSpacing: '0.14em',
                        borderRadius: 0,
                      }}
                    >
                      {savingProfile ? 'Saving…' : 'Save Changes'}
                    </button>
                  </form>
                </>
              )}

              {/* ── Tab: Security ───────────────────────────────────── */}
              {activeTab === 'security' && (
                <>
                  <h4 className="brand-font mb-1 text-dark">Security &amp; Password</h4>
                  <p className="small text-muted mb-4" style={{ lineHeight: 1.65 }}>
                    Update your password to keep your culinary atelier account secure.
                    Use at least 6 characters.
                  </p>

                  <StatusAlert success={passwordSuccess} error={passwordError} />

                  <form onSubmit={handleChangePassword}>
                    <div className="row g-3 mb-4">
                      <div className="col-12">
                        <label className="form-label small fw-semibold" htmlFor="sec-current">Current Password *</label>
                        <input
                          id="sec-current"
                          type="password"
                          className="form-control"
                          style={INPUT_STYLE}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold" htmlFor="sec-new">New Password *</label>
                        <input
                          id="sec-new"
                          type="password"
                          className="form-control"
                          style={INPUT_STYLE}
                          placeholder="Min 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold" htmlFor="sec-confirm">Confirm New Password *</label>
                        <input
                          id="sec-confirm"
                          type="password"
                          className="form-control"
                          style={{
                            ...INPUT_STYLE,
                            borderColor: confirmPassword && confirmPassword !== newPassword
                              ? '#dc3545'
                              : confirmPassword && confirmPassword === newPassword
                              ? '#198754'
                              : 'var(--dp-color-rule)',
                          }}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                          aria-describedby="confirm-hint"
                        />
                        {confirmPassword && (
                          <div
                            id="confirm-hint"
                            className="form-text small"
                            style={{ color: confirmPassword === newPassword ? '#198754' : '#dc3545' }}
                          >
                            {confirmPassword === newPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingPassword}
                      className="btn px-5 fw-semibold"
                      style={{
                        backgroundColor: 'transparent',
                        color: 'var(--dp-color-ink)',
                        border: '1px solid var(--dp-color-accent)',
                        letterSpacing: '0.14em',
                        borderRadius: 0,
                      }}
                    >
                      {savingPassword ? 'Updating…' : 'Change Password'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Renew / Upgrade Modal ──────────────────────────────────────────── */}
      {showRenewModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(18,17,16,0.78)', zIndex: 1050 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="renew-modal-title"
          onKeyDown={(e) => { if (e.key === 'Escape') setShowRenewModal(false); }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 520 }}>
            <div
              className="modal-content shadow-lg"
              style={{
                backgroundColor: 'var(--dp-color-field)',
                color: 'var(--dp-color-on-field)',
                border: '1px solid var(--dp-color-accent)',
                borderRadius: 0,
              }}
            >
              {/* Modal header */}
              <div
                className="modal-header d-flex justify-content-between align-items-center p-4 border-bottom"
                style={{ borderColor: 'rgba(182,147,85,0.3)' }}
              >
                <div>
                  <div className="roman-numeral small mb-1" style={{ color: 'var(--dp-color-accent)' }}>
                    ATELIER SUBSCRIPTION
                  </div>
                  <h4 id="renew-modal-title" className="brand-font m-0 text-white" style={{ fontSize: '1.4rem' }}>
                    Renew or Upgrade Pass
                  </h4>
                </div>
                <button
                  type="button"
                  className="btn text-white p-1 fs-4"
                  onClick={() => setShowRenewModal(false)}
                  style={{ borderRadius: 0, lineHeight: 1, background: 'none', border: 'none' }}
                  aria-label="Close renewal modal"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleRenewSubscription} className="p-4">
                <StatusAlert success={renewSuccess} error={renewError} />

                {/* Plan selector */}
                <label className="form-label small fw-semibold text-uppercase mb-2" style={{ color: 'var(--dp-color-accent)', letterSpacing: '0.12em' }}>
                  Select Pass Tier
                </label>
                <div className="row g-2 mb-4">
                  {[
                    { key: 'MONTHLY', name: 'Monthly Pass', price: '$10', sub: '30 days' },
                    { key: 'YEARLY',  name: 'Annual Pass',  price: '$100', sub: '365 days', best: true },
                  ].map(({ key, name, price, sub, best }) => (
                    <div key={key} className="col-6">
                      <button
                        type="button"
                        onClick={() => { setRenewIdempotencyKey(''); setRenewPlan(key); }}
                        className="w-100 p-3 text-center position-relative"
                        style={{
                          background: renewPlan === key ? 'rgba(182,147,85,0.15)' : 'transparent',
                          border: `1px solid ${renewPlan === key ? 'var(--dp-color-accent)' : 'rgba(255,255,255,0.18)'}`,
                          borderRadius: 0,
                          cursor: 'pointer',
                        }}
                        aria-pressed={renewPlan === key}
                      >
                        {best && (
                          <span
                            className="badge position-absolute top-0 start-50 translate-middle font-monospace"
                            style={{ backgroundColor: 'var(--dp-color-accent)', color: 'var(--dp-color-field)', fontSize: '0.6rem' }}
                          >
                            BEST VALUE
                          </span>
                        )}
                        <div className="small fw-semibold text-white">{name}</div>
                        <div className="font-monospace fw-bold fs-5 mt-1" style={{ color: 'var(--dp-color-accent)' }}>{price}</div>
                        <div className="text-muted small">{sub}</div>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Card fields */}
                {[
                  { id: 'rn-name',   label: 'Cardholder Name *',    type: 'text',     val: cardHolderName, set: setCardHolderName, ph: 'Full Name as on Card' },
                  { id: 'rn-number', label: 'Mock Card Number *',   type: 'text',     val: cardNumber,     set: setCardNumber,     ph: '4532 1234 5678 9012' },
                ].map(({ id, label, type, val, set, ph }) => (
                  <div key={id} className="mb-3">
                    <label className="form-label small text-muted" htmlFor={id}>{label}</label>
                    <input
                      id={id} type={type}
                      className="form-control font-monospace"
                      style={{ backgroundColor: '#2a2826', color: '#fff', borderColor: 'rgba(255,255,255,0.18)', borderRadius: 0 }}
                      value={val}
                      onChange={(e) => { setRenewIdempotencyKey(''); set(e.target.value); }}
                      placeholder={ph}
                      required
                    />
                  </div>
                ))}

                <div className="row g-2 mb-4">
                  <div className="col-6">
                    <label className="form-label small text-muted" htmlFor="rn-expiry">Expiry (MM/YY) *</label>
                    <input
                      id="rn-expiry" type="text"
                      className="form-control font-monospace"
                      style={{ backgroundColor: '#2a2826', color: '#fff', borderColor: 'rgba(255,255,255,0.18)', borderRadius: 0 }}
                      value={expiryDate}
                      onChange={(e) => { setRenewIdempotencyKey(''); setExpiryDate(e.target.value); }}
                      placeholder="12/28"
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted" htmlFor="rn-cvv">CVV *</label>
                    <input
                      id="rn-cvv" type="password" maxLength={4}
                      className="form-control font-monospace"
                      style={{ backgroundColor: '#2a2826', color: '#fff', borderColor: 'rgba(255,255,255,0.18)', borderRadius: 0 }}
                      value={cvv}
                      onChange={(e) => { setRenewIdempotencyKey(''); setCvv(e.target.value); }}
                      placeholder="123"
                      required
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex justify-content-end gap-2 pt-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <button
                    type="button"
                    onClick={() => setShowRenewModal(false)}
                    className="btn px-4 font-monospace"
                    style={{ borderRadius: 0, border: '1px solid rgba(255,255,255,0.2)', color: '#fff', background: 'transparent' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={renewLoading}
                    className="btn px-4 fw-bold font-monospace"
                    style={{
                      backgroundColor: 'var(--dp-color-accent)',
                      borderColor: 'var(--dp-color-accent)',
                      color: 'var(--dp-color-field)',
                      borderRadius: 0,
                    }}
                  >
                    {renewLoading ? 'Processing…' : `Confirm & Pay ${renewPlan === 'MONTHLY' ? '$10' : '$100'}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
