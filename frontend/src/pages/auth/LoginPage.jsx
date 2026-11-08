import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

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

  return (
    <div className="container py-5 luxury-login">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5">
          <div
            className="p-4 p-md-5"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--dp-color-rule)',
            }}
          >
            {/* Header banner */}
            <div className="text-center mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--dp-color-rule)' }}>
              <div className="roman-numeral mb-1">I &middot; CREDENTIALS & ACCESS</div>
              <h2 className="brand-font m-0 text-dark" style={{ fontSize: '1.85rem' }}>Welcome Back</h2>
              <p className="text-muted small m-0 mt-2">Sign in to your James Thew culinary account</p>
            </div>

            {error && (
              <div className="alert alert-danger small py-2 mb-4" role="alert" style={{ borderRadius: 0 }}>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label small fw-semibold">Email or Username</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ borderColor: 'var(--dp-color-rule)' }}
                  placeholder="e.g. james or you@example.com"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold m-0">Password</label>
                </div>
                <input
                  type="password"
                  className="form-control"
                  style={{ borderColor: 'var(--dp-color-rule)' }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-100 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                style={{
                  backgroundColor: 'var(--dp-color-field)',
                  color: 'var(--dp-color-on-field)',
                  letterSpacing: '0.14em',
                  borderRadius: 0,
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            <div className="ruled-row my-4"></div>

            <div className="text-center small">
              <span className="text-muted">Don't have a membership yet? </span>
              <Link to="/register" className="gold-underline fw-semibold" style={{ color: 'var(--dp-color-ink)' }}>
                Subscribe & Register ($10/mo or $100/yr)
              </Link>
            </div>

            {/* Quick Credentials Card for Demo / Evaluation */}
            <div
              className="mt-4 p-3 small"
              style={{
                backgroundColor: 'var(--dp-color-cream, #fdfbf7)',
                border: '1px dashed var(--dp-color-gold, #b69355)',
              }}
            >
              <div
                className="fw-semibold text-uppercase mb-2"
                style={{
                  fontSize: '0.72rem',
                  letterSpacing: '0.08em',
                  color: 'var(--dp-color-gold, #b69355)',
                }}
              >
                Quick Credentials (SRS Seeded)
              </div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted">Admin (James Thew):</span>
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
                  style={{ color: 'var(--dp-color-ink, #1a1a1a)' }}
                  onClick={() => {
                    setEmailOrUsername('james');
                    setPassword('Admin@123456');
                  }}
                >
                  james / Admin@123456
                </button>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">VIP Member:</span>
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-decoration-none text-muted"
                  onClick={() => {
                    setEmailOrUsername('sophia@culinaryart.com');
                    setPassword('Member@123456');
                  }}
                >
                  sophia@culinaryart.com / Member@123456
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
