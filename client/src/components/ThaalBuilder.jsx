import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShoppingCart, FiPlus, FiMinus } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const MAX_ITEMS = 8;

function getPlatePositions(count) {
  if (count === 0) return [];
  if (count === 1) return [{ x: 0, y: 0 }];
  const radius = count <= 3 ? 30 : count <= 6 ? 36 : 40;
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  });
}

export default function ThaalBuilder({ menuItems = [], isOpen, onClose }) {
  const [selected, setSelected] = useState([]);
  const { addToCart } = useCart();

  const toggleItem = useCallback((item) => {
    setSelected(prev => {
      const exists = prev.find(s => (s._id || s.name) === (item._id || item.name));
      if (exists) return prev.filter(s => (s._id || s.name) !== (item._id || item.name));
      if (prev.length >= MAX_ITEMS) return prev;
      return [...prev, item];
    });
  }, []);

  const handleAddToCart = () => {
    selected.forEach(item => addToCart(item));
    setSelected([]);
    onClose();
  };

  const positions = getPlatePositions(selected.length);
  const totalPrice = selected.reduce((sum, i) => sum + (i.price || 0), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="thaal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 50000,
            background: 'rgba(4,4,4,0.96)',
            backdropFilter: 'blur(8px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center',
            overflowY: 'auto',
          }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              width: '100%', maxWidth: '860px',
              padding: 'clamp(20px, 4vw, 40px)',
              paddingBottom: '160px',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '0.4em', color: '#D4AC0D', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Interactive Experience
                </p>
                <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', color: '#F5F5F0', margin: 0 }}>
                  Build Your Thaal
                </h2>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5F5F0', cursor: 'pointer' }}>
                <FiX size={18} />
              </button>
            </div>
            <p style={{ fontFamily: "'Lora', serif", fontSize: '0.9rem', color: '#888880', fontStyle: 'italic', marginBottom: '32px' }}>
              Pick up to {MAX_ITEMS} items — tap to place on your thaal
            </p>

            {/* Plate */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
              <div style={{ position: 'relative', width: 'clamp(250px, 72vw, 310px)', height: 'clamp(250px, 72vw, 310px)' }}>
                {/* Outer glow ring */}
                <motion.div
                  animate={{ boxShadow: selected.length > 0 ? '0 0 40px rgba(192,57,43,0.35), 0 0 80px rgba(192,57,43,0.15)' : '0 0 20px rgba(192,57,43,0.1)' }}
                  transition={{ duration: 0.5 }}
                  style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    border: '2px solid rgba(192,57,43,0.25)',
                  }}
                />
                {/* Plate surface */}
                <div style={{
                  position: 'absolute', inset: '8px', borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #2a2a2a 0%, #111 60%, #0a0a0a 100%)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.6)',
                }}>
                  {/* Inner rim */}
                  <div style={{ position: 'absolute', inset: '10px', borderRadius: '50%', border: '1px solid rgba(212,172,13,0.15)' }} />

                  {/* Empty state */}
                  <AnimatePresence>
                    {selected.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <FaFire size={28} color="rgba(192,57,43,0.3)" />
                        <p style={{ fontFamily: "'Lora', serif", fontSize: '0.78rem', color: 'rgba(245,245,240,0.25)', fontStyle: 'italic', textAlign: 'center', padding: '0 20px' }}>
                          Your thaal awaits
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Placed items */}
                  <AnimatePresence>
                    {selected.map((item, i) => {
                      const pos = positions[i] || { x: 0, y: 0 };
                      return (
                        <motion.button
                          key={item._id || item.name}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1, x: '-50%', y: '-50%' }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          onClick={() => toggleItem(item)}
                          title={`Remove ${item.name}`}
                          style={{
                            position: 'absolute',
                            left: `calc(50% + ${pos.x}%)`,
                            top: `calc(50% + ${pos.y}%)`,
                            width: 'clamp(46px, 13vw, 60px)',
                            height: 'clamp(46px, 13vw, 60px)',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '2px solid rgba(192,57,43,0.7)',
                            background: '#1a1a1a',
                            cursor: 'pointer',
                            padding: 0,
                            boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
                          }}
                        >
                          {item.image ? (
                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '1.2rem' }}>🔥</span>
                          )}
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Item count badge */}
                <motion.div
                  animate={{ scale: selected.length > 0 ? 1 : 0 }}
                  style={{
                    position: 'absolute', top: '4px', right: '4px',
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: '#C0392B',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Oswald', sans-serif", fontSize: '13px', fontWeight: 700, color: 'white',
                    boxShadow: '0 2px 8px rgba(192,57,43,0.5)',
                  }}
                >
                  {selected.length}
                </motion.div>
              </div>
            </div>

            {/* Items Grid */}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '0.35em', color: '#D4AC0D', textTransform: 'uppercase', marginBottom: '16px' }}>
                Available Items
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(80px, 26vw, 130px), 1fr))', gap: '10px' }}>
                {menuItems.map((item) => {
                  const isSelected = selected.some(s => (s._id || s.name) === (item._id || item.name));
                  const isFull = selected.length >= MAX_ITEMS && !isSelected;
                  return (
                    <motion.button
                      key={item._id || item.name}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => !isFull && toggleItem(item)}
                      style={{
                        background: isSelected ? 'rgba(192,57,43,0.15)' : '#141414',
                        border: `1.5px solid ${isSelected ? '#C0392B' : 'rgba(192,57,43,0.18)'}`,
                        borderRadius: '10px', overflow: 'hidden',
                        cursor: isFull ? 'not-allowed' : 'pointer',
                        opacity: isFull ? 0.4 : 1,
                        padding: 0,
                        transition: 'border-color 0.2s, background 0.2s',
                        position: 'relative',
                      }}
                    >
                      <div style={{ height: 'clamp(60px, 12vw, 90px)', overflow: 'hidden', background: '#1a1a1a' }}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🔥</div>
                        )}
                      </div>
                      <div style={{ padding: '8px 6px 10px' }}>
                        <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(10px, 2.5vw, 12px)', letterSpacing: '0.04em', color: '#F5F5F0', textTransform: 'uppercase', margin: 0, lineHeight: 1.2 }}>
                          {item.name}
                        </p>
                        {item.price > 0 && (
                          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(10px, 2vw, 12px)', color: '#D4AC0D', margin: '3px 0 0', fontStyle: 'italic' }}>
                            Rs. {item.price.toLocaleString()}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '5px', right: '5px', width: '18px', height: '18px', borderRadius: '50%', background: '#C0392B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiMinus size={10} color="white" />
                        </div>
                      )}
                      {!isSelected && !isFull && (
                        <div style={{ position: 'absolute', top: '5px', right: '5px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(192,57,43,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiPlus size={10} color="white" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Sticky Bottom Bar */}
          <AnimatePresence>
            {selected.length > 0 && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                style={{
                  position: 'fixed', bottom: 0, left: 0, right: 0,
                  background: '#0f0f0f',
                  borderTop: '1px solid rgba(192,57,43,0.3)',
                  padding: 'clamp(10px, 3vw, 20px) clamp(14px, 4vw, 40px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: '10px', zIndex: 50001,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div>
                  <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '12px', color: '#888880', letterSpacing: '0.1em', margin: 0 }}>
                    {selected.length} item{selected.length !== 1 ? 's' : ''} on thaal
                  </p>
                  {totalPrice > 0 && (
                    <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '1.1rem', color: '#D4AC0D', margin: '2px 0 0' }}>
                      Rs. {totalPrice.toLocaleString()}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => setSelected([])}
                    style={{ background: 'none', border: '1px solid rgba(192,57,43,0.4)', borderRadius: '50px', padding: '10px 18px', color: '#F5F5F0', fontFamily: "'Oswald', sans-serif", fontSize: '13px', letterSpacing: '0.08em', cursor: 'pointer' }}
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleAddToCart}
                    style={{ background: '#C0392B', border: 'none', borderRadius: '50px', padding: '12px 24px', color: 'white', fontFamily: "'Oswald', sans-serif", fontSize: '14px', letterSpacing: '0.12em', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(192,57,43,0.4)' }}
                  >
                    <FiShoppingCart size={16} />
                    Add Thaal to Cart
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
