import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('novatech_cart');
      return saved ? JSON.parse(saved) : [
        {
          id: 1,
          name: 'MacBook Pro 14 M3 Pro (18GB / 512GB SSD)',
          slug: 'macbook-pro-14-m3-pro',
          price: 49990000,
          originalPrice: 54990000,
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
          quantity: 1
        },
        {
          id: 9,
          name: 'Củ sạc nhanh Anker Prime 100W GaN 3 cổng (2C1A)',
          slug: 'anker-prime-100w-gan',
          price: 1390000,
          originalPrice: 1790000,
          image: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?auto=format&fit=crop&w=800&q=80',
          quantity: 2
        }
      ];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem('novatech_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  const addToCart = (product, qty = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        quantity: qty
      }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const applyVoucher = (code) => {
    const trimmed = (code || '').trim().toUpperCase();
    if (trimmed === 'NOVATECH10' || trimmed === 'EPROJECT10') {
      setVoucherCode(trimmed);
      setDiscountPercent(10);
      return { success: true, message: 'Áp dụng mã giảm giá 10% thành công!' };
    }
    if (trimmed === 'VIP20') {
      setVoucherCode(trimmed);
      setDiscountPercent(20);
      return { success: true, message: 'Áp dụng mã ưu đãi VIP giảm 20% thành công!' };
    }
    return { success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.' };
  };

  const removeVoucher = () => {
    setVoucherCode('');
    setDiscountPercent(0);
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const shippingFee = subtotal > 2000000 || subtotal === 0 ? 0 : 35000;
  const finalTotal = subtotal - discountAmount + shippingFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discountAmount,
        discountPercent,
        shippingFee,
        finalTotal,
        voucherCode,
        applyVoucher,
        removeVoucher,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
