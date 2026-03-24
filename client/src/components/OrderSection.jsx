import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import publicApi from '../utils/api';
import toast from 'react-hot-toast';
import { FiPhone, FiMapPin, FiClock, FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const inputStyle = {
  background: 'var(--bg-input)',
  border: '1px solid var(--border-input)',
  borderRadius: '8px',
  padding: '14px 16px',
  color: 'var(--text-primary)',
  fontFamily: "'Lora', serif",
  fontSize: '0.95rem',
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.3s, box-shadow 0.3s',
};

const labelStyle = {
  fontFamily: "'Oswald', sans-serif",
  fontSize: '0.8rem',
  letterSpacing: '0.1em',
  color: '#D4AC0D',
  textTransform: 'uppercase',
  marginBottom: '8px',
  display: 'block',
};

const errorMsgStyle = {
  fontFamily: "'Lora', serif",
  fontSize: '0.78rem',
  color: '#E74C3C',
  marginTop: '6px',
  display: 'block',
};

function InputField({ label, error, ...props }) {
  return (
    <div className="mb-6">
      <label style={labelStyle}>{label}</label>
      <input
        style={{ ...inputStyle, ...(error ? { borderColor: '#E74C3C' } : {}) }}
        className="order-input"
        {...props}
      />
      {error && <span style={errorMsgStyle}>{error}</span>}
    </div>
  );
}

function TextareaField({ label, error, ...props }) {
  return (
    <div className="mb-6">
      <label style={labelStyle}>{label}</label>
      <textarea
        style={{ ...inputStyle, resize: 'vertical', ...(error ? { borderColor: '#E74C3C' } : {}) }}
        className="order-input"
        {...props}
      />
      {error && <span style={errorMsgStyle}>{error}</span>}
    </div>
  );
}

export default function OrderSection() {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [orderType, setOrderType] = useState('delivery');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [successOrder, setSuccessOrder] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);

  useEffect(() => {
    publicApi.get('/settings').then(r => setSiteSettings(r.data)).catch(() => {});
  }, []);

  const hasItems = cart.length > 0;
  const deliveryCharge = hasItems && orderType === 'delivery' ? 100 : 0;
  const totalPrice = cartTotal + deliveryCharge;

  const validate = () => {
    const errors = {};
    if (!customerName.trim() || customerName.trim().length < 2) errors.customerName = 'Name must be at least 2 characters';
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length < 10) errors.phone = 'Phone must be at least 10 digits';
    if (orderType === 'delivery' && !address.trim()) errors.address = 'Delivery address is required';
    if (!hasItems) errors.items = 'Please add items to your cart first';
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
    setAddress('');
    setCity('');
    setOrderType('delivery');
    setSpecialInstructions('');
    setFieldErrors({});
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
        city: city.trim(),
        orderType,
        selectedDeal: deals.length > 0 ? { dealId: deals[0].dealId, dealName: deals[0].name, price: deals[0].price } : null,
        individualItems: items.map(c => ({ name: c.name, quantity: c.quantity, price: c.price })),
        specialInstructions: specialInstructions.trim(),
        subtotal: cartTotal,
      };
      const { data } = await publicApi.post('/orders', body);
      setSuccessOrder({ orderNumber: data.orderNumber, phone: phone.trim() });
      resetForm();
      clearCart();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (!validate()) return;
    const orderDetails = cart.map(c => {
      const priceStr = c.price > 0 ? ` — Rs. ${(c.price * c.quantity).toLocaleString()}` : '';
      return `   ▸ ${c.type === 'deal' ? '[Deal] ' : ''}${c.name} × ${c.quantity}${priceStr}`;
    }).join('\n');

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });

    const msg = `━━━━━━━━━━━━━━━━━━━━
  🔥 *LYALLPUR BARBQ* 🔥
  _Premium BBQ — Faisalabad_
━━━━━━━━━━━━━━━━━━━━

📋 *NEW ORDER*
📅 ${dateStr}  ⏰ ${timeStr}

──────────────────
👤 *Customer Details*
──────────────────
   Name: ${customerName.trim()}
   Phone: ${phone.trim()}
   Type: ${orderType === 'delivery' ? '🛵 Delivery' : '🏪 Takeaway'}${orderType === 'delivery' ? `\n   Address: ${address.trim()}${city.trim() ? `, ${city.trim()}` : ''}` : ''}

──────────────────
🍖 *Order Details*
──────────────────
${orderDetails}
${specialInstructions.trim() ? `\n📝 *Special Instructions:*\n   ${specialInstructions.trim()}` : ''}

━━━━━━━━━━━━━━━━━━━━
💰 *PAYMENT SUMMARY*
━━━━━━━━━━━━━━━━━━━━
   Subtotal:     Rs. ${cartTotal.toLocaleString()}
   Delivery:     ${deliveryCharge > 0 ? `Rs. ${deliveryCharge}` : 'FREE'}
   ─────────────
   *TOTAL:       Rs. ${totalPrice.toLocaleString()}*
━━━━━━━━━━━━━━━━━━━━

_🌐 Ordered via lyallpurbarbq.com_`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/923706050759?text=${encoded}`, '_blank');
  };

  if (successOrder) {
    return (
      <section id="order" style={{ background: 'var(--bg-page)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '100px clamp(24px, 5vw, 60px)', textAlign: 'center' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '16px', padding: 'clamp(32px, 6vw, 60px)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔥</div>
            <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Order Placed!
            </h2>
            <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.5rem', color: '#D4AC0D', letterSpacing: '0.1em', marginBottom: '16px' }}>
              {successOrder.orderNumber}
            </p>
            <p style={{ fontFamily: "'Lora', serif", fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '32px' }}>
              We'll contact you on <strong style={{ color: '#E67E22' }}>{successOrder.phone}</strong> to confirm your order.
            </p>
            <button
              onClick={() => setSuccessOrder(null)}
              className="cursor-pointer font-bold uppercase transition-all duration-300"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '16px',
                letterSpacing: '0.15em',
                background: '#E67E22',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                padding: '16px 40px',
                width: '100%',
                maxWidth: '300px',
              }}
            >
              Place New Order
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="order" style={{ background: 'var(--bg-page)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '100px clamp(24px, 5vw, 60px)' }}>
        {/* Header */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '12px', color: '#D4AC0D', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Ready to Eat?
          </p>
          <h2 className="mb-4" style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 700, color: 'var(--text-primary)' }}>
            Place Your Order
          </h2>
          <p className="italic" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: '#D4AC0D' }}>
            Hot, fresh BBQ delivered to your door
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
          {/* LEFT — Form */}
          <div className="w-full lg:w-[55%]">
            {/* Step 1 — Details */}
            <div className="mb-8">
              <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px', borderLeft: '3px solid #C0392B', paddingLeft: '12px' }}>
                Your Details
              </h3>
              <InputField label="Full Name" placeholder="Enter your name" value={customerName} onChange={(e) => { setCustomerName(e.target.value); setFieldErrors(prev => ({ ...prev, customerName: undefined })); }} error={fieldErrors.customerName} />
              <div className="mb-4">
                <label style={labelStyle}>Phone Number</label>
                <div className="flex">
                  <span style={{ ...inputStyle, width: 'auto', borderRadius: '8px 0 0 8px', borderRight: 'none', color: '#888', padding: '14px 12px', flexShrink: 0 }}>+92</span>
                  <input style={{ ...inputStyle, borderRadius: '0 8px 8px 0', ...(fieldErrors.phone ? { borderColor: '#E74C3C' } : {}) }} className="order-input" placeholder="3XX XXXXXXX" value={phone} onChange={(e) => { setPhone(e.target.value); setFieldErrors(prev => ({ ...prev, phone: undefined })); }} />
                </div>
                {fieldErrors.phone && <span style={errorMsgStyle}>{fieldErrors.phone}</span>}
              </div>

              {/* Order Type Toggle */}
              <div className="mb-4">
                <label style={labelStyle}>Order Type</label>
                <div className="flex gap-3">
                  {[{ val: 'delivery', label: 'Delivery' }, { val: 'takeaway', label: 'Takeaway' }].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setOrderType(opt.val)}
                      className="flex-1 cursor-pointer font-bold uppercase transition-all duration-300"
                      style={{
                        fontFamily: "'Oswald', sans-serif",
                        fontSize: '14px',
                        letterSpacing: '0.1em',
                        borderRadius: '50px',
                        padding: '12px',
                        border: '2px solid #C0392B',
                        background: orderType === opt.val ? '#C0392B' : 'transparent',
                        color: orderType === opt.val ? 'white' : '#C0392B',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {orderType === 'delivery' && (
                  <p style={{ fontFamily: "'Lora', serif", fontSize: '0.8rem', color: '#E67E22', marginTop: '8px' }}>
                    Delivery charge: Rs. 100
                  </p>
                )}
              </div>

              {orderType === 'delivery' && (
                <>
                  <TextareaField label="Delivery Address" rows={3} placeholder="House #, Street, Area" value={address} onChange={(e) => { setAddress(e.target.value); setFieldErrors(prev => ({ ...prev, address: undefined })); }} error={fieldErrors.address} />
                  <InputField label="City" placeholder="Faisalabad" value={city} onChange={(e) => setCity(e.target.value)} />
                </>
              )}
            </div>

            {/* Step 2 — Cart Items */}
            <div className="mb-8" style={{ marginTop: '28px' }}>
              <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px', borderLeft: '3px solid #C0392B', paddingLeft: '12px' }}>
                Your Cart Items
              </h3>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8" style={{ background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <FiShoppingBag size={36} color="#333" style={{ marginBottom: '12px' }} />
                  <p style={{ fontFamily: "'Lora', serif", fontSize: '0.95rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Your cart is empty — browse our menu or deals above
                  </p>
                  {fieldErrors.items && <span style={errorMsgStyle}>{fieldErrors.items}</span>}
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3"
                      style={{ background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border-card)', transition: 'all 0.3s' }}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-bold uppercase truncate block" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.85rem', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
                          {item.type === 'deal' ? `Deal — ${item.name}` : item.name}
                        </span>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.82rem', color: '#D4AC0D' }}>
                          {item.price > 0 ? `Rs. ${item.price.toLocaleString()} each` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="cursor-pointer flex items-center justify-center" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #C0392B', background: 'transparent', color: '#C0392B' }} title="Decrease">
                          <FiMinus size={14} />
                        </button>
                        <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1rem', color: 'var(--text-primary)', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="cursor-pointer flex items-center justify-center" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #E67E22', background: '#E67E22', color: 'white' }} title="Increase">
                          <FiPlus size={14} />
                        </button>
                        <button onClick={() => removeFromCart(item.id)} className="cursor-pointer flex items-center justify-center ml-1" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid rgba(192,57,43,0.3)', background: 'transparent', color: '#C0392B' }} title="Remove">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Special Instructions */}
            <div className="mb-8" style={{ marginTop: '28px' }}>
              <TextareaField label="Special Instructions" rows={3} placeholder="Any special requests? Extra spicy? Less oil?" value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col gap-4" style={{ marginTop: '8px' }}>
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full cursor-pointer font-bold uppercase transition-all duration-300 flex items-center justify-center gap-2"
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: '16px',
                  letterSpacing: '0.15em',
                  background: '#E67E22',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '18px',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
              <button
                onClick={handleWhatsApp}
                className="w-full cursor-pointer font-bold uppercase transition-all duration-300 flex items-center justify-center gap-2"
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: '16px',
                  letterSpacing: '0.15em',
                  background: '#25D366',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '18px',
                }}
              >
                Order via WhatsApp
              </button>
            </div>
          </div>

          {/* RIGHT — Order Summary */}
          <div className="w-full lg:w-[45%]">
            <div className="lg:sticky lg:top-24" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '32px' }}>
              <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.2rem', color: 'var(--text-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
                Your Order
              </h3>

              {/* Items */}
              <div className="space-y-2">
                {!hasItems && (
                  <div className="flex flex-col items-center justify-center py-4">
                    <FiShoppingBag size={24} color="#333" style={{ marginBottom: '8px' }} />
                    <p style={{ fontFamily: "'Lora', serif", fontSize: '0.9rem', color: '#666660', fontStyle: 'italic' }}>No items in cart yet</p>
                  </div>
                )}
                {cart.map(c => (
                  <div key={c.id} className="flex justify-between" style={{ fontFamily: "'Lora', serif", fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span>{c.type === 'deal' ? '[Deal] ' : ''}{c.name} × {c.quantity}</span>
                    <span style={{ color: c.price > 0 ? '#D4AC0D' : '#666660', fontSize: '0.85rem' }}>{c.price > 0 ? `Rs. ${(c.price * c.quantity).toLocaleString()}` : 'Ask price'}</span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'rgba(192,57,43,0.3)', margin: '16px 0' }} />

              {/* Totals */}
              <div className="space-y-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
                <div className="flex justify-between" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <span>Subtotal</span>
                  <span>Rs. {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <span>Delivery</span>
                  <span>{deliveryCharge > 0 ? `Rs. ${deliveryCharge}` : 'Free'}</span>
                </div>
                <div style={{ height: '1px', background: 'var(--border-card)', margin: '12px 0' }} />
                <div className="flex justify-between" style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                  <span style={{ color: 'var(--text-primary)' }}>Grand Total</span>
                  <span style={{ color: '#D4AC0D' }}>Rs. {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Restaurant Info */}
              <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(192,57,43,0.2)' }}>
                <div className="space-y-3" style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <p className="flex items-center gap-2"><FiPhone size={16} color="#E67E22" style={{ marginRight: '8px', flexShrink: 0 }} /> {siteSettings?.phone || '0300-0000000'}</p>
                  <p className="flex items-center gap-2"><FiMapPin size={16} color="#E67E22" style={{ marginRight: '8px', flexShrink: 0 }} /> {siteSettings?.address || 'Faisalabad, Pakistan'}</p>
                  <p className="flex items-center gap-2"><FiClock size={16} color="#E67E22" style={{ marginRight: '8px', flexShrink: 0 }} /> {siteSettings?.openingHours || 'Open Daily: 12 PM - 12 AM'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
