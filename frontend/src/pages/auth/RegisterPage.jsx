import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChefHat, CreditCard, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    planType: 'MONTHLY', // 'MONTHLY' or 'YEARLY'
    cardHolderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlanSelect = (plan) => {
    setFormData((prev) => ({ ...prev, planType: plan }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password and confirmation password do not match.');
      return;
    }

    if (!formData.cardHolderName || !formData.cardNumber || !formData.expiryDate || !formData.cvv) {
      setError('Please provide complete payment simulation details.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(formData);
      if (res.success) {
        navigate('/', { replace: true });
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 luxury-register">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-7">
          <div
            className="p-4 p-md-5"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--dp-color-rule)',
            }}
          >
            {/* Header */}
            <div className="text-center mb-5 pb-3 border-bottom" style={{ borderColor: 'var(--dp-color-rule)' }}>
              <div className="roman-numeral mb-1">II &middot; MEMBERSHIP & ONBOARDING</div>
              <ChefHat size={36} className="luxury-gold-icon mb-2" />
              <h1 className="brand-font display-6 m-0 text-dark">Join the Culinary Circle</h1>
              <p className="text-muted small m-0 mt-2">
                Access exclusive 5-star recipes, master chef tips, and global cooking contests
              </p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-4" role="alert" style={{ borderRadius: 0 }}>
                <AlertCircle size={18} className="flex-shrink-0" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* 1. Account Details */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="roman-numeral" style={{ fontSize: '1.1rem' }}>I.</span>
                <h4 className="brand-font m-0 text-dark">Account Information</h4>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="fullName"
                    placeholder="e.g. Eleanor Vance"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Username *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    placeholder="e.g. chef_eleanor"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Confirm Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="ruled-row my-4"></div>

              {/* 2. Choose Subscription Plan */}
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="roman-numeral" style={{ fontSize: '1.1rem' }}>II.</span>
                <h4 className="brand-font m-0 text-dark">Choose Your Subscription Plan</h4>
              </div>
              <p className="small text-muted mb-4">
                Per site requirements, paid registration is required to unlock member privileges.
              </p>

              <div className="row g-3 mb-4">
                {/* Monthly Plan */}
                <div className="col-md-6">
                  <div
                    className="p-4 h-100 cursor-pointer"
                    style={{
                      backgroundColor: 'var(--dp-color-ground-2)',
                      border: formData.planType === 'MONTHLY' ? '2px solid var(--dp-color-accent)' : '1px solid var(--dp-color-panel-line)',
                      cursor: 'pointer',
                    }}
                    onClick={() => handlePlanSelect('MONTHLY')}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge bg-light text-dark font-monospace border">Flexible</span>
                      <input
                        type="radio"
                        name="planType"
                        value="MONTHLY"
                        checked={formData.planType === 'MONTHLY'}
                        onChange={() => handlePlanSelect('MONTHLY')}
                        className="form-check-input mt-1"
                      />
                    </div>
                    <div className="d-flex align-items-baseline gap-1 my-2">
                      <span className="brand-font display-6 fw-bold text-dark">$10</span>
                      <span className="small text-muted font-monospace">/ month</span>
                    </div>
                    <p className="small text-muted mb-3">Billed monthly, renews every 30 days.</p>
                    <ul className="list-unstyled small text-secondary m-0 d-flex flex-column gap-2">
                      <li className="d-flex align-items-center gap-2">
                        <CheckCircle2 size={15} className="luxury-gold-icon flex-shrink-0" />
                        <span>All secret recipes & tips</span>
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <CheckCircle2 size={15} className="luxury-gold-icon flex-shrink-0" />
                        <span>Upload personal recipes</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Yearly Plan (Featured Charcoal Column) */}
                <div className="col-md-6">
                  <div
                    className="p-4 h-100 cursor-pointer"
                    style={{
                      backgroundColor: 'var(--dp-color-field)',
                      color: 'var(--dp-color-on-field)',
                      border: formData.planType === 'YEARLY' ? '2px solid var(--dp-color-accent)' : '1px solid var(--dp-color-field-line)',
                      cursor: 'pointer',
                    }}
                    onClick={() => handlePlanSelect('YEARLY')}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span
                        className="badge text-white font-monospace d-flex align-items-center gap-1"
                        style={{ backgroundColor: 'var(--dp-color-accent)' }}
                      >
                        <Sparkles size={12} /> Best Value (Save $20)
                      </span>
                      <input
                        type="radio"
                        name="planType"
                        value="YEARLY"
                        checked={formData.planType === 'YEARLY'}
                        onChange={() => handlePlanSelect('YEARLY')}
                        className="form-check-input mt-1"
                      />
                    </div>
                    <div className="d-flex align-items-baseline gap-1 my-2">
                      <span className="brand-font display-6 fw-bold text-white">$100</span>
                      <span className="small font-monospace" style={{ color: 'var(--dp-color-on-field-2)' }}>/ year</span>
                    </div>
                    <p className="small mb-3" style={{ color: 'var(--dp-color-on-field-2)' }}>Billed annually, full 365-day access.</p>
                    <ul className="list-unstyled small m-0 d-flex flex-column gap-2" style={{ color: 'var(--dp-color-on-field-2)' }}>
                      <li className="d-flex align-items-center gap-2">
                        <CheckCircle2 size={15} className="luxury-gold-icon flex-shrink-0" />
                        <span className="text-white">All member privileges</span>
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <CheckCircle2 size={15} className="luxury-gold-icon flex-shrink-0" />
                        <span className="text-white">Priority contest judging</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="ruled-row my-4"></div>

              {/* 3. Payment Simulation */}
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="roman-numeral" style={{ fontSize: '1.1rem' }}>III.</span>
                <h4 className="brand-font m-0 text-dark">Payment Details (Mock Gateway)</h4>
              </div>

              <div
                className="p-4 mb-4"
                style={{
                  backgroundColor: 'var(--dp-color-ground-2)',
                  border: '1px solid var(--dp-color-panel-line)',
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--dp-color-panel-line)' }}>
                  <span className="small text-uppercase fw-semibold" style={{ letterSpacing: '0.12em' }}>Amount to pay now:</span>
                  <span className="brand-font fs-4 fw-bold text-dark">
                    {formData.planType === 'MONTHLY' ? '$10.00 USD' : '$100.00 USD'}
                  </span>
                </div>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Cardholder Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="cardHolderName"
                      placeholder="Name as it appears on card"
                      value={formData.cardHolderName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Card Number *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0" style={{ borderColor: 'var(--dp-color-rule)' }}>
                        <CreditCard size={18} className="luxury-gold-icon" />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        style={{ borderColor: 'var(--dp-color-rule)' }}
                        name="cardNumber"
                        placeholder="4000 1234 5678 9010 (Mock test card)"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-6">
                    <label className="form-label small fw-semibold">Expiry Date *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-6">
                    <label className="form-label small fw-semibold">CVV *</label>
                    <input
                      type="password"
                      className="form-control"
                      name="cvv"
                      placeholder="123"
                      maxLength={4}
                      value={formData.cvv}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
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
                    Processing Subscription...
                  </>
                ) : (
                  <span>
                    Complete Registration &amp; Pay {formData.planType === 'MONTHLY' ? '$10.00' : '$100.00'}
                  </span>
                )}
              </button>
            </form>

            <div className="ruled-row my-4"></div>

            <div className="text-center small">
              <span className="text-muted">Already have a membership? </span>
              <Link to="/login" className="gold-underline fw-semibold" style={{ color: 'var(--dp-color-ink)' }}>
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
