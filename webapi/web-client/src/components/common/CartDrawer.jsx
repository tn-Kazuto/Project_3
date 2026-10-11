import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../data/mockProducts';
import './CartDrawer.css';

export const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    totalItems
  } = useCart();

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  return (
    <div className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title">
            <ShoppingCart size={20} style={{ color: 'var(--primary)' }} />
            <span>Giỏ hàng ({totalItems} sản phẩm)</span>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Đóng giỏ hàng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items List */}
        {cartItems.length === 0 ? (
          <div className="cart-empty-state">
            <div className="empty-icon-wrap">
              <ShoppingCart size={40} />
            </div>
            <h4 style={{ color: 'var(--text-main)', marginBottom: 8 }}>Giỏ hàng đang trống</h4>
            <p style={{ fontSize: '0.875rem', marginBottom: 20 }}>
              Hãy khám phá các thiết bị công nghệ hấp dẫn và thêm vào giỏ nhé!
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setIsCartOpen(false);
                navigate('/products');
              }}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items-scroll">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-details">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">{formatCurrency(item.price)}</div>

                    <div className="cart-item-actions">
                      <div className="quantity-control">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="qty-number">{item.quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="remove-item-btn"
                        onClick={() => removeFromCart(item.id)}
                        title="Xóa khỏi giỏ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Summary & Checkout */}
            <div className="cart-drawer-footer">
              <div className="cart-summary-row">
                <span>Tạm tính ({totalItems} món):</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <div className="cart-summary-row" style={{ color: '#10b981' }}>
                <span>Vận chuyển:</span>
                <span>{subtotal > 2000000 ? 'Miễn phí' : 'Tính ở bước thanh toán'}</span>
              </div>
              <div className="cart-summary-total">
                <span>Tổng tiền:</span>
                <span className="total-price">{formatCurrency(subtotal)}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={handleCheckoutClick}
                >
                  <span>Xem giỏ hàng & Thanh toán</span>
                  <ArrowRight size={18} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.78rem', color: '#64748b' }}>
                  <ShieldCheck size={14} style={{ color: '#10b981' }} />
                  <span>Bảo mật thông tin đơn hàng 100%</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
