import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingBag,
  Heart,
  Plus,
  Minus,
  CheckCircle2
} from 'lucide-react';
import { MOCK_PRODUCTS, formatCurrency } from '../data/mockProducts';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/common/ProductCard';
import './ProductDetailPage.css';

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Find product by slug or fallback to first product
  const product = MOCK_PRODUCTS.find(p => p.slug === slug) || MOCK_PRODUCTS[0];
  const [activeImg, setActiveImg] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const selectedImg = activeImg || product.image;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  const isFavorited = isInWishlist(product.id);
  const relatedProducts = MOCK_PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="product-detail-page">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-wrapper">
        <div className="container">
          <div className="breadcrumb-list">
            <Link to="/">Trang chủ</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <Link to="/products">Sản phẩm</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <Link to={`/products?cat=${product.category}`}>{product.brand}</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span className="breadcrumb-active">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Main Product Section */}
        <div className="detail-main-grid">
          {/* Gallery View */}
          <div className="gallery-wrapper">
            <div className="main-image-box">
              <img src={selectedImg} alt={product.name} />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="thumbnails-row">
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`thumbnail-item ${selectedImg === img ? 'active' : ''}`}
                    onClick={() => setActiveImg(img)}
                  >
                    <img src={img} alt={`${product.name} thumb ${idx}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info-col">
            <span className="detail-brand-badge">{product.brand}</span>
            <h1 className="detail-title">{product.name}</h1>

            <div className="detail-rating-stock">
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <strong style={{ color: 'var(--text-main)' }}>{product.rating}</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  ({product.reviewCount} đánh giá khách hàng)
                </span>
              </div>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>
                <CheckCircle2 size={16} />
                <span>Còn {product.stockCount || 10} sản phẩm tại kho</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="detail-price-box">
              <span className="detail-current-price">{formatCurrency(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="detail-original-price">{formatCurrency(product.originalPrice)}</span>
                  <span className="badge badge-sale">Giảm {product.discountPercent}%</span>
                </>
              )}
            </div>

            <p className="detail-desc">{product.description}</p>

            {/* Quantity & CTA buttons */}
            <div className="detail-actions-row">
              <div className="quantity-picker">
                <button
                  type="button"
                  className="qty-picker-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus size={14} />
                </button>
                <span className="qty-picker-val">{quantity}</span>
                <button
                  type="button"
                  className="qty-picker-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-lg"
                onClick={handleAddToCart}
                style={{ flex: 1 }}
              >
                <ShoppingBag size={20} />
                <span>Thêm vào giỏ hàng</span>
              </button>

              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={handleBuyNow}
                style={{ flex: 1 }}
              >
                <span>Mua ngay</span>
              </button>

              <button
                type="button"
                className={`btn btn-outline ${isFavorited ? 'active' : ''}`}
                style={{ height: 48, width: 48, padding: 0 }}
                onClick={() => toggleWishlist(product)}
                title="Lưu vào yêu thích"
              >
                <Heart size={20} fill={isFavorited ? '#ef4444' : 'none'} color={isFavorited ? '#ef4444' : 'currentColor'} />
              </button>
            </div>

            {/* Trust Guarantees */}
            <div className="detail-guarantees-grid">
              <div className="guarantee-item">
                <Truck size={18} style={{ color: 'var(--primary)' }} />
                <span>Giao hàng toàn quốc siêu tốc</span>
              </div>
              <div className="guarantee-item">
                <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
                <span>Bảo hành 24 tháng chính hãng</span>
              </div>
              <div className="guarantee-item">
                <RotateCcw size={18} style={{ color: 'var(--primary)' }} />
                <span>Lỗi 1 đổi 1 trong 30 ngày</span>
              </div>
              <div className="guarantee-item">
                <CheckCircle2 size={18} style={{ color: 'var(--primary)' }} />
                <span>Có hóa đơn VAT đầy đủ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        {product.specs && (
          <div className="specs-card">
            <h2 className="specs-title">Thông Số Kỹ Thuật Chi Tiết</h2>
            <table className="specs-table">
              <tbody>
                {Object.entries(product.specs).map(([specKey, specVal]) => (
                  <tr key={specKey}>
                    <td>{specKey}</td>
                    <td>{specVal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 20 }}>Sản Phẩm Cùng Phân Khúc</h2>
            <div className="products-grid">
              {relatedProducts.map(rel => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
