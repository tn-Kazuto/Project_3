import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  X,
  SlidersHorizontal,
  RotateCcw,
  Home,
  ShoppingBag,
  Flame,
  FileText,
  Phone,
  Cpu,
  Star
} from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import './Sidebar.css';

// 1. Mobile Off-Canvas Drawer Component
export const MobileDrawer = ({ isOpen, onClose }) => {
  return (
    <div className={`mobile-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Cpu size={20} />
            </div>
            <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>NovaTech</strong>
          </div>
          <button type="button" className="drawer-close-btn" onClick={onClose} aria-label="Đóng menu">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {/* Main Navigation */}
          <div className="drawer-section-title">Menu Điều Hướng</div>
          <div className="drawer-menu-list">
            <NavLink to="/" className="drawer-menu-item" onClick={onClose}>
              <Home size={18} />
              <span>Trang chủ</span>
            </NavLink>
            <NavLink to="/products" className="drawer-menu-item" onClick={onClose}>
              <ShoppingBag size={18} />
              <span>Tất cả sản phẩm</span>
            </NavLink>
            <NavLink to="/products?tag=sale" className="drawer-menu-item" onClick={onClose} style={{ color: '#ef4444' }}>
              <Flame size={18} />
              <span>Flash Sale Giảm Sốc</span>
            </NavLink>
            <NavLink to="/blog" className="drawer-menu-item" onClick={onClose}>
              <FileText size={18} />
              <span>Tin công nghệ</span>
            </NavLink>
            <NavLink to="/contact" className="drawer-menu-item" onClick={onClose}>
              <Phone size={18} />
              <span>Liên hệ & Showroom</span>
            </NavLink>
          </div>

          {/* Categories List */}
          <div className="drawer-section-title">Danh Mục Sản Phẩm</div>
          <div className="drawer-menu-list">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.id}
                to={`/products?cat=${cat.slug}`}
                className="drawer-menu-item"
                onClick={onClose}
              >
                <span>{cat.name}</span>
                <span className="filter-count" style={{ marginLeft: 'auto' }}>{cat.itemCount}</span>
              </Link>
            ))}
          </div>

          {/* Quick Account */}
          <div className="drawer-section-title">Tài Khoản</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/login" className="btn btn-primary btn-sm" onClick={onClose}>
              Đăng nhập
            </Link>
            <Link to="/register" className="btn btn-outline btn-sm" onClick={onClose}>
              Đăng ký tài khoản
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Filter Sidebar Component for Products / Catalog Page
export const FilterSidebar = ({
  selectedCategories = [],
  onCategoryChange,
  selectedBrands = [],
  onBrandChange,
  priceRange = 'all',
  onPriceChange,
  minRating = 0,
  onRatingChange,
  inStockOnly = false,
  onInStockChange,
  onResetFilters
}) => {
  const brands = ['Apple', 'Samsung', 'Sony', 'ASUS', 'Dell', 'Marshall', 'Anker', 'Keychron', 'Garmin', 'Shargeek'];

  const pricePresets = [
    { label: 'Tất cả mức giá', value: 'all' },
    { label: 'Dưới 5 triệu', value: 'under-5' },
    { label: 'Từ 5 - 15 triệu', value: '5-15' },
    { label: 'Từ 15 - 30 triệu', value: '15-30' },
    { label: 'Trên 30 triệu', value: 'over-30' },
  ];

  return (
    <aside className="filter-sidebar">
      <div className="filter-sidebar-header">
        <h3 className="filter-sidebar-title">
          <SlidersHorizontal size={18} />
          <span>Bộ Lọc Sản Phẩm</span>
        </h3>
        <button type="button" className="filter-reset-btn" onClick={onResetFilters}>
          <RotateCcw size={13} style={{ display: 'inline', marginRight: 4 }} />
          Xóa lọc
        </button>
      </div>

      {/* 1. Category Filter */}
      <div className="filter-group">
        <h4 className="filter-title">Danh mục</h4>
        {CATEGORIES.map(cat => (
          <label key={cat.id} className="filter-item">
            <span className="filter-label">
              <input
                type="checkbox"
                className="filter-checkbox"
                checked={selectedCategories.includes(cat.slug)}
                onChange={() => onCategoryChange && onCategoryChange(cat.slug)}
              />
              <span>{cat.name}</span>
            </span>
            <span className="filter-count">{cat.itemCount}</span>
          </label>
        ))}
      </div>

      {/* 2. Brand Filter */}
      <div className="filter-group">
        <h4 className="filter-title">Thương hiệu</h4>
        {brands.map(brand => (
          <label key={brand} className="filter-item">
            <span className="filter-label">
              <input
                type="checkbox"
                className="filter-checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => onBrandChange && onBrandChange(brand)}
              />
              <span>{brand}</span>
            </span>
          </label>
        ))}
      </div>

      {/* 3. Price Filter */}
      <div className="filter-group">
        <h4 className="filter-title">Khoảng giá</h4>
        <div className="price-presets">
          {pricePresets.map(preset => (
            <button
              key={preset.value}
              type="button"
              className={`price-chip ${priceRange === preset.value ? 'active' : ''}`}
              onClick={() => onPriceChange && onPriceChange(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Rating Filter */}
      <div className="filter-group">
        <h4 className="filter-title">Đánh giá sao</h4>
        {[4.8, 4.5, 4.0].map(rating => (
          <label key={rating} className="filter-item">
            <span className="filter-label">
              <input
                type="radio"
                name="rating_filter"
                className="filter-checkbox"
                checked={minRating === rating}
                onChange={() => onRatingChange && onRatingChange(rating)}
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={14} fill="#f59e0b" color="#f59e0b" />
                <span>Từ {rating} sao trở lên</span>
              </span>
            </span>
          </label>
        ))}
      </div>

      {/* 5. In Stock Only */}
      <div className="filter-group">
        <label className="filter-item">
          <span className="filter-label">
            <input
              type="checkbox"
              className="filter-checkbox"
              checked={inStockOnly}
              onChange={(e) => onInStockChange && onInStockChange(e.target.checked)}
            />
            <span style={{ fontWeight: 600 }}>Chỉ xem hàng có sẵn</span>
          </span>
        </label>
      </div>
    </aside>
  );
};
