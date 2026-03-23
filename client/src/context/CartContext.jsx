import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const CartContext = createContext();

const CART_KEY = 'lbq_cart';
const FORM_KEY = 'lbq_form';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function loadForm() {
  try {
    const raw = localStorage.getItem(FORM_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [savedForm, setSavedForm] = useState(loadForm);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(FORM_KEY, JSON.stringify(savedForm));
  }, [savedForm]);

  const addToCart = useCallback((item) => {
    setCart(prev => {
      const key = item.type === 'deal' ? `deal-${item.dealId || item.name}` : `item-${item.name}`;
      const existing = prev.find(c => c.id === key);
      if (existing) {
        const newQty = Math.min(existing.quantity + (item.quantity || 1), 10);
        return prev.map(c => c.id === key ? { ...c, quantity: newQty } : c);
      }
      return [...prev, {
        id: key,
        name: item.name,
        type: item.type || 'item',
        price: item.price || 0,
        quantity: item.quantity || 1,
        dealId: item.dealId,
        image: item.image || '',
        items: item.items || [],
      }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(c => c.id !== id));
    } else {
      setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: Math.min(quantity, 10) } : c));
    }
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const cartCount = useMemo(() => cart.reduce((sum, c) => sum + c.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, c) => sum + (c.price * c.quantity), 0), [cart]);

  const value = useMemo(() => ({
    cart, addToCart, removeFromCart, updateQuantity, clearCart,
    cartCount, cartTotal, isCartOpen, setIsCartOpen, openCart, closeCart,
    savedForm, setSavedForm,
  }), [cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, isCartOpen, openCart, closeCart, savedForm]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
