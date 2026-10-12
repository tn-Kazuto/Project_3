import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ArrowLeft } from 'lucide-react';

export const AuthBrandPanel = () => {
  return (
    <section className="auth-brand-panel">
      {/* Background Photography & Multi-layer Overlay */}
      <img
        src="https://images.unsplash.com/photo-1563089145-599997674d42?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1400"
        alt="NovaTech Inspiration"
        className="auth-brand-bg-image"
      />
      <div className="auth-brand-overlay" />

      {/* Modern Floating Orbital Lenses */}
      <div className="auth-orbital-lens-1" aria-hidden="true" />
      <div className="auth-orbital-lens-2" aria-hidden="true" />

      {/* Top Header: Brand Logo & Back to Shop */}
      <div className="auth-brand-header">
        <Link to="/" className="auth-brand-logo-link" title="Trang chủ NovaTech">
          <div className="auth-brand-logo-icon">
            <Cpu size={24} />
          </div>
          <span className="auth-brand-logo-text">NovaTech</span>
        </Link>

        <Link to="/" className="auth-brand-back-btn">
          <ArrowLeft size={16} />
          <span>Về cửa hàng</span>
        </Link>
      </div>

      {/* Bottom Visual Hero Content */}
      <div className="auth-brand-body">
        <div className="auth-brand-overline">
          <span className="auth-brand-overline-line" />
          <span>Hệ sinh thái công nghệ NovaTech</span>
        </div>

        <h2 className="auth-brand-headline">
          Nơi những ý tưởng đẹp bắt đầu.
        </h2>

        <p className="auth-brand-desc">
          Một tài khoản, vô vàn trải nghiệm. Khám phá vũ trụ thiết bị công nghệ tiên phong,
          đặc quyền bảo hành chính hãng và tích điểm ưu đãi thành viên mỗi ngày.
        </p>

        {/* Social Proof & Member Stats */}
        <div className="auth-brand-stats">
          <div className="auth-avatar-stack">
            <span>A</span>
            <span>M</span>
            <span>K</span>
          </div>
          <div>
            <div className="auth-stats-title">50.000+ thành viên</div>
            <div className="auth-stats-subtitle">đã tin tưởng và đồng hành cùng NovaTech</div>
          </div>
        </div>
      </div>
    </section>
  );
};
