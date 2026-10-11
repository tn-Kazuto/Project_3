import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Send,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  MapPin,
  Phone,
  Clock,
  Cpu,
  CheckCircle2
} from 'lucide-react';
import './Footer.css';

const currentYear = new Date().getFullYear();

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 4000);
    }
  };

  return (
    <footer className="site-footer">
      {/* 1. Newsletter Strip */}
      <div className="footer-newsletter">
        <div className="container">
          <div className="newsletter-info">
            <div className="newsletter-icon">
              <Mail size={28} />
            </div>
            <div>
              <h3 className="newsletter-title">Đăng Ký Nhận Bản Tin Công Nghệ</h3>
              <p className="newsletter-desc">
                Nhận thông tin sản phẩm mới nhất & voucher giảm <strong>200.000₫</strong> cho đơn hàng đầu tiên!
              </p>
            </div>
          </div>

          <form onSubmit={handleSubscribe} className="newsletter-form">
            <input
              type="email"
              className="newsletter-input"
              placeholder="Nhập địa chỉ email của bạn..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">
              <Send size={16} />
              <span>{subscribed ? 'Đã đăng ký!' : 'Đăng ký ngay'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* 2. Features / Value Proposition */}
      <div className="footer-features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-icon-wrapper">
                <Truck size={24} />
              </div>
              <div>
                <div className="feature-title">Giao Hàng Siêu Tốc 2H</div>
                <div className="feature-desc">Nội thành Hà Nội & TP. Hồ Chí Minh</div>
              </div>
            </div>

            <div className="feature-box">
              <div className="feature-icon-wrapper">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="feature-title">100% Hàng Chính Hãng</div>
                <div className="feature-desc">Bảo hành 24 tháng tại hãng</div>
              </div>
            </div>

            <div className="feature-box">
              <div className="feature-icon-wrapper">
                <RotateCcw size={24} />
              </div>
              <div>
                <div className="feature-title">Đổi Mới 30 Ngày</div>
                <div className="feature-desc">1 đổi 1 nhanh chóng nếu có lỗi NSX</div>
              </div>
            </div>

            <div className="feature-box">
              <div className="feature-icon-wrapper">
                <Headphones size={24} />
              </div>
              <div>
                <div className="feature-title">Hỗ Trợ Kỹ Thuật 24/7</div>
                <div className="feature-desc">Chuyên viên hỗ trợ tận tình</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Footer Links */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Column 1: Brand & Contact Info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <Cpu size={22} />
                </div>
                <h3 style={{ fontSize: '1.35rem', color: '#ffffff', fontWeight: 800 }}>NovaTech</h3>
              </div>
              <p style={{ fontSize: '0.875rem', marginBottom: 16, lineHeight: 1.6 }}>
                Hệ thống bán lẻ thiết bị công nghệ hàng đầu, chuyên cung cấp máy tính, điện thoại, phụ kiện chính hãng chất lượng cao.
              </p>

              <div className="footer-contact-item">
                <MapPin size={18} style={{ color: '#38bdf8', flexShrink: 0, marginTop: 2 }} />
                <span>Số 123 Đường Công Nghệ, Quận Cầu Giấy, Hà Nội</span>
              </div>
              <div className="footer-contact-item">
                <Phone size={18} style={{ color: '#38bdf8', flexShrink: 0 }} />
                <span>Hotline: <strong>1800 6868</strong> (Miễn phí 8:00 - 21:30)</span>
              </div>
              <div className="footer-contact-item">
                <Clock size={18} style={{ color: '#38bdf8', flexShrink: 0 }} />
                <span>Email hỗ trợ: cskh@novatech.vn</span>
              </div>
            </div>

            {/* Column 2: Customer Care */}
            <div>
              <h4 className="footer-col-title">Chăm Sóc Khách Hàng</h4>
              <div className="footer-links-list">
                <Link to="/help/warranty">Chính sách bảo hành chính hãng</Link>
                <Link to="/help/returns">Chính sách đổi trả & hoàn tiền</Link>
                <Link to="/help/shipping">Phương thức vận chuyển & giao nhận</Link>
                <Link to="/help/installment">Hướng dẫn mua hàng trả góp 0%</Link>
                <Link to="/help/faq">Câu hỏi thường gặp (FAQ)</Link>
                <Link to="/help/check-warranty">Tra cứu bảo hành trực tuyến</Link>
              </div>
            </div>

            {/* Column 3: About NovaTech */}
            <div>
              <h4 className="footer-col-title">Về NovaTech</h4>
              <div className="footer-links-list">
                <Link to="/about">Giới thiệu hệ thống NovaTech</Link>
                <Link to="/stores">Hệ thống showroom toàn quốc</Link>
                <Link to="/careers">Cơ hội nghề nghiệp & Tuyển dụng</Link>
                <Link to="/b2b">Khách hàng doanh nghiệp (B2B)</Link>
                <Link to="/privacy">Chính sách bảo mật thông tin</Link>
                <Link to="/terms">Điều khoản sử dụng dịch vụ</Link>
              </div>
            </div>

            {/* Column 4: Payment & Security */}
            <div>
              <h4 className="footer-col-title">Thanh Toán & Đối Tác</h4>
              <p style={{ fontSize: '0.85rem', marginBottom: 10 }}>Hỗ trợ đa dạng phương thức thanh toán an toàn:</p>
              <div className="payment-badges">
                <span className="payment-chip">Visa</span>
                <span className="payment-chip">MasterCard</span>
                <span className="payment-chip">VNPay QR</span>
                <span className="payment-chip">Ví MoMo</span>
                <span className="payment-chip">Chuyển khoản</span>
                <span className="payment-chip">COD (Tiền mặt)</span>
              </div>

              <div style={{ marginTop: 24 }}>
                <p style={{ fontSize: '0.85rem', marginBottom: 10 }}>Chứng nhận uy tín:</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600 }}>
                  <CheckCircle2 size={18} />
                  <span>Đã thông báo Bộ Công Thương</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Copyright & Social */}
      <div className="footer-bottom">
        <div className="container">
          <div>
            © {currentYear} NovaTech eProject. Nền tảng bán lẻ công nghệ hiện đại. All rights reserved.
          </div>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Facebook">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Youtube">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Instagram">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
