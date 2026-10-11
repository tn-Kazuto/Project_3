import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Cpu,
  Search,
  ShoppingCart,
  Heart,
  User,
  PhoneCall,
  Menu,
  ChevronDown,
  Sparkles,
  Flame,
  ShieldCheck,
  Truck,
  RotateCcw,
  LogOut,
  Package
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { MOCK_PRODUCTS, formatCurrency } from '../../data/mockProducts';
import { CATEGORIES } from '../../data/categories';
import './Header.css';

export const Header = ({ onOpenMobileMenu }) => {
  const navigate = useNavigate();
  const { totalItems, subtotal, setIsCartOpen } = useCart();
  const { totalWishlist } = useWishlist();
  const { user, logout, isAuthenticated } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products for live suggestions
  const searchResults = searchQuery.trim() === ''
    ? []
    : MOCK_PRODUCTS.filter(item => {
        const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesQuery && matchesCategory;
      }).slice(0, 4);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery)}&cat=${selectedCategory}`);
      setIsSearchFocused(false);
    }
  };

  return (
    <header className="site-header">
      {/* 1. Top Announcement Bar */}
      <div className="header-topbar">
        <div className="container">
          <div className="topbar-left">
            <span className="topbar-item">
              <Truck size={14} className="topbar-highlight" />
              <span>Miễn phí giao hàng cho đơn từ 2.000.000₫</span>
            </span>
            <span className="topbar-item">
              <ShieldCheck size={14} className="topbar-highlight" />
              <span>Cam kết 100% hàng chính hãng, bảo hành 24T</span>
            </span>
          </div>
          <div className="topbar-right">
            <a href="tel:18006868" className="topbar-item">
              <PhoneCall size={14} className="topbar-highlight" />
              <span>Hotline CSKH: <strong>1800 6868</strong> (Miễn phí)</span>
            </a>
            <span className="topbar-item">
              <RotateCcw size={14} />
              <span>Đổi mới 30 ngày lỗi NSX</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Header Bar */}
      <div className="header-main">
        <div className="container">
          {/* Mobile hamburger button */}
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={onOpenMobileMenu}
            aria-label="Mở menu danh mục"
          >
            <Menu size={22} />
          </button>

          {/* Brand Logo */}
          <Link to="/" className="header-brand">
            <div className="brand-icon-box">
              <Cpu size={26} />
            </div>
            <div className="brand-info">
              <span className="brand-title">NovaTech</span>
              <span className="brand-subtitle">Electronics & Tech</span>
            </div>
          </Link>

          {/* Search Bar with Live Suggestions */}
          <div className="header-search" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Bạn muốn tìm laptop, iPhone 16, tai nghe chống ồn...?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
              />

              <select
                className="search-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Tất cả mục</option>
                <option value="laptop">Laptop</option>
                <option value="dien-thoai">Điện thoại</option>
                <option value="am-thanh">Âm thanh</option>
                <option value="smartwatch">Smartwatch</option>
                <option value="phu-kien">Phụ kiện</option>
              </select>

              <button type="submit" className="search-submit-btn" aria-label="Tìm kiếm sản phẩm">
                <Search size={18} />
              </button>
            </form>

            {/* Live Search Suggestion Popover */}
            {isSearchFocused && searchResults.length > 0 && (
              <div className="search-dropdown">
                <div className="search-dropdown-title">Gợi ý sản phẩm ({searchResults.length})</div>
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="search-result-item"
                    onClick={() => {
                      navigate(`/product/${item.slug}`);
                      setIsSearchFocused(false);
                      setSearchQuery('');
                    }}
                  >
                    <img src={item.image} alt={item.name} />
                    <div className="search-result-info">
                      <div className="search-result-name">{item.name}</div>
                      <div className="search-result-price">{formatCurrency(item.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="header-actions">
            {/* Wishlist Icon */}
            <Link to="/wishlist" className="header-action-item" title="Sản phẩm yêu thích">
              <div className="action-icon-wrapper">
                <Heart size={20} />
                {totalWishlist > 0 && <span className="action-badge">{totalWishlist}</span>}
              </div>
              <div className="action-text-group">
                <span className="action-label">Yêu thích</span>
                <span className="action-value">{totalWishlist} món</span>
              </div>
            </Link>

            {/* Cart Icon & Toggle */}
            <div
              className="header-action-item"
              onClick={() => setIsCartOpen(true)}
              title="Xem giỏ hàng"
              role="button"
              tabIndex={0}
            >
              <div className="action-icon-wrapper">
                <ShoppingCart size={20} />
                {totalItems > 0 && <span className="action-badge">{totalItems}</span>}
              </div>
              <div className="action-text-group">
                <span className="action-label">Giỏ hàng</span>
                <span className="action-value">{formatCurrency(subtotal)}</span>
              </div>
            </div>

            {/* User Account Menu */}
            <div className="header-action-item" ref={userMenuRef}>
              <div
                className="action-icon-wrapper"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {isAuthenticated && user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="user-avatar-small" />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div
                className="action-text-group"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="action-label">
                  {isAuthenticated ? 'Xin chào,' : 'Tài khoản'}
                </span>
                <span className="action-value">
                  {isAuthenticated ? user.fullName : 'Đăng nhập'}
                </span>
              </div>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="search-dropdown" style={{ minWidth: 200, right: 0, left: 'auto' }}>
                  {isAuthenticated ? (
                    <>
                      <div className="search-dropdown-title">Tài khoản của bạn</div>
                      <div style={{ padding: '6px 8px', fontSize: '0.85rem', color: '#64748b' }}>
                        {user.email}
                      </div>
                      <Link
                        to="/orders"
                        className="search-result-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Package size={16} />
                        <span>Đơn hàng của tôi</span>
                      </Link>
                      <div
                        className="search-result-item"
                        style={{ color: '#ef4444' }}
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                      >
                        <LogOut size={16} />
                        <span>Đăng xuất</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="search-dropdown-title">Thành viên NovaTech</div>
                      <Link
                        to="/login"
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', marginBottom: 6, display: 'flex' }}
                        onClick={() => setShowUserMenu(false)}
                      >
                        Đăng nhập
                      </Link>
                      <Link
                        to="/register"
                        className="btn btn-outline btn-sm"
                        style={{ width: '100%', display: 'flex' }}
                        onClick={() => setShowUserMenu(false)}
                      >
                        Đăng ký tài khoản
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Bar */}
      <nav className="header-nav">
        <div className="container">
          {/* Category Dropdown Trigger */}
          <div className="category-menu-wrapper">
            <button
              type="button"
              className="category-trigger-btn"
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            >
              <Menu size={18} />
              <span>DANH MỤC SẢN PHẨM</span>
              <ChevronDown size={16} />
            </button>

            {/* Category Dropdown Content */}
            {showCategoryMenu && (
              <div
                className="search-dropdown"
                style={{ width: 280, top: '100%', left: 0 }}
                onMouseLeave={() => setShowCategoryMenu(false)}
              >
                <div className="search-dropdown-title">Ngành hàng công nghệ</div>
                {CATEGORIES.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/products?cat=${cat.slug}`}
                    className="search-result-item"
                    onClick={() => setShowCategoryMenu(false)}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Main Links */}
          <div className="main-nav-links">
            <NavLink to="/" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
              Trang chủ
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
              Tất cả sản phẩm
            </NavLink>
            <NavLink to="/products?tag=sale" className="nav-link-item hot-link">
              <Flame size={16} />
              Flash Sale
            </NavLink>
            <NavLink to="/products?cat=laptop" className="nav-link-item">
              Laptop & Mac
            </NavLink>
            <NavLink to="/products?cat=dien-thoai" className="nav-link-item">
              Điện thoại
            </NavLink>
            <NavLink to="/products?cat=am-thanh" className="nav-link-item">
              Âm thanh
            </NavLink>
            <NavLink to="/blog" className="nav-link-item">
              Tin công nghệ
            </NavLink>
            <NavLink to="/contact" className="nav-link-item">
              Hệ thống Showroom
            </NavLink>
          </div>

          {/* Extra Promo Highlight */}
          <div className="nav-extra-promo">
            <Sparkles size={16} />
            <span>Mã <strong>EPROJECT10</strong> giảm 10%</span>
          </div>
        </div>
      </nav>
    </header>
  );
};
