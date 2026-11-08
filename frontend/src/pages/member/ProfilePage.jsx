import React, { useState, useEffect } from 'react';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const ProfilePage = () => {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit Profile Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Change Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Renew / Upgrade Subscription state
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewPlan, setRenewPlan] = useState('YEARLY');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [renewLoading, setRenewLoading] = useState(false);
  const [renewSuccess, setRenewSuccess] = useState('');
  const [renewError, setRenewError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authApi.getProfile();
      if (res.data && res.data.success) {
        const data = res.data.data;
        setProfile(data);
        setFullName(data.fullName || '');
        setPhone(data.phone || '');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load your profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!fullName.trim()) {
      setProfileError('Full name cannot be empty.');
      return;
    }

    try {
      setSavingProfile(true);
      const res = await authApi.updateProfile({
        fullName,
        phone: phone.trim() || null,
      });

      if (res.data && res.data.success) {
        const updated = res.data.data;
        setProfile(updated);
        setProfileSuccess('Profile details updated successfully!');
        if (updateUser) {
          updateUser(updated);
        }
      } else {
        setProfileError(res.data?.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Update failed.';
      setProfileError(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setSavingPassword(true);
      const res = await authApi.changePassword({
        currentPassword,
        newPassword,
      });

      if (res.data && res.data.success) {
        setPasswordSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res.data?.message || 'Failed to change password.');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Failed to change password.';
      setPasswordError(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRenewSubscription = async (e) => {
    e.preventDefault();
    setRenewSuccess('');
    setRenewError('');

    if (!cardHolderName.trim() || !cardNumber.trim() || !expiryDate.trim() || !cvv.trim()) {
      setRenewError('Please complete all mock payment card details.');
      return;
    }

    try {
      setRenewLoading(true);
      const res = await authApi.renewSubscription({
        planType: renewPlan,
        cardHolderName: cardHolderName.trim(),
        cardNumber: cardNumber.trim(),
        expiryDate: expiryDate.trim(),
        cvv: cvv.trim(),
      });

      if (res.data && res.data.success) {
        const updated = res.data.data;
        setProfile(updated);
        setRenewSuccess('Subscription pass successfully renewed!');
        if (updateUser) {
          updateUser(updated);
        }
        setTimeout(() => {
          setShowRenewModal(false);
          setRenewSuccess('');
          setCardNumber('');
          setCvv('');
        }, 1200);
      } else {
        setRenewError(res.data?.message || 'Failed to renew subscription.');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Payment simulation failed.';
      setRenewError(msg);
    } finally {
      setRenewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" style={{ color: 'var(--dp-color-accent)' }} role="status">
          <span className="visually-hidden">Loading profile...</span>
        </div>
        <p className="text-muted mt-2">Loading member profile...</p>
      </div>
    );
  }

  return (
    <div className="container py-5 luxury-profile">
      {/* Page Title & Header */}
      <div className="d-flex align-items-center gap-3 mb-5 pb-3 border-bottom" style={{ borderColor: 'var(--dp-color-rule)' }}>
        <div
          className="p-3 d-flex align-items-center justify-content-center font-monospace fw-bold"
          style={{
            backgroundColor: 'var(--dp-color-field)',
            color: 'var(--dp-color-accent)',
            border: '1px solid var(--dp-color-accent)',
            minWidth: '48px',
          }}
        >
          [VIP]
        </div>
        <div>
          <div className="roman-numeral mb-0" style={{ fontSize: '0.9rem' }}>III &middot; CULINARY DOSSIER</div>
          <h1 className="brand-font display-6 m-0 text-dark">My Account Profile</h1>
          <p className="text-muted small mb-0 mt-1">Manage your culinary profile, view subscription status, and update security.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4" style={{ borderRadius: 0 }}>
          <span>{error}</span>
        </div>
      )}

      {profile && (
        <div className="row g-4">
          {/* Left Column: VIP Membership Card & Account Overview */}
          <div className="col-lg-5">
            <div
              className="p-4 p-md-5 mb-4"
              style={{
                backgroundColor: 'var(--dp-color-field)',
                color: 'var(--dp-color-on-field)',
                border: '1px solid var(--dp-color-accent)',
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="roman-numeral" style={{ color: 'var(--dp-color-accent)', fontSize: '0.85rem' }}>
                  MEMBERSHIP CARD
                </span>
                <span
                  className="badge font-monospace"
                  style={{
                    backgroundColor: profile.role === 'ADMIN' ? '#8b0000' : 'var(--dp-color-accent)',
                    color: '#ffffff',
                    borderRadius: 0,
                  }}
                >
                  {profile.role}
                </span>
              </div>

              <h3 className="brand-font mb-1 text-white" style={{ fontSize: '1.65rem' }}>
                {profile.fullName || profile.username}
              </h3>
              <p className="small mb-4 font-monospace" style={{ color: 'var(--dp-color-on-field-2)' }}>
                @{profile.username}
              </p>

              <div className="ruled-row border-secondary opacity-50 my-3"></div>

              {/* Subscription Status */}
              <div className="d-flex flex-column gap-2 small" style={{ color: 'var(--dp-color-on-field-2)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Subscription Plan:</span>
                  <span className="text-white fw-bold font-monospace">
                    {profile.subscriptionPlan === 'ANNUAL'
                      ? 'Annual Pass ($100/yr)'
                      : profile.subscriptionPlan === 'MONTHLY'
                      ? 'Monthly Pass ($10/mo)'
                      : profile.subscriptionPlan || 'Standard Member'}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Status:</span>
                  <span className="badge bg-success font-monospace" style={{ borderRadius: 0 }}>
                    {profile.isSubscriptionActive ? 'Active Plan' : 'Expired'}
                  </span>
                </div>
                {profile.subscriptionStart && (
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Active Since:</span>
                    <span className="text-white font-monospace">
                      {new Date(profile.subscriptionStart).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {profile.subscriptionEnd && (
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Renewal Date:</span>
                    <span className="text-white font-monospace">
                      {new Date(profile.subscriptionEnd).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {profile.role !== 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => {
                    setRenewError('');
                    setRenewSuccess('');
                    setCardHolderName(profile.fullName || profile.username);
                    setShowRenewModal(true);
                  }}
                  className="btn btn-outline-warning w-100 mt-4 font-monospace text-uppercase fw-semibold py-2"
                  style={{
                    borderColor: 'var(--dp-color-accent)',
                    color: 'var(--dp-color-accent)',
                    borderRadius: 0,
                    fontSize: '0.8rem',
                    letterSpacing: '0.12em',
                  }}
                >
                  Renew or Upgrade Pass
                </button>
              )}
            </div>

            {/* Email & Phone Details Card */}
            <div
              className="p-4"
              style={{
                backgroundColor: 'var(--dp-color-ground-2)',
                border: '1px solid var(--dp-color-panel-line)',
              }}
            >
              <h5 className="brand-font mb-3 text-dark">Contact Information</h5>
              <div className="d-flex flex-column gap-3 small">
                <div className="d-flex align-items-center justify-content-between">
                  <span className="small text-muted font-monospace">EMAIL:</span>
                  <span className="text-dark font-monospace">{profile.email}</span>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <span className="small text-muted font-monospace">TEL:</span>
                  <span className="text-dark font-monospace">{profile.phone || 'No phone registered'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Edit Profile & Security Forms */}
          <div className="col-lg-7">
            {/* Form 1: Edit Profile */}
            <div
              className="p-4 p-md-5 mb-4"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--dp-color-rule)',
              }}
            >
              <h4 className="brand-font mb-2 text-dark">Edit Profile Details</h4>
              <p className="small text-muted mb-4">Update your display name and contact phone number.</p>

              {profileSuccess && (
                <div className="alert alert-success small py-2 mb-3" style={{ borderRadius: 0 }}>
                  <span>{profileSuccess}</span>
                </div>
              )}
              {profileError && (
                <div className="alert alert-danger small py-2 mb-3" style={{ borderRadius: 0 }}>
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ borderColor: 'var(--dp-color-rule)', borderRadius: 0 }}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    style={{ borderColor: 'var(--dp-color-rule)', borderRadius: 0 }}
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn btn-primary px-4 fw-semibold"
                  style={{
                    backgroundColor: 'var(--dp-color-field)',
                    color: 'var(--dp-color-on-field)',
                    letterSpacing: '0.14em',
                    borderRadius: 0,
                  }}
                >
                  <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </form>
            </div>

            {/* Form 2: Change Password */}
            <div
              className="p-4 p-md-5"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--dp-color-rule)',
              }}
            >
              <h4 className="brand-font mb-2 text-dark">Security &amp; Password</h4>
              <p className="small text-muted mb-4">Update your password to keep your culinary atelier secure.</p>

              {passwordSuccess && (
                <div className="alert alert-success small py-2 mb-3" style={{ borderRadius: 0 }}>
                  <span>{passwordSuccess}</span>
                </div>
              )}
              {passwordError && (
                <div className="alert alert-danger small py-2 mb-3" style={{ borderRadius: 0 }}>
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Current Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    style={{ borderColor: 'var(--dp-color-rule)', borderRadius: 0 }}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">New Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      style={{ borderColor: 'var(--dp-color-rule)', borderRadius: 0 }}
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Confirm New Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      style={{ borderColor: 'var(--dp-color-rule)', borderRadius: 0 }}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="btn btn-outline-secondary px-4 fw-semibold"
                  style={{
                    borderColor: 'var(--dp-color-accent)',
                    color: 'var(--dp-color-ink)',
                    letterSpacing: '0.14em',
                    borderRadius: 0,
                  }}
                >
                  <span>{savingPassword ? 'Updating...' : 'Change Password'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Renew / Upgrade Subscription Modal */}
      {showRenewModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(18, 17, 16, 0.75)', zIndex: 1050 }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '520px' }}>
            <div
              className="modal-content shadow-lg"
              style={{
                backgroundColor: 'var(--dp-color-field)',
                color: 'var(--dp-color-on-field)',
                border: '1px solid var(--dp-color-accent)',
                borderRadius: 0,
              }}
            >
              <div
                className="modal-header d-flex justify-content-between align-items-center p-4 border-bottom"
                style={{ borderColor: 'rgba(182, 147, 85, 0.3)' }}
              >
                <div>
                  <div className="roman-numeral small mb-1" style={{ color: 'var(--dp-color-accent)' }}>
                    ATELIER SUBSCRIPTION
                  </div>
                  <h4 className="brand-font m-0 text-white" style={{ fontSize: '1.45rem' }}>
                    Renew or Upgrade Pass
                  </h4>
                </div>
                <button
                  type="button"
                  className="btn text-white p-1 font-monospace fs-4"
                  onClick={() => setShowRenewModal(false)}
                  style={{ borderRadius: 0, lineHeight: 1 }}
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleRenewSubscription} className="p-4">
                {renewSuccess && (
                  <div
                    className="alert alert-success small py-2 mb-3"
                    style={{ borderRadius: 0 }}
                  >
                    <span>{renewSuccess}</span>
                  </div>
                )}
                {renewError && (
                  <div
                    className="alert alert-danger small py-2 mb-3"
                    style={{ borderRadius: 0 }}
                  >
                    <span>{renewError}</span>
                  </div>
                )}

                <label className="form-label small fw-semibold text-uppercase tracking-wider" style={{ color: 'var(--dp-color-accent)' }}>
                  Select Pass Tier
                </label>
                <div className="row g-2 mb-4">
                  <div className="col-6">
                    <div
                      className={`p-3 text-center cursor-pointer border ${renewPlan === 'MONTHLY' ? 'border-warning' : 'border-secondary'}`}
                      onClick={() => setRenewPlan('MONTHLY')}
                      style={{
                        backgroundColor: renewPlan === 'MONTHLY' ? 'rgba(182, 147, 85, 0.15)' : 'transparent',
                        borderColor: renewPlan === 'MONTHLY' ? 'var(--dp-color-accent)' : 'rgba(255,255,255,0.2)',
                        borderRadius: 0,
                        cursor: 'pointer',
                      }}
                    >
                      <div className="small fw-semibold text-white">Monthly Pass</div>
                      <div className="font-monospace text-warning fw-bold fs-5 mt-1">$10</div>
                      <div className="text-muted small">30 days access</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div
                      className={`p-3 text-center cursor-pointer border ${renewPlan === 'YEARLY' ? 'border-warning' : 'border-secondary'}`}
                      onClick={() => setRenewPlan('YEARLY')}
                      style={{
                        backgroundColor: renewPlan === 'YEARLY' ? 'rgba(182, 147, 85, 0.15)' : 'transparent',
                        borderColor: renewPlan === 'YEARLY' ? 'var(--dp-color-accent)' : 'rgba(255,255,255,0.2)',
                        borderRadius: 0,
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                    >
                      <span
                        className="badge position-absolute top-0 start-50 translate-middle font-monospace"
                        style={{ backgroundColor: 'var(--dp-color-accent)', color: '#1a1918', fontSize: '0.65rem' }}
                      >
                        BEST VALUE
                      </span>
                      <div className="small fw-semibold text-white">Annual Pass</div>
                      <div className="font-monospace text-warning fw-bold fs-5 mt-1">$100</div>
                      <div className="text-muted small">365 days access</div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-muted">Cardholder Name *</label>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    style={{ backgroundColor: '#2a2826', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)', borderRadius: 0 }}
                    value={cardHolderName}
                    onChange={(e) => setCardHolderName(e.target.value)}
                    placeholder="Full Name as on Card"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small text-muted">Mock Card Number *</label>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    style={{ backgroundColor: '#2a2826', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)', borderRadius: 0 }}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4532 1234 5678 9012"
                    required
                  />
                </div>

                <div className="row g-2 mb-4">
                  <div className="col-6">
                    <label className="form-label small text-muted">Expiry (MM/YY) *</label>
                    <input
                      type="text"
                      className="form-control font-monospace"
                      style={{ backgroundColor: '#2a2826', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)', borderRadius: 0 }}
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="12/28"
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted">CVV *</label>
                    <input
                      type="password"
                      maxLength={4}
                      className="form-control font-monospace"
                      style={{ backgroundColor: '#2a2826', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)', borderRadius: 0 }}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      required
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 pt-2 border-top" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <button
                    type="button"
                    onClick={() => setShowRenewModal(false)}
                    className="btn btn-outline-secondary px-4"
                    style={{ borderRadius: 0 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={renewLoading}
                    className="btn btn-warning text-dark fw-bold px-4 font-monospace"
                    style={{
                      backgroundColor: 'var(--dp-color-accent)',
                      borderColor: 'var(--dp-color-accent)',
                      borderRadius: 0,
                    }}
                  >
                    {renewLoading ? 'Processing...' : `Confirm & Pay ${renewPlan === 'MONTHLY' ? '$10' : '$100'}`}
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
