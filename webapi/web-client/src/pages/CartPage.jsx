import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../data/mockProducts';
import './CartPage.css';

export const CartPage = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discountAmount,
    discountPercent,
    shippingFee,
    finalTotal,
    voucherCode,
    applyVoucher,
    removeVoucher,
    totalItems
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [voucherMessage, setVoucherMessage] = useState(null);

  const handleApplyVoucher = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = applyVoucher(inputCode);
    setVoucherMessage(res);
  };

  return (
    <div className="cart-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-wrapper">
        <div className="container">
          <div className="breadcrumb-list">
            <Link to="/">Trang chủ</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span className="breadcrumb-active">Giỏ hàng của bạn</span>
          </div>
        </div>
      </div>

      <div className="container">
        {cartItems.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            padding: '80px 20px',
            textAlign: 'center'
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'var(--bg-subtle)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              color: '#94a3b8'
            }}>
              <ShoppingCart size={40} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Giỏ hàng của bạn đang trống</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              Không có sản phẩm nào trong giỏ hàng. Hãy lướt xem các thiết bị mới nhất nhé!
            </p>
            <Link to="/products" className="btn btn-primary btn-lg">
              <span>Khám phá sản phẩm ngay</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="cart-layout-grid">
            {/* Products Table Card */}
            <div className="cart-table-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  Giỏ Hàng ({totalItems} món)
                </h2>
                <button
                  type="button"
                  onClick={clearCart}
                  style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Trash2 size={14} />
                  <span>Xóa tất cả</span>
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="cart-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Đơn giá</th>
                      <th>Số lượng</th>
                      <th>Thành tiền</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div className="cart-product-cell">
                            <img src={item.image} alt={item.name} className="cart-product-img" />
                            <div>
                              <div className="cart-product-title">{item.name}</div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Bảo hành 24T chính hãng</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{formatCurrency(item.price)}</span>
                        </td>
                        <td>
                          <div className="quantity-control" style={{ background: '#fff' }}>
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
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="remove-item-btn"
                            onClick={() => removeFromCart(item.id)}
                            title="Xóa món này"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/products" className="btn btn-outline btn-sm">
                  ← Tiếp tục mua sắm
                </Link>
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="order-summary-card">
              <h3 className="summary-title">Tóm Tắt Đơn Hàng</h3>

              <div className="summary-row">
                <span>Tạm tính hàng hóa:</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>

              {discountAmount > 0 && (
                <div className="summary-row" style={{ color: '#10b981' }}>
                  <span>Giảm giá voucher ({discountPercent}%):</span>
                  <strong>-{formatCurrency(discountAmount)}</strong>
                </div>
              )}

              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span>{shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</span>
              </div>

              <div className="summary-divider"></div>

              {/* Voucher Code Form */}
              <form onSubmit={handleApplyVoucher} className="voucher-form">
                <input
                  type="text"
                  className="voucher-input"
                  placeholder="Mã giảm (VD: NOVATECH10)"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary btn-sm">
                  Áp dụng
                </button>
              </form>

              {voucherMessage && (
                <div style={{
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 16,
                  color: voucherMessage.success ? '#10b981' : '#ef4444'
                }}>
                  {voucherMessage.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  <span>{voucherMessage.message}</span>
                </div>
              )}

              {voucherCode && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--primary-light)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 16,
                  fontSize: '0.8rem',
                  color: 'var(--primary)',
                  fontWeight: 600
                }}>
                  <span>Mã đang dùng: <strong>{voucherCode}</strong></span>
                  <button type="button" onClick={removeVoucher} style={{ color: '#ef4444', background: 'none' }}>Gỡ</button>
                </div>
              )}

              <div className="summary-total-row">
                <span>Tổng thanh toán:</span>
                <span className="summary-total-price">{formatCurrency(finalTotal)}</span>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: 12 }}
                onClick={() => alert('Đơn hàng đã được ghi nhận mô phỏng! Sẵn sàng kết nối API Backend .NET 10.')}
              >
                <span>Tiến hành Đặt hàng</span>
                <ArrowRight size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.78rem', color: '#64748b' }}>
                <ShieldCheck size={14} style={{ color: '#10b981' }} />
                <span>Cam kết bảo mật & Hỗ trợ giao tận nơi</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
