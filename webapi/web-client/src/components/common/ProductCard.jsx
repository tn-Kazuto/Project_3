import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatCurrency } from '../../data/mockProducts';
import './ProductCard.css';

export const ProductCard = ({ product }) => {
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setIsCartOpen(true);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const isFavorited = isInWishlist(product.id);

  return (
    <div className="product-card">
      {/* Thumbnail */}
      <div className="product-image-container">
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.image}
            alt={product.name}
            className="product-thumb-img"
            loading="lazy"
          />
        </Link>

        {/* Badge (Hot, Sale, New) */}
        {product.tag && (
          <span className={`product-badge-tag badge badge-${product.badgeType || 'hot'}`}>
            {product.tag}
          </span>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          className={`product-wishlist-btn ${isFavorited ? 'active' : ''}`}
          onClick={handleToggleWishlist}
          title={isFavorited ? 'Bỏ thích' : 'Thêm vào yêu thích'}
          aria-label="Yêu thích"
        >
          <Heart size={18} fill={isFavorited ? '#ef4444' : 'none'} />
        </button>
      </div>

      {/* Card Content */}
      <div className="product-card-body">
        <div className="product-brand-cat">
          <span>{product.brand}</span>
          {product.inStock ? (
            <span style={{ color: '#10b981' }}>Còn hàng</span>
          ) : (
            <span style={{ color: '#ef4444' }}>Tạm hết hàng</span>
          )}
        </div>

        <h3 className="product-card-title">
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>

        {/* Rating */}
        <div className="product-rating-row">
          <div className="rating-stars">
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span style={{ fontWeight: 700, marginLeft: 3, color: 'var(--text-main)' }}>
              {product.rating}
            </span>
          </div>
          <span className="rating-count">({product.reviewCount} đánh giá)</span>
        </div>

        {/* Price & Add to Cart */}
        <div className="product-card-footer">
          <div className="price-container">
            <span className="current-price">{formatCurrency(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="original-price">{formatCurrency(product.originalPrice)}</span>
            )}
          </div>

          <button
            type="button"
            className="add-cart-btn"
            onClick={handleAddToCart}
            title="Thêm vào giỏ hàng"
            aria-label="Thêm vào giỏ hàng"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
