import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';

const inputStyle = {
  background: '#1A1A1A',
  border: '1px solid rgba(192,57,43,0.3)',
  borderRadius: '8px',
  padding: '12px 14px',
  color: 'white',
  fontFamily: "'Lora', serif",
  fontSize: '0.9rem',
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.3s',
};

const labelStyle = {
  fontFamily: "'Oswald', sans-serif",
  fontSize: '0.7rem',
  color: '#D4AC0D',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: '6px',
};

const errorStyle = {
  fontFamily: "'Lora', serif",
  fontSize: '0.75rem',
  color: '#E74C3C',
  marginTop: '4px',
};

export default function CartDrawer() {
  const {
    cart, isCartOpen, closeCart, updateQuantity, removeFromCart,
    clearCart, cartTotal, cartCount, savedForm, setSavedForm,
  } = useCart();

  const [customerName, setCustomerName] = useState(savedForm.customerName || '');
  const [phone, setPhone] = useState(savedForm.phone || '');
  const [orderType, setOrderType] = useState(savedForm.orderType || 'delivery');
  const [address, setAddress] = useState(savedForm.address || '');
  const [locationLink, setLocationLink] = useState(savedForm.locationLink || '');
  const [specialInstructions, setSpecialInstructions] = useState(savedForm.specialInstructions || '');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    axios.get('/api/settings').then(r => setSiteSettings(r.data)).catch(() => {});
  }, []);

  const settingsDeliveryCharge = siteSettings?.deliveryCharge ?? 100;
  const deliveryAvailable = siteSettings?.deliveryAvailable ?? true;
  const deliveryCharge = cart.length > 0 && orderType === 'delivery' ? settingsDeliveryCharge : 0;

  useEffect(() => {
    if (!deliveryAvailable && orderType === 'delivery') setOrderType('takeaway');
  }, [deliveryAvailable, orderType]);
  const grandTotal = cartTotal + deliveryCharge;

  // Persist form data
  useEffect(() => {
    setSavedForm({ customerName, phone, orderType, address, locationLink, specialInstructions });
  }, [customerName, phone, orderType, address, locationLink, specialInstructions, setSavedForm]);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isCartOpen]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isCartOpen) closeCart();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isCartOpen, closeCart]);

  const validate = (whatsappOnly = false) => {
    const errors = {};
    if (!customerName.trim() || customerName.trim().length < 2) errors.customerName = 'Name required (min 2 chars)';
    const digits = phone.replace(/\D/g, '');
    if (!digits || digits.length < 10) errors.phone = 'Valid phone required (10+ digits)';
    if (!whatsappOnly) {
      if (orderType === 'delivery' && !address.trim()) errors.address = 'Delivery address required';
      if (cart.length === 0) errors.items = 'Cart is empty';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0]);
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setCustomerName('');
    setPhone('');
    setOrderType('delivery');
    setAddress('');
    setLocationLink('');
    setSpecialInstructions('');
    setFieldErrors({});
    setSavedForm({});
    localStorage.removeItem('lbq_form');
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const deals = cart.filter(c => c.type === 'deal');
      const items = cart.filter(c => c.type === 'item');
      const body = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: '',
        orderType,
        selectedDeal: deals.length > 0 ? { dealId: deals[0].dealId, dealName: deals[0].name, price: deals[0].price } : null,
        individualItems: items.map(c => ({ name: c.name, quantity: c.quantity, price: c.price })),
        specialInstructions: specialInstructions.trim(),
        subtotal: cartTotal,
        locationLink: locationLink.trim(),
      };
      const { data } = await axios.post('/api/orders', body);
      setSuccessOrder({ orderNumber: data.orderNumber, phone: phone.trim() });
      clearCart();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (!validate(true)) return;
    const itemLines = cart.map(c => {
      const priceStr = c.price > 0 ? ` — Rs. ${(c.price * c.quantity).toLocaleString()}` : '';
      return `• ${c.type === 'deal' ? '[Deal] ' : ''}${c.name} x${c.quantity}${priceStr}`;
    }).join('\n');

    const msg = `🔥 *LYALLPUR BARBQ — NEW ORDER* 🔥

👤 *Name:* ${customerName.trim()}
📞 *Phone:* ${phone.trim()}
🛵 *Order Type:* ${orderType === 'delivery' ? 'Delivery' : 'Takeaway'}${orderType === 'delivery' ? `\n📍 *Address:* ${address.trim()}` : ''}${locationLink.trim() ? `\n🗺️ *Location:* ${locationLink.trim()}` : `\n🗺️ *Location:* Not provided`}

━━━━━━━━━━━━━━━━━
🍖 *ORDER DETAILS:*
━━━━━━━━━━━━━━━━━
${itemLines}

━━━━━━━━━━━━━━━━━
💰 Subtotal: Rs. ${cartTotal.toLocaleString()}
🚚 Delivery: ${deliveryCharge > 0 ? `Rs. ${deliveryCharge}` : 'Free'}
💰 *TOTAL: Rs. ${grandTotal.toLocaleString()}*
━━━━━━━━━━━━━━━━━

📝 *Notes:* ${specialInstructions.trim() || 'None'}

_Order placed via Lyallpur BarBQ website_`;

    window.open(`https://wa.me/923706050759?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleNewOrder = () => {
    setSuccessOrder(null);
    closeCart();
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[1100]"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed top-0 right-0 h-full z-[1200] flex flex-col"
            style={{
              width: 'min(420px, 100vw)',
              background: '#0F0F0F',
              borderLeft: '1px solid rgba(192,57,43,0.3)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between shrink-0" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(192,57,43,0.2)' }}>
              <div className="flex items-center gap-3">
                <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.2rem', fontWeight: 700, color: '#F5F5F0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Your Cart
                </h2>
                {cartCount > 0 && (
                  <span style={{ fontFamily: "'Lora', serif", fontSize: '0.8rem', color: '#888' }}>
                    ({cartCount} item{cartCount !== 1 ? 's' : ''})
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="cursor-pointer flex items-center justify-center"
                style={{ background: 'none', border: 'none', color: '#F5F5F0', width: '36px', height: '36px' }}
                title="Close cart"
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>

              {/* SUCCESS SCREEN */}
              {successOrder ? (
                <div className="flex flex-col items-center justify-center text-center" style={{ padding: '60px 28px', minHeight: '400px' }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="flex items-center justify-center"
                    style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#25D366', marginBottom: '20px' }}
                  >
                    <FiCheck size={36} color="white" />
                  </motion.div>
                  <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '1.5rem', fontWeight: 700, color: '#F5F5F0', marginBottom: '8px' }}>
                    Order Placed!
                  </h2>
                  <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.3rem', color: '#C0392B', letterSpacing: '0.1em', marginBottom: '12px' }}>
                    {successOrder.orderNumber}
                  </p>
                  <p style={{ fontFamily: "'Lora', serif", fontSize: '0.95rem', color: '#C8C8C0', lineHeight: 1.7, marginBottom: '8px' }}>
                    We'll call you on <strong style={{ color: '#E67E22' }}>+92{successOrder.phone}</strong> to confirm
                  </p>
                  <p style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#888', fontStyle: 'italic', marginBottom: '32px' }}>
                    Estimated delivery: 45-60 minutes
                  </p>
                  <button
                    onClick={handleNewOrder}
                    className="cursor-pointer font-bold uppercase transition-all duration-300"
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: '14px',
                      letterSpacing: '0.15em',
                      background: '#C0392B',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50px',
                      padding: '14px 40px',
                    }}
                  >
                    Place New Order
                  </button>
                </div>
              ) : (
                <>
                  {/* CART ITEMS */}
                  <div style={{ padding: '16px 20px' }}>
                    {cart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center" style={{ padding: '48px 20px' }}>
                        <FiShoppingBag size={48} color="#333" style={{ marginBottom: '16px' }} />
                        <p style={{ fontFamily: "'Lora', serif", fontSize: '1rem', color: '#666660', fontStyle: 'italic', marginBottom: '4px' }}>
                          Your cart is empty
                        </p>
                        <p style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#555', marginBottom: '20px' }}>
                          Browse our deals below
                        </p>
                        <button
                          onClick={closeCart}
                          className="cursor-pointer font-bold uppercase"
                          style={{
                            fontFamily: "'Oswald', sans-serif",
                            fontSize: '13px',
                            letterSpacing: '0.1em',
                            background: 'transparent',
                            border: '2px solid #C0392B',
                            color: '#C0392B',
                            borderRadius: '50px',
                            padding: '10px 28px',
                          }}
                        >
                          Browse Menu
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cart.map(item => (
                          <div
                            key={item.id}
                            className="relative"
                            style={{ background: '#141414', borderRadius: '10px', padding: '12px', border: '1px solid rgba(192,57,43,0.15)' }}
                          >
                            <div className="flex gap-3">
                              {/* Thumbnail */}
                              {item.image && (
                                <div className="shrink-0" style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#1A1A1A' }}>
                                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.parentElement.style.display = 'none'; }} />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <p className="font-bold uppercase truncate" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.85rem', color: '#F5F5F0', letterSpacing: '0.05em' }}>
                                    {item.type === 'deal' ? `Deal — ${item.name}` : item.name}
                                  </p>
                                  <button onClick={() => removeFromCart(item.id)} className="cursor-pointer shrink-0 ml-2" style={{ background: 'none', border: 'none', color: '#C0392B', padding: '2px' }} title="Remove">
                                    <FiTrash2 size={14} />
                                  </button>
                                </div>
                                <p style={{ fontFamily: "'Lora', serif", fontSize: '0.78rem', color: '#888', marginTop: '1px' }}>
                                  {item.price > 0 ? `Rs. ${item.price.toLocaleString()} each` : 'Ask for price'}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-0">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="cursor-pointer flex items-center justify-center" style={{ width: '28px', height: '28px', borderRadius: '6px 0 0 6px', background: '#0F0F0F', border: '1px solid rgba(192,57,43,0.3)', color: '#F5F5F0' }}>
                                      <FiMinus size={12} />
                                    </button>
                                    <span className="flex items-center justify-center" style={{ width: '34px', height: '28px', background: '#0F0F0F', borderTop: '1px solid rgba(192,57,43,0.3)', borderBottom: '1px solid rgba(192,57,43,0.3)', fontFamily: "'Oswald', sans-serif", fontSize: '0.85rem', color: '#F5F5F0' }}>
                                      {item.quantity}
                                    </span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="cursor-pointer flex items-center justify-center" style={{ width: '28px', height: '28px', borderRadius: '0 6px 6px 0', background: '#0F0F0F', border: '1px solid rgba(192,57,43,0.3)', color: '#F5F5F0' }}>
                                      <FiPlus size={12} />
                                    </button>
                                  </div>
                                  {item.price > 0 && (
                                    <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#C0392B' }}>
                                      Rs. {(item.price * item.quantity).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <button onClick={clearCart} className="w-full cursor-pointer text-center" style={{ background: 'none', border: 'none', fontFamily: "'Lora', serif", fontSize: '0.8rem', color: '#C0392B', padding: '6px' }}>
                          Clear Cart
                        </button>
                      </div>
                    )}
                  </div>

                  {/* DIVIDER */}
                  {cart.length > 0 && (
                    <>
                      <div style={{ height: '1px', background: 'rgba(192,57,43,0.25)', margin: '4px 20px 0' }} />

                      {/* CHECKOUT FORM */}
                      <div style={{ padding: '18px 20px 0' }}>
                        <p style={{ ...labelStyle, fontSize: '0.8rem', marginBottom: '14px', color: '#D4AC0D', letterSpacing: '0.25em' }}>Your Details</p>

                        {/* Name */}
                        <div style={{ marginBottom: '12px' }}>
                          <label style={labelStyle}>Full Name *</label>
                          <input
                            style={{ ...inputStyle, ...(fieldErrors.customerName ? { borderColor: '#E74C3C' } : {}) }}
                            placeholder="Enter your name"
                            value={customerName}
                            onChange={(e) => { setCustomerName(e.target.value); setFieldErrors(p => ({ ...p, customerName: undefined })); }}
                          />
                          {fieldErrors.customerName && <span style={errorStyle}>{fieldErrors.customerName}</span>}
                        </div>

                        {/* Phone */}
                        <div style={{ marginBottom: '12px' }}>
                          <label style={labelStyle}>Phone Number *</label>
                          <div className="flex">
                            <span style={{ ...inputStyle, width: 'auto', borderRadius: '8px 0 0 8px', borderRight: 'none', color: '#888', padding: '12px 10px', flexShrink: 0, fontSize: '0.85rem' }}>+92</span>
                            <input
                              style={{ ...inputStyle, borderRadius: '0 8px 8px 0', ...(fieldErrors.phone ? { borderColor: '#E74C3C' } : {}) }}
                              placeholder="3XX XXXXXXX"
                              value={phone}
                              onChange={(e) => { setPhone(e.target.value); setFieldErrors(p => ({ ...p, phone: undefined })); }}
                            />
                          </div>
                          {fieldErrors.phone && <span style={errorStyle}>{fieldErrors.phone}</span>}
                        </div>

                        {/* Order Type */}
                        <div style={{ marginBottom: '12px' }}>
                          <label style={labelStyle}>Order Type</label>
                          <div className="flex gap-2">
                            {[{ val: 'delivery', label: 'Delivery' }, { val: 'takeaway', label: 'Takeaway' }].map(opt => {
                              const disabled = opt.val === 'delivery' && !deliveryAvailable;
                              return (
                                <button
                                  key={opt.val}
                                  onClick={() => !disabled && setOrderType(opt.val)}
                                  className="flex-1 cursor-pointer font-bold uppercase transition-all duration-200"
                                  style={{
                                    fontFamily: "'Oswald', sans-serif",
                                    fontSize: '12px',
                                    letterSpacing: '0.1em',
                                    borderRadius: '50px',
                                    padding: '10px 8px',
                                    border: '2px solid #C0392B',
                                    background: orderType === opt.val ? '#C0392B' : 'transparent',
                                    color: orderType === opt.val ? 'white' : '#C0392B',
                                    opacity: disabled ? 0.4 : 1,
                                    cursor: disabled ? 'not-allowed' : 'pointer',
                                  }}
                                  title={disabled ? 'Delivery is currently unavailable' : ''}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Address (delivery only) */}
                        {orderType === 'delivery' && (
                          <>
                            <div style={{ marginBottom: '12px' }}>
                              <label style={labelStyle}>Delivery Address *</label>
                              <textarea
                                rows={2}
                                style={{ ...inputStyle, resize: 'none', ...(fieldErrors.address ? { borderColor: '#E74C3C' } : {}) }}
                                placeholder="House #, Street, Area, City"
                                value={address}
                                onChange={(e) => { setAddress(e.target.value); setFieldErrors(p => ({ ...p, address: undefined })); }}
                              />
                              {fieldErrors.address && <span style={errorStyle}>{fieldErrors.address}</span>}
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                              <label style={labelStyle}>Location Link</label>
                              <input
                                style={inputStyle}
                                placeholder="📍 Paste Google Maps link (optional)"
                                value={locationLink}
                                onChange={(e) => setLocationLink(e.target.value)}
                              />
                              <p style={{ fontFamily: "'Lora', serif", fontSize: '0.7rem', color: '#555', marginTop: '4px' }}>Share your location for accurate delivery</p>
                            </div>
                          </>
                        )}

                        {/* Special Instructions */}
                        <div style={{ marginBottom: '16px' }}>
                          <label style={labelStyle}>Special Instructions</label>
                          <textarea
                            rows={2}
                            style={{ ...inputStyle, resize: 'none' }}
                            placeholder="Extra spicy? Special requests?"
                            value={specialInstructions}
                            onChange={(e) => setSpecialInstructions(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* ORDER SUMMARY + BUTTONS */}
                      <div style={{ padding: '0 20px 20px' }}>
                        {/* Summary */}
                        <div className="space-y-1 mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>
                          <div className="flex justify-between" style={{ fontSize: '0.85rem', color: '#C8C8C0' }}>
                            <span>Subtotal</span>
                            <span>Rs. {cartTotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between" style={{ fontSize: '0.85rem', color: '#C8C8C0' }}>
                            <span>Delivery</span>
                            <span>{deliveryCharge > 0 ? `Rs. ${deliveryCharge}` : 'Free'}</span>
                          </div>
                          <div style={{ height: '1px', background: 'rgba(192,57,43,0.3)', margin: '6px 0' }} />
                          <div className="flex justify-between" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                            <span className="text-white">Total</span>
                            <span style={{ color: '#D4AC0D' }}>Rs. {grandTotal.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                          <button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            className="w-full cursor-pointer font-bold uppercase transition-all duration-300 flex items-center justify-center gap-2"
                            style={{
                              fontFamily: "'Oswald', sans-serif",
                              fontSize: '15px',
                              letterSpacing: '0.15em',
                              background: '#C0392B',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50px',
                              padding: '15px',
                              opacity: loading ? 0.7 : 1,
                            }}
                          >
                            {loading && <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            {loading ? 'Placing...' : 'Place Order'}
                          </button>
                          <button
                            onClick={handleWhatsApp}
                            className="w-full cursor-pointer font-bold uppercase transition-all duration-300 flex items-center justify-center gap-2"
                            style={{
                              fontFamily: "'Oswald', sans-serif",
                              fontSize: '15px',
                              letterSpacing: '0.15em',
                              background: '#25D366',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50px',
                              padding: '15px',
                            }}
                          >
                            <FaWhatsapp size={18} />
                            Order via WhatsApp
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
