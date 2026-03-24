import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import publicApi from '../utils/api';

export default function FloatingWhatsApp() {
  const [waNum, setWaNum] = useState('923706050759');

  useEffect(() => {
    publicApi.get('/settings').then(r => {
      const num = (r.data?.whatsapp || '+923706050759').replace(/[^0-9]/g, '');
      setWaNum(num);
    }).catch(() => {});
  }, []);

  const handleClick = () => {
    const msg = encodeURIComponent("Hi, I want to place an order at Lyallpur BarBQ");
    window.open(`https://wa.me/${waNum}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed z-[1000]" style={{ bottom: '24px', right: '24px' }}>
      {/* Pulse ring */}
      <motion.div
        animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        className="absolute inset-0 rounded-full"
        style={{ background: 'rgba(37,211,102,0.4)' }}
      />
      {/* Button */}
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative cursor-pointer flex items-center justify-center"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#25D366',
          border: 'none',
          color: 'white',
          boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
        }}
        title="Order on WhatsApp"
        aria-label="Order on WhatsApp"
      >
        <FaWhatsapp size={28} />
      </motion.button>
    </div>
  );
}
