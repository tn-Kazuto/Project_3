import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Laptop,
  Smartphone,
  Headphones,
  Watch,
  Monitor,
  Cpu,
  ChevronRight
} from 'lucide-react';
import { ProductCard } from '../components/common/ProductCard';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { CATEGORIES } from '../data/categories';
import './HomePage.css';

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState('all');

  // Flash sale countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 32,
    seconds: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filter products by tab
  const filteredProducts = MOCK_PRODUCTS.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'hot') return item.tag === 'Bán chạy' || item.badgeType === 'hot';
    if (activeTab === 'sale') return item.discountPercent > 10;
    if (activeTab === 'new') return item.badgeType === 'new';
    return true;
  });

  // Category Icon Resolver
  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Laptop': return <Laptop size={24} />;
      case 'Smartphone': return <Smartphone size={24} />;
      case 'Headphones': return <Headphones size={24} />;
      case 'Watch': return <Watch size={24} />;
      case 'Monitor': return <Monitor size={24} />;
      default: return <Cpu size={24} />;
    }
  };

  return (
    <div className="home-page">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            {/* Main Featured Hero Banner */}
            <div className="hero-main-card">
              <div className="hero-glow"></div>
              <div className="hero-content">
                <div className="hero-tag">
                  <Sparkles size={14} />
                  <span>CÔNG NGHỆ ĐỈNH CAO 2026</span>
                </div>
                <h1 className="hero-title">
                  MacBook Pro M3 Pro <span>Hiệu Năng Vượt Bậc</span>
                </h1>
                <p className="hero-desc">
                  Trải nghiệm sức mạnh xử lý đỉnh cao với kiến trúc GPU thế hệ mới, pin bền bỉ 18 giờ và màn hình Liquid Retina XDR sống động.
                </p>
                <div className="hero-actions">
                  <Link to="/product/macbook-pro-14-m3-pro" className="btn btn-primary btn-lg">
                    <span>Khám phá ngay</span>
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/products?cat=laptop" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)' }}>
                    Xem dòng Laptop
                  </Link>
                </div>
              </div>

              <div className="hero-visual">
                <img
                  src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"
                  alt="MacBook Pro"
                />
              </div>
            </div>

            {/* Side Banners */}
            <div className="hero-side-banners">
              <div
                className="side-banner-card"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80')`
                }}
              >
                <div className="side-banner-content">
                  <span className="badge badge-hot" style={{ marginBottom: 8 }}>MỚI RA MẮT</span>
                  <h3 className="side-banner-title">iPhone 16 Pro Max</h3>
                  <p className="side-banner-subtitle">Titan Sa Mạc, Apple Intelligence</p>
                  <Link to="/product/iphone-16-pro-max-256gb" className="btn btn-primary btn-sm">
                    Mua ngay
                  </Link>
                </div>
              </div>

              <div
                className="side-banner-card"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80')`
                }}
              >
                <div className="side-banner-content">
                  <span className="badge badge-sale" style={{ marginBottom: 8 }}>GIẢM TỚI 20%</span>
                  <h3 className="side-banner-title">Âm Thanh Hi-Res</h3>
                  <p className="side-banner-subtitle">Sony WH-1000XM5, Marshall</p>
                  <Link to="/products?cat=am-thanh" className="btn btn-primary btn-sm">
                    Xem ưu đãi
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Flash Sale Section with Countdown */}
      <section className="container">
        <div className="flash-sale-box">
          <div className="flash-sale-header">
            <div className="flash-sale-title-group">
              <div className="flash-sale-flame">
                <Flame size={24} />
              </div>
              <div>
                <h2 className="flash-sale-title">GIỜ VÀNG GIÁ SỐC - FLASH SALE</h2>
                <p style={{ fontSize: '0.875rem', color: '#b91c1c' }}>Ưu đãi giới hạn, số lượng có hạn!</p>
              </div>
            </div>

            <div className="countdown-timer">
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginRight: 6 }}>Kết thúc sau:</span>
              <div className="countdown-segment">
                <span className="countdown-num">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="countdown-label">Giờ</span>
              </div>
              <span style={{ fontWeight: 'bold' }}>:</span>
              <div className="countdown-segment">
                <span className="countdown-num">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="countdown-label">Phút</span>
              </div>
              <span style={{ fontWeight: 'bold' }}>:</span>
              <div className="countdown-segment">
                <span className="countdown-num">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="countdown-label">Giây</span>
              </div>
            </div>
          </div>

          {/* Flash Sale Grid (First 4 items with deep discount) */}
          <div className="products-grid">
            {MOCK_PRODUCTS.slice(2, 6).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Categories Grid */}
      <section className="container">
        <div className="section-header">
          <div className="section-title-wrap">
            <span className="section-eyebrow">DANH MỤC NỔI BẬT</span>
            <h2 className="section-heading">Khám Phá Theo Nhóm Thiết Bị</h2>
          </div>
          <Link to="/products" className="btn btn-ghost" style={{ fontWeight: 700 }}>
            <span>Xem tất cả</span>
            <ChevronRight size={18} />
          </Link>
        </div>

        <div className="categories-slider-grid">
          {CATEGORIES.map(cat => (
            <Link key={cat.id} to={`/products?cat=${cat.slug}`} className="category-card">
              <div className="category-icon-box">
                {getCategoryIcon(cat.icon)}
              </div>
              <div className="category-card-name">{cat.name}</div>
              <div className="category-card-count">{cat.itemCount} sản phẩm</div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Trending Products with Tab Switching */}
      <section className="container">
        <div className="section-header">
          <div className="section-title-wrap">
            <span className="section-eyebrow">SẢN PHẨM BÁN CHẠY</span>
            <h2 className="section-heading">Thiết Bị Công Nghệ Nổi Bật</h2>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="product-tabs-bar">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Tất cả sản phẩm
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'hot' ? 'active' : ''}`}
            onClick={() => setActiveTab('hot')}
          >
            Bán chạy nhất 🔥
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'sale' ? 'active' : ''}`}
            onClick={() => setActiveTab('sale')}
          >
            Khuyến mãi lớn 🏷️
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            Mới về ✨
          </button>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.slice(0, 8).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <Link to="/products" className="btn btn-outline btn-lg">
            <span>Xem thêm tất cả sản phẩm ({MOCK_PRODUCTS.length})</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* 5. Promotional Double Banner */}
      <section className="container" style={{ marginTop: 50 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: 36,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div>
              <span className="badge badge-new" style={{ marginBottom: 10 }}>GAMING PRO</span>
              <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: 8 }}>ASUS ROG & RTX 4070</h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: 20 }}>Tặng kèm chuột & balo gaming trị giá 2.500.000₫</p>
              <Link to="/product/asus-rog-zephyrus-g16" className="btn btn-primary btn-sm">Xem chi tiết</Link>
            </div>
            <img
              src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=260&q=80"
              alt="Gaming"
              style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
            />
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: 36,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div>
              <span className="badge badge-sale" style={{ marginBottom: 10 }}>ƯU ĐÃI VIP</span>
              <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: 8 }}>Phụ Kiện Sạc GaN Siêu Tốc</h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: 20 }}>Giảm đến 22% khi mua kèm máy tính bảng hoặc laptop</p>
              <Link to="/products?cat=phu-kien" className="btn btn-primary btn-sm">Mua ngay</Link>
            </div>
            <img
              src="https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?auto=format&fit=crop&w=260&q=80"
              alt="Anker"
              style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
