import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';

export default function MenuItemModal({ item, isOpen, onClose }) {
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

  if (!item) return null;

  const price = item.price || 0;
  const totalPrice = price * quantity;
  const hasImage = !!item.image;

  const handleAddToCart = () => {
    addToCart({ name: item.name, type: 'item', price, quantity, image: item.image || '' });
    toast.success(`${item.name} added to cart!`);
    onClose();
  };

  const handleOrderNow = () => {
    addToCart({ name: item.name, type: 'item', price, quantity, image: item.image || '' });
    toast.success(`${item.name} added to cart!`);
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
                maxWidth: '460px',
                background: '#141414',
                border: '2px solid rgba(192,57,43,0.4)',
                borderRadius: '16px',
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

              {/* Image (if available) */}
              {hasImage && (
                <div className="relative" style={{ height: '180px', overflow: 'hidden' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="img-fade"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onLoad={(e) => e.target.classList.add('loaded')}
                    onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                  />
                  <div className="absolute bottom-0 left-0 w-full" style={{ height: '60px', background: 'linear-gradient(to top, #141414, transparent)' }} />
                </div>
              )}

              {/* Content */}
              <div style={{ padding: hasImage ? '0 28px 0' : '28px 28px 0' }}>
                {/* Name */}
                <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#F5F5F0', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {item.name}
                </h2>

                {/* Category */}
                {item.category && (
                  <p style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#888', fontStyle: 'italic', marginBottom: '8px' }}>{item.category}</p>
                )}

                {/* Price */}
                <p style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: '1.6rem', color: '#D4AC0D', marginBottom: '16px' }}>
                  {price > 0 ? <>
                    <span style={{ fontSize: '0.9rem', verticalAlign: 'top', marginRight: '2px' }}>Rs.</span>
                    {price.toLocaleString()}
                  </> : 'Ask for price'}
                </p>

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(192,57,43,0.3)', marginBottom: '16px' }} />

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
                    <span className="flex items-center justify-center" style={{ width: '56px', height: '40px', fontFamily: "'Oswald', sans-serif", fontSize: '1.2rem', fontWeight: 700, color: '#F5F5F0' }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => Math.min(10, q + 1))}
                      className="cursor-pointer flex items-center justify-center"
                      style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #C0392B', background: 'transparent', color: '#C0392B' }}
                    >
                      <FiPlus size={16} />
                    </button>
                    {price > 0 && (
                      <span className="ml-auto" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#D4AC0D' }}>
                        Total: Rs. {totalPrice.toLocaleString()}
                      </span>
                    )}
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
