import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, Cpu } from 'lucide-react';
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

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!agreeTerms) {
      setError('Vui lòng đồng ý với Điều khoản và Chính sách bảo mật.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu cần tối thiểu 6 ký tự để bảo mật.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register(fullName, email, password);
      if (result.success) {
        setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển hướng...');
        setTimeout(() => {
          navigate('/');
        }, 700);
      } else {
        setError(result.error || 'Đăng ký không thành công.');
      }
    } catch {
      setError('Đã xảy ra lỗi kết nối, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google social signup
  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await login('google.user@gmail.com', 'google_oauth_pass');
      if (result.success) {
        setSuccessMsg('Đăng ký qua Google thành công! Đang chuyển hướng...');
        setTimeout(() => {
          navigate('/');
        }, 700);
      }
    } catch {
      setError('Không thể kết nối với dịch vụ Google.');
    } finally {
      setIsLoading(false);
    }
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

            {/* Switch to Login */}
            <div className="auth-switch-box">
              <span className="auth-switch-label">Đã là thành viên?</span>
              <Link to="/login" className="auth-switch-pill-btn">
                <span>Đăng nhập</span>
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
                <span>Bắt đầu hành trình</span>
              </div>

              {/* Serif Headline */}
              <h1 className="auth-main-title">
                Tạo một điều khác biệt.
              </h1>

              {/* Subtitle */}
              <p className="auth-main-desc">
                Tham gia cộng đồng sáng tạo và mở khóa không gian cảm hứng của riêng bạn.
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
                {/* Full Name */}
                <div className="auth-field-group">
                  <label htmlFor="register-name" className="auth-field-label">
                    Họ và tên
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="register-name"
                      type="text"
                      className="auth-text-input"
                      placeholder="Nguyễn Minh Anh"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="auth-field-group">
                  <label htmlFor="register-email" className="auth-field-label">
                    Email
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="register-email"
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
                  <label htmlFor="register-password" className="auth-field-label">
                    Mật khẩu
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      className="auth-text-input"
                      placeholder="Tối thiểu 6 ký tự"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
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

                {/* Confirm Password Field */}
                <div className="auth-field-group">
                  <label htmlFor="register-confirm-password" className="auth-field-label">
                    Xác nhận mật khẩu
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="register-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="auth-text-input"
                      placeholder="Nhập lại mật khẩu"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="auth-password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Terms and conditions checkbox */}
                <label className="auth-terms-label">
                  <input
                    type="checkbox"
                    className="auth-checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                  />
                  <span>
                    Tôi đồng ý với{' '}
                    <button
                      type="button"
                      onClick={() => alert('Điều khoản: NovaTech cam kết bảo vệ quyền lợi thành viên và minh bạch thông tin giao dịch.')}
                    >
                      Điều khoản
                    </button>{' '}
                    và Chính sách bảo mật.
                  </span>
                </label>

                {/* Submit button */}
                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={isLoading}
                >
                  <span>{isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}</span>
                  <span className="auth-submit-arrow">
                    <ArrowRight size={18} />
                  </span>
                </button>
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
                onClick={handleGoogleSignup}
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
    </div>
  );
};
