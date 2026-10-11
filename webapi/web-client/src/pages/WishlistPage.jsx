import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../data/mockProducts';

export const WishlistPage = () => {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Breadcrumb */}
      <div className="breadcrumb-wrapper">
        <div className="container">
          <div className="breadcrumb-list">
            <Link to="/">Trang chủ</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span className="breadcrumb-active">Danh sách yêu thích</span>
          </div>
        </div>
      </div>

      <div className="container">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 24 }}>
          Sản Phẩm Yêu Thích ({wishlistItems.length})
        </h1>

        {wishlistItems.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            padding: '70px 20px',
            textAlign: 'center'
          }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#ef4444',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <Heart size={36} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 8 }}>Chưa có sản phẩm yêu thích</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              Hãy nhấn biểu tượng trái tim trên các sản phẩm bạn quan tâm để lưu lại tại đây!
            </p>
            <Link to="/products" className="btn btn-primary">
              <span>Xem danh sách sản phẩm</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {wishlistItems.map(item => (
              <div key={item.id} className="product-card">
                <div className="product-image-container">
                  <Link to={`/product/${item.slug}`}>
                    <img src={item.image} alt={item.name} className="product-thumb-img" />
                  </Link>
                  <button
                    type="button"
                    className="product-wishlist-btn active"
                    onClick={() => toggleWishlist(item)}
                    title="Bỏ thích"
                  >
                    <Heart size={18} fill="#ef4444" color="#ef4444" />
                  </button>
                </div>
                <div className="product-card-body">
                  <h3 className="product-card-title">
                    <Link to={`/product/${item.slug}`}>{item.name}</Link>
                  </h3>
                  <div className="product-card-footer">
                    <span className="current-price">{formatCurrency(item.price)}</span>
                    <button
                      type="button"
                      className="add-cart-btn"
                      onClick={() => {
                        addToCart(item, 1);
                        setIsCartOpen(true);
                      }}
                      title="Thêm vào giỏ"
                    >
                      <ShoppingBag size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
