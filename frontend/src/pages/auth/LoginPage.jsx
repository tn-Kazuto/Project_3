import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword]               = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [error, setError]                     = useState('');
  const [loading, setLoading]                 = useState(false);

  const { login }   = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();

  const returnLocation = location.state?.from;
  const from =
    typeof returnLocation?.pathname === 'string' &&
    returnLocation.pathname.startsWith('/') &&
    !returnLocation.pathname.startsWith('//')
      ? `${returnLocation.pathname}${returnLocation.search || ''}${returnLocation.hash || ''}`
      : '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!emailOrUsername.trim() || !password) {
      setError('Please provide your email/username and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await login(emailOrUsername, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.message || 'Invalid credentials. Please verify your password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const INPUT_STYLE = {
    borderColor: 'var(--dp-color-rule)',
    borderRadius: 0,
    backgroundColor: 'var(--dp-color-ground-2)',
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 68px)',
        backgroundColor: 'var(--dp-color-ground-2)',
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      <div className="container-fluid p-0" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="row g-0 h-100" style={{ minHeight: 'calc(100vh - 68px)' }}>

          {/* ── LEFT: culinary hero panel ──────────────────────────── */}
          <div
            className="col-lg-5 d-none d-lg-flex flex-column justify-content-between p-5 position-relative overflow-hidden"
            style={{
              backgroundColor: 'var(--dp-color-field)',
              borderRight: '1px solid var(--dp-color-accent)',
              backgroundImage: 'linear-gradient(rgba(28,26,23,0.72), rgba(28,26,23,0.88)), url("https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Brand mark */}
            <div>
              <div className="roman-numeral mb-2" style={{ color: 'var(--dp-color-accent)', fontSize: '0.72rem' }}>
                I · CREDENTIALS & ACCESS
              </div>
              <h2 className="brand-font text-white mb-0" style={{ fontSize: '2rem', lineHeight: 1.2 }}>
                James Thew<br />Culinary Atelier
              </h2>
            </div>

            {/* Chef quote */}
            <div
              className="p-4"
              style={{
                borderLeft: '3px solid var(--dp-color-accent)',
                backgroundColor: 'rgba(255,255,255,0.05)',
              }}
            >
              <p
                className="brand-font mb-2 text-white"
                style={{ fontSize: '1.15rem', lineHeight: 1.6, fontStyle: 'italic' }}
              >
                "Great cuisine begins with great discipline — in the kitchen, and in the craft."
              </p>
              <span className="font-monospace" style={{ color: 'var(--dp-color-accent)', fontSize: '0.72rem', letterSpacing: '0.14em' }}>
                — Chef James Thew
              </span>
            </div>

            {/* Benefits */}
            <div className="d-flex flex-column gap-3">
              {[
                { label: 'Exclusive Recipes', desc: 'Access 5-star master chef recipes' },
                { label: 'Culinary Contests', desc: 'Compete & vote in live cooking challenges' },
                { label: 'Masterclass Tips', desc: 'Professional techniques & kitchen secrets' },
              ].map(({ label, desc }) => (
                <div key={label} className="d-flex align-items-start gap-3">
                  <div
                    style={{
                      width: 6, height: 6, borderRadius: '50%',
                      backgroundColor: 'var(--dp-color-accent)',
                      marginTop: 7, flexShrink: 0,
                    }}
                  />
                  <div>
                    <div className="text-white fw-semibold small">{label}</div>
                    <div className="font-monospace" style={{ color: 'var(--dp-color-on-field-2)', fontSize: '0.72rem' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: login form ───────────────────────────────────── */}
          <div
            className="col-lg-7 d-flex align-items-center justify-content-center p-4 p-md-5"
            style={{ backgroundColor: '#ffffff' }}
          >
            <div style={{ width: '100%', maxWidth: 420 }}>

              {/* Mobile header (hidden on lg+) */}
              <div className="d-lg-none text-center mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--dp-color-rule)' }}>
                <div className="roman-numeral mb-1" style={{ color: 'var(--dp-color-accent)' }}>I · CREDENTIALS & ACCESS</div>
              </div>

              <div className="mb-5">
                <h1 className="brand-font text-dark mb-1" style={{ fontSize: '2rem' }}>Welcome Back</h1>
                <p className="small text-muted mb-0">Sign in to your James Thew culinary account</p>
              </div>

              {error && (
                <div className="alert alert-danger small py-2 mb-4" role="alert" style={{ borderRadius: 0 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email / Username */}
                <div className="mb-4">
                  <label className="form-label small fw-semibold" htmlFor="login-email">
                    Email or Username
                  </label>
                  <input
                    id="login-email"
                    type="text"
                    className="form-control"
                    style={INPUT_STYLE}
                    placeholder="e.g. james or you@example.com"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>

                {/* Password */}
                <div className="mb-5">
                  <label className="form-label small fw-semibold" htmlFor="login-password">
                    Password
                  </label>
                  <div className="position-relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      className="form-control pe-5"
                      style={INPUT_STYLE}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="btn p-0 position-absolute top-50 translate-middle-y d-flex align-items-center justify-content-center"
                      style={{ right: 12, background: 'none', border: 'none', color: 'var(--dp-color-ink-2)' }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
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
                    letterSpacing: '0.16em',
                    borderRadius: 0,
                    border: 'none',
                    fontSize: '0.85rem',
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      <span>Signing in…</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="d-flex align-items-center gap-3 my-4">
                <div style={{ flex: 1, height: 1, backgroundColor: 'var(--dp-color-rule)' }} />
                <span className="font-monospace text-muted" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>OR</span>
                <div style={{ flex: 1, height: 1, backgroundColor: 'var(--dp-color-rule)' }} />
              </div>

              {/* Register CTA */}
              <Link
                to="/register"
                className="btn w-100 py-3 fw-semibold d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--dp-color-ink)',
                  border: '1px solid var(--dp-color-rule)',
                  letterSpacing: '0.12em',
                  borderRadius: 0,
                  fontSize: '0.82rem',
                  textDecoration: 'none',
                }}
              >
                Subscribe & Register — $10/mo or $100/yr
              </Link>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
