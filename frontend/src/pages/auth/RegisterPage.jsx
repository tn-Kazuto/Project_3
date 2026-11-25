import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username:        '',
    fullName:        '',
    email:           '',
    phone:           '',
    password:        '',
    confirmPassword: '',
    planType:        'YEARLY',
    cardHolderName:  '',
    cardNumber:      '',
    expiryDate:      '',
    cvv:             '',
  });

  const [showPassword, setShowPassword]           = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError]                         = useState('');
  const [loading, setLoading]                     = useState(false);

  const { register } = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlanSelect = (plan) => setFormData((prev) => ({ ...prev, planType: plan }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) { setError('Please provide a valid email address.'); return; }
    if (formData.password.length < 6)             { setError('Password must be at least 6 characters.'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return; }
    if (!formData.cardHolderName || !formData.cardNumber || !formData.expiryDate || !formData.cvv) {
      setError('Please complete all payment details.'); return;
    }

    setLoading(true);
    try {
      const res = await register(formData);
      if (res.success) {
        const from = location.state?.from;
        const returnTo =
          typeof from?.pathname === 'string' && from.pathname.startsWith('/') && !from.pathname.startsWith('//')
            ? `${from.pathname}${from.search || ''}${from.hash || ''}`
            : '/';
        navigate(returnTo, { replace: true });
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  const passwordMatch = formData.confirmPassword && formData.confirmPassword === formData.password;
  const passwordMismatch = formData.confirmPassword && formData.confirmPassword !== formData.password;

  const INPUT_STYLE = { borderColor: 'var(--dp-color-rule)', borderRadius: 0, backgroundColor: 'var(--dp-color-ground-2)' };

  const SectionHeader = ({ num, title }) => (
    <div className="d-flex align-items-center gap-3 mb-4">
      <span
        className="d-flex align-items-center justify-content-center font-monospace fw-bold"
        style={{
          width: 32, height: 32, flexShrink: 0,
          backgroundColor: 'var(--dp-color-field)',
          color: 'var(--dp-color-accent)',
          fontSize: '0.8rem',
          borderRadius: 0,
        }}
      >
        {num}
      </span>
      <h4 className="brand-font m-0 text-dark" style={{ fontSize: '1.15rem' }}>{title}</h4>
    </div>
  );

  return (
    <div style={{ backgroundColor: 'var(--dp-color-ground-2)', minHeight: 'calc(100vh - 68px)' }}>
      <div className="container py-5" style={{ maxWidth: 780 }}>

        {/* Page header */}
        <div
          className="p-4 p-md-5 mb-4 text-white position-relative overflow-hidden"
          style={{
            backgroundColor: 'var(--dp-color-field)',
            borderTop: '3px solid var(--dp-color-accent)',
            borderBottom: '1px solid var(--dp-color-accent)',
            backgroundImage: 'linear-gradient(rgba(28,26,23,0.82), rgba(28,26,23,0.90)), url("https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="roman-numeral mb-1" style={{ color: 'var(--dp-color-accent)' }}>II · MEMBERSHIP & ONBOARDING</div>
          <h1 className="brand-font display-5 text-white mb-2">Join the Culinary Circle</h1>
          <p className="small text-white-50 mb-0" style={{ maxWidth: 520 }}>
            Access exclusive 5-star recipes, master chef tips, and global cooking contests.
          </p>
        </div>

        {/* Form card */}
        <div
          className="p-4 p-md-5"
          style={{ backgroundColor: '#ffffff', border: '1px solid var(--dp-color-rule)' }}
        >
          {error && (
            <div className="alert alert-danger small py-2 mb-4" role="alert" style={{ borderRadius: 0 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* ── SECTION I: Account ───────────────────────────────── */}
            <SectionHeader num="I" title="Account Information" />
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label small fw-semibold" htmlFor="reg-fullname">Full Name *</label>
                <input id="reg-fullname" type="text" className="form-control" style={INPUT_STYLE}
                  name="fullName" placeholder="e.g. Eleanor Vance"
                  value={formData.fullName} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold" htmlFor="reg-username">Username *</label>
                <input id="reg-username" type="text" className="form-control" style={INPUT_STYLE}
                  name="username" placeholder="e.g. chef_eleanor"
                  value={formData.username} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold" htmlFor="reg-email">Email Address *</label>
                <input id="reg-email" type="email" className="form-control" style={INPUT_STYLE}
                  name="email" placeholder="you@example.com"
                  value={formData.email} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold" htmlFor="reg-phone">
                  Phone <span className="fw-normal text-muted">· optional</span>
                </label>
                <input id="reg-phone" type="tel" className="form-control" style={INPUT_STYLE}
                  name="phone" placeholder="+1 (555) 000-0000"
                  value={formData.phone} onChange={handleChange} />
              </div>

              {/* Password */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold" htmlFor="reg-password">Password *</label>
                <div className="position-relative">
                  <input id="reg-password" type={showPassword ? 'text' : 'password'}
                    className="form-control pe-5" style={INPUT_STYLE}
                    name="password" placeholder="Min 6 characters"
                    value={formData.password} onChange={handleChange}
                    autoComplete="new-password" required />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="btn p-0 position-absolute top-50 translate-middle-y d-flex align-items-center justify-content-center"
                    style={{ right: 10, background: 'none', border: 'none', color: 'var(--dp-color-ink-2)' }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold" htmlFor="reg-confirm">Confirm Password *</label>
                <div className="position-relative">
                  <input id="reg-confirm" type={showConfirmPassword ? 'text' : 'password'}
                    className="form-control pe-5"
                    style={{
                      ...INPUT_STYLE,
                      borderColor: passwordMatch ? '#198754' : passwordMismatch ? '#dc3545' : 'var(--dp-color-rule)',
                    }}
                    name="confirmPassword" placeholder="Re-enter password"
                    value={formData.confirmPassword} onChange={handleChange}
                    autoComplete="new-password" required
                    aria-describedby="confirm-hint" />
                  <button type="button" onClick={() => setShowConfirmPassword((v) => !v)}
                    className="btn p-0 position-absolute top-50 translate-middle-y d-flex align-items-center justify-content-center"
                    style={{ right: 10, background: 'none', border: 'none', color: 'var(--dp-color-ink-2)' }}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div id="confirm-hint" className="form-text small mt-1"
                    style={{ color: passwordMatch ? '#198754' : '#dc3545' }}>
                    {passwordMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, backgroundColor: 'var(--dp-color-rule)', margin: '2rem 0' }} />

            {/* ── SECTION II: Plan ─────────────────────────────────── */}
            <SectionHeader num="II" title="Choose Your Subscription Plan" />
            <p className="small text-muted mb-4" style={{ marginTop: '-0.75rem' }}>
              Paid registration is required to unlock member privileges.
            </p>

            <div className="row g-3 mb-4">
              {[
                {
                  key: 'MONTHLY', name: 'Monthly Pass', price: '$10', per: '/ month',
                  badge: 'Flexible', badgeDark: false,
                  desc: 'Billed monthly, renews every 30 days.',
                  perks: ['All secret recipes & tips', 'Upload personal recipes'],
                },
                {
                  key: 'YEARLY', name: 'Annual Pass', price: '$100', per: '/ year',
                  badge: 'Best Value · Save $20', badgeDark: true,
                  desc: 'Billed annually, full 365-day access.',
                  perks: ['All member privileges', 'Priority contest judging'],
                },
              ].map(({ key, name, price, per, badge, badgeDark, desc, perks }) => {
                const active = formData.planType === key;
                return (
                  <div key={key} className="col-md-6">
                    <button
                      type="button"
                      onClick={() => handlePlanSelect(key)}
                      aria-pressed={active}
                      className="w-100 h-100 p-4 text-start position-relative"
                      style={{
                        backgroundColor: badgeDark ? 'var(--dp-color-field)' : 'var(--dp-color-ground-2)',
                        border: active ? `2px solid var(--dp-color-accent)` : `1px solid ${badgeDark ? 'rgba(255,255,255,0.1)' : 'var(--dp-color-panel-line)'}`,
                        borderRadius: 0,
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'border-color 0.15s',
                      }}
                    >
                      {/* Badge */}
                      <span
                        className="badge font-monospace mb-3 d-inline-block"
                        style={{
                          backgroundColor: badgeDark ? 'var(--dp-color-accent)' : 'rgba(0,0,0,0.07)',
                          color: badgeDark ? 'var(--dp-color-field)' : 'var(--dp-color-ink)',
                          borderRadius: 0,
                          fontSize: '0.65rem',
                          letterSpacing: '0.1em',
                          padding: '3px 8px',
                        }}
                      >
                        {badge}
                      </span>

                      {/* Price */}
                      <div className="d-flex align-items-baseline gap-1 mb-2">
                        <span
                          className="brand-font fw-bold"
                          style={{ fontSize: '2.2rem', color: badgeDark ? '#fff' : 'var(--dp-color-ink)' }}
                        >
                          {price}
                        </span>
                        <span
                          className="small font-monospace"
                          style={{ color: badgeDark ? 'var(--dp-color-on-field-2)' : 'var(--dp-color-ink-2)' }}
                        >
                          {per}
                        </span>
                      </div>

                      <p
                        className="small mb-3"
                        style={{ color: badgeDark ? 'var(--dp-color-on-field-2)' : 'var(--dp-color-ink-2)' }}
                      >
                        {desc}
                      </p>

                      <ul className="list-unstyled small m-0 d-flex flex-column gap-2">
                        {perks.map((p) => (
                          <li key={p} className="d-flex align-items-center gap-2">
                            <span style={{ color: 'var(--dp-color-accent)', fontWeight: 700, fontSize: '0.75rem' }}>✓</span>
                            <span style={{ color: badgeDark ? '#fff' : 'var(--dp-color-ink)' }}>{p}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Active indicator */}
                      {active && (
                        <div
                          className="position-absolute top-0 end-0 m-2 font-monospace"
                          style={{
                            width: 20, height: 20,
                            backgroundColor: 'var(--dp-color-accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.65rem', color: 'var(--dp-color-field)',
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Divider */}
            <div style={{ height: 1, backgroundColor: 'var(--dp-color-rule)', margin: '2rem 0' }} />

            {/* ── SECTION III: Payment ─────────────────────────────── */}
            <SectionHeader num="III" title="Payment Details (Mock Gateway)" />

            <div
              className="p-4 mb-4"
              style={{ backgroundColor: 'var(--dp-color-ground-2)', border: '1px solid var(--dp-color-panel-line)' }}
            >
              {/* Amount summary */}
              <div
                className="d-flex align-items-center justify-content-between mb-4 pb-3"
                style={{ borderBottom: '1px solid var(--dp-color-rule)' }}
              >
                <span className="small fw-semibold text-uppercase font-monospace" style={{ letterSpacing: '0.1em', color: 'var(--dp-color-ink-2)' }}>
                  Amount due now
                </span>
                <span className="brand-font fw-bold text-dark" style={{ fontSize: '1.5rem' }}>
                  {formData.planType === 'MONTHLY' ? '$10.00' : '$100.00'} USD
                </span>
              </div>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-semibold" htmlFor="pay-name">Cardholder Name *</label>
                  <input id="pay-name" type="text" className="form-control" style={INPUT_STYLE}
                    name="cardHolderName" placeholder="Name as it appears on card"
                    value={formData.cardHolderName} onChange={handleChange} required />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold" htmlFor="pay-number">Card Number *</label>
                  <input id="pay-number" type="text" className="form-control" style={INPUT_STYLE}
                    name="cardNumber" placeholder="4000 1234 5678 9010 (mock test card)"
                    value={formData.cardNumber} onChange={handleChange} required />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold" htmlFor="pay-expiry">Expiry (MM/YY) *</label>
                  <input id="pay-expiry" type="text" className="form-control" style={INPUT_STYLE}
                    name="expiryDate" placeholder="MM/YY"
                    value={formData.expiryDate} onChange={handleChange} required />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold" htmlFor="pay-cvv">CVV *</label>
                  <input id="pay-cvv" type="password" className="form-control" style={INPUT_STYLE}
                    name="cvv" placeholder="123" maxLength={4}
                    value={formData.cvv} onChange={handleChange} required />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn w-100 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
              style={{
                backgroundColor: 'var(--dp-color-accent)',
                color: 'var(--dp-color-field)',
                letterSpacing: '0.14em',
                borderRadius: 0,
                border: 'none',
                fontSize: '0.85rem',
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  <span>Processing Subscription…</span>
                </>
              ) : (
                <span>
                  Complete Registration &amp; Pay {formData.planType === 'MONTHLY' ? '$10.00' : '$100.00'}
                </span>
              )}
            </button>

          </form>

          {/* Sign in link */}
          <div style={{ height: 1, backgroundColor: 'var(--dp-color-rule)', margin: '2rem 0' }} />
          <div className="text-center small">
            <span className="text-muted">Already have a membership? </span>
            <Link
              to="/login"
              state={{ from: location.state?.from }}
              className="fw-semibold"
              style={{ color: 'var(--dp-color-ink)', textDecoration: 'none', borderBottom: '1px solid var(--dp-color-accent)' }}
            >
              Sign in here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
