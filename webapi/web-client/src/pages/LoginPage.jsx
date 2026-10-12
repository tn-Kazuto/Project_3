import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, Cpu, ArrowLeft, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthBrandPanel } from './AuthBrandPanel';
import './Auth.css';

// SVG Official Google Icon
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
    <path
      fill="#4285F4"
      d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.76 2.98-4.35 2.98-7.41Z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.24-2.54c-.9.61-2.05.97-3.38.97-2.61 0-4.82-1.78-5.61-4.17H3.04v2.62A10 10 0 0 0 12 22Z"
    />
    <path
      fill="#FBBC05"
      d="M6.39 13.9A6.02 6.02 0 0 1 6.07 12c0-.66.11-1.3.32-1.9V7.48H3.04A10 10 0 0 0 2 12c0 1.62.39 3.15 1.04 4.52l3.35-2.62Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.93c1.47 0 2.79.51 3.83 1.51l2.87-2.89A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.96 5.48l3.35 2.62C7.18 7.71 9.39 5.93 12 5.93Z"
    />
  </svg>
);

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState('');

  // Handle standard submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...');
        setTimeout(() => {
          navigate('/');
        }, 600);
      } else {
        setError(result.error || 'Email hoặc mật khẩu không chính xác.');
      }
    } catch {
      setError('Đã xảy ra lỗi kết nối, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // One-click demo login helper (Khớp tài khoản seed mặc định của CoreBackend)
  const handleDemoFill = () => {
    setEmail('admin');
    setPassword('Admin@123456');
    setError('');
  };

  // Google social login simulation
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await login('google.user@gmail.com', 'google_oauth_pass');
      if (result.success) {
        setSuccessMsg('Đăng nhập Google thành công! Đang chuyển hướng...');
        setTimeout(() => {
          navigate('/');
        }, 600);
      }
    } catch {
      setError('Không thể kết nối với dịch vụ Google.');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password send
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotStatus('Đã gửi liên kết khôi phục tới email của bạn. Vui lòng kiểm tra hộp thư!');
    setTimeout(() => {
      setForgotStatus('');
      setIsForgotModalOpen(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="auth-viewport">
      {/* Ambient background glows */}
      <div className="auth-ambient-glow-1" aria-hidden="true" />
      <div className="auth-ambient-glow-2" aria-hidden="true" />

      {/* Main split layout container */}
      <div className="auth-split-container">
        {/* 1. Left visual panel */}
        <AuthBrandPanel />

        {/* 2. Right form panel */}
        <section className="auth-form-panel">
          {/* Top navigation */}
          <header className="auth-top-nav">
            {/* Mobile Logo */}
            <Link to="/" className="auth-mobile-logo" title="NovaTech">
              <div className="auth-mobile-logo-icon">
                <Cpu size={20} />
              </div>
              <span className="auth-mobile-logo-text">NovaTech</span>
            </Link>

            {/* Switch to Register */}
            <div className="auth-switch-box">
              <span className="auth-switch-label">Chưa có tài khoản?</span>
              <Link to="/register" className="auth-switch-pill-btn">
                <span>Đăng ký</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </header>

          {/* Center Form Section */}
          <div className="auth-center-content">
            <div className="auth-enter-animation">
              {/* Category Pill */}
              <div className="auth-badge-pill">
                <span className="auth-badge-dot" />
                <span>Chào mừng trở lại</span>
              </div>

              {/* Serif Headline */}
              <h1 className="auth-main-title">
                Gặp lại bạn thật tuyệt.
              </h1>

              {/* Subtitle */}
              <p className="auth-main-desc">
                Đăng nhập để tiếp tục hành trình và khám phá những ưu đãi công nghệ dành riêng cho bạn.
              </p>

              {/* Alerts */}
              {error && (
                <div className="auth-alert-error" role="alert">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="auth-alert-success" role="status">
                  <CheckCircle2 size={18} />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="auth-form-fields">
                {/* Email Field */}
                <div className="auth-field-group">
                  <label htmlFor="login-email" className="auth-field-label">
                    Email
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="login-email"
                      type="email"
                      className="auth-text-input"
                      placeholder="ban@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="auth-field-group">
                  <label htmlFor="login-password" className="auth-field-label">
                    Mật khẩu
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      className="auth-text-input"
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="auth-password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Options row */}
                <div className="auth-options-row">
                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      className="auth-checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>

                  <button
                    type="button"
                    className="auth-forgot-link"
                    onClick={() => setIsForgotModalOpen(true)}
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={isLoading}
                >
                  <span>{isLoading ? 'Đang xác thực...' : 'Đăng nhập'}</span>
                  <span className="auth-submit-arrow">
                    <ArrowRight size={18} />
                  </span>
                </button>

                {/* Quick demo helper button */}
                <div className="auth-demo-fill-box">
                  <button
                    type="button"
                    onClick={handleDemoFill}
                    className="auth-demo-fill-btn"
                    title="Tự động điền tài khoản thử nghiệm"
                  >
                    <Sparkles size={14} />
                    <span>Thử nhanh tài khoản mẫu</span>
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="auth-divider-row">
                <span className="auth-divider-line" />
                <span className="auth-divider-text">hoặc tiếp tục với</span>
                <span className="auth-divider-line" />
              </div>

              {/* Google Social Button */}
              <button
                type="button"
                className="auth-social-btn"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <GoogleIcon />
                <span>Google</span>
              </button>
            </div>
          </div>

          {/* Bottom Footer */}
          <footer className="auth-bottom-footer">
            <span>© 2026 NovaTech</span>
            <div className="auth-bottom-links">
              <button type="button" onClick={() => alert('Chính sách bảo mật: Thông tin cá nhân của bạn được mã hóa an toàn.')}>
                Bảo mật
              </button>
              <span>·</span>
              <button type="button" onClick={() => alert('Điều khoản: Sử dụng dịch vụ theo quy chế của sàn NovaTech.')}>
                Điều khoản
              </button>
              <span>·</span>
              <button type="button" onClick={() => alert('Tổng đài hỗ trợ 24/7: 1800 6868')}>
                Trợ giúp
              </button>
            </div>
          </footer>
        </section>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="auth-modal-overlay" onClick={() => setIsForgotModalOpen(false)}>
          <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="auth-modal-close-btn"
              onClick={() => setIsForgotModalOpen(false)}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
              Khôi phục mật khẩu
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: 20 }}>
              Nhập email liên kết với tài khoản của bạn để nhận liên kết đặt lại mật khẩu.
            </p>

            {forgotStatus ? (
              <div className="auth-alert-success" style={{ marginBottom: 0 }}>
                <CheckCircle2 size={18} />
                <span>{forgotStatus}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                <div className="auth-field-group" style={{ marginBottom: 16 }}>
                  <label className="auth-field-label">Email của bạn</label>
                  <input
                    type="email"
                    className="auth-text-input"
                    placeholder="ban@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <button type="submit" className="auth-submit-btn" style={{ marginTop: 0 }}>
                  Gửi liên kết khôi phục
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
