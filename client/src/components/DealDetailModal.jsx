import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';

const defaultImage = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80';

export default function DealDetailModal({ deal, isOpen, onClose }) {
  const { addToCart, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!deal) return null;

  const dealItems = Array.isArray(deal.items) ? deal.items : (deal.items || '').split(', ').filter(Boolean);
  const price = typeof deal.price === 'number' ? deal.price : Number(String(deal.price).replace(/,/g, ''));
  const totalPrice = price * quantity;
  const dealName = deal.dealName || deal.name;
  const dealId = deal.dealId || deal.id;
  const image = deal.image || defaultImage;

  const handleAddToCart = () => {
    addToCart({ name: dealName, type: 'deal', dealId, price, quantity, image, items: dealItems });
    toast.success(`${dealName} added to cart!`);
    onClose();
  };

  const handleOrderNow = () => {
    addToCart({ name: dealName, type: 'deal', dealId, price, quantity, image, items: dealItems });
    toast.success(`${dealName} added to cart!`);
    onClose();
    setTimeout(() => openCart(), 150);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[3000]"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[3001] flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full overflow-hidden"
              style={{
                maxWidth: '560px',
                maxHeight: '90vh',
                background: 'var(--bg-card)',
                border: '2px solid var(--border-card)',
                borderRadius: '16px',
                overflowY: 'auto',
              }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 cursor-pointer flex items-center justify-center"
                style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white' }}
                title="Close"
              >
                <FiX size={20} />
              </button>

              {/* Deal Image */}
              <div className="relative" style={{ height: '220px', overflow: 'hidden' }}>
                <img
                  src={image}
                  alt={dealName}
                  className="img-fade"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onLoad={(e) => e.target.classList.add('loaded')}
                  onError={(e) => { e.target.src = defaultImage; }}
                />
                <div className="absolute bottom-0 left-0 w-full" style={{ height: '80px', background: 'linear-gradient(to top, var(--bg-card), transparent)' }} />
              </div>

              {/* Content */}
              <div style={{ padding: '0 28px 0' }}>
                {/* Badge */}
                <div style={{ marginTop: '-8px', marginBottom: '8px' }}>
                  <span style={{
                    display: 'inline-block',
                    background: '#C0392B',
                    color: 'white',
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '4px 14px',
                    borderRadius: '20px',
                  }}>
                    Special Deal {dealId}
                  </span>
                </div>

                {/* Name */}
                <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {dealName}
                </h2>

                {/* Price */}
                <p style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: '2rem', color: '#D4AC0D', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1rem', verticalAlign: 'top', marginRight: '2px' }}>Rs.</span>
                  {price.toLocaleString()}
                </p>

                {/* Divider */}
                <div style={{ height: '1px', background: 'var(--border-card)', marginBottom: '14px' }} />

                {/* Items List */}
                <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '16px' }}>
                  {dealItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3" style={{ padding: '4px 0' }}>
                      <span className="shrink-0 inline-block w-[6px] h-[6px] rounded-full bg-[#C0392B]" />
                      <span style={{ fontFamily: "'Lora', serif", fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Quantity Selector */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.75rem', color: '#D4AC0D', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Quantity
                  </label>
                  <div className="flex items-center gap-0">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="cursor-pointer flex items-center justify-center"
                      style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #C0392B', background: 'transparent', color: '#C0392B' }}
                    >
                      <FiMinus size={16} />
                    </button>
                    <span className="flex items-center justify-center" style={{ width: '56px', height: '40px', fontFamily: "'Oswald', sans-serif", fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => Math.min(10, q + 1))}
                      className="cursor-pointer flex items-center justify-center"
                      style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #C0392B', background: 'transparent', color: '#C0392B' }}
                    >
                      <FiPlus size={16} />
                    </button>
                    <span className="ml-auto" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#D4AC0D' }}>
                      Total: Rs. {totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ padding: '16px 28px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={handleAddToCart}
                  className="w-full cursor-pointer font-bold uppercase transition-all duration-300"
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: '15px',
                    letterSpacing: '0.15em',
                    background: 'transparent',
                    border: '2px solid #C0392B',
                    color: '#C0392B',
                    borderRadius: '50px',
                    padding: '15px',
                  }}
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleOrderNow}
                  className="w-full cursor-pointer font-bold uppercase transition-all duration-300"
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: '15px',
                    letterSpacing: '0.15em',
                    background: '#C0392B',
                    border: '2px solid #C0392B',
                    color: 'white',
                    borderRadius: '50px',
                    padding: '15px',
                  }}
                >
                  Order Now
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
