import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Cpu, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Đăng nhập không thành công');
      }
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo-box">
              <Cpu size={28} />
            </div>
            <h1 className="auth-title">Đăng Nhập NovaTech</h1>
            <p className="auth-subtitle">Truy cập để quản lý đơn hàng & tích điểm ưu đãi</p>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              color: '#ef4444',
              fontSize: '0.875rem',
              marginBottom: 18
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email hoặc Số điện thoại</label>
              <div className="form-input-box">
                <Mail size={18} style={{ color: '#94a3b8' }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="nhapemail@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <div className="form-input-box">
                <Lock size={18} style={{ color: '#94a3b8' }} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--primary)' }} defaultChecked />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a href="#forgot" style={{ color: 'var(--primary)', fontWeight: 600 }}>Quên mật khẩu?</a>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 8 }}
              disabled={isLoading}
            >
              <span>{isLoading ? 'Đang xử lý...' : 'Đăng nhập ngay'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-footer">
            Chưa có tài khoản NovaTech? <Link to="/register">Đăng ký thành viên</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
