import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { FiUsers, FiStar, FiGrid, FiClock } from 'react-icons/fi';

const stats = [
  { icon: <FiUsers size={32} color="#E67E22" />, value: 500, suffix: '+', label: 'Happy Customers Daily', decimals: 0 },
  { icon: <FiStar size={32} color="#D4AC0D" />, value: 4.9, suffix: '', label: 'Average Rating', decimals: 1 },
  { icon: <FiGrid size={32} color="#E67E22" />, value: 15, suffix: '+', label: 'Signature Items', decimals: 0 },
  { icon: <FiClock size={32} color="#D4AC0D" />, value: 2018, suffix: '', label: 'Est. Since', decimals: 0 },
];

function useCountUp(target, decimals, shouldStart, duration = 2000) {
  const [count, setCount] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!shouldStart || hasRun.current) return;
    hasRun.current = true;

    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOut curve
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setCount(current);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [shouldStart, target, duration]);

  return decimals > 0 ? count.toFixed(decimals) : Math.floor(count);
}

const statVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.5, ease: 'easeOut' },
  }),
};

function StatCard({ stat, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const displayValue = useCountUp(stat.value, stat.decimals, isInView);

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={statVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className="stat-card flex flex-col items-center text-center px-4 py-6"
    >
      <div className="flex items-center justify-center" style={{ lineHeight: 1, marginBottom: '4px' }}>{stat.icon}</div>
      <p
        className="stat-number mt-3"
        style={{
          fontFamily: "'Oswald', sans-serif",
          fontWeight: 700,
          fontSize: '3.5rem',
          color: '#D4AC0D',
          lineHeight: 1,
          transition: 'text-shadow 0.3s ease',
        }}
      >
        {displayValue}{stat.suffix}
      </p>
      <p
        className="mt-2"
        style={{
          fontFamily: "'Lora', serif",
          fontSize: '0.95rem',
          color: 'var(--text-secondary)'
        }}
      >
        {stat.label}
      </p>
    </motion.div>
  );
}

export default function StatsBanner() {
  return (
    <section
      className="w-full"
      style={{
        background: 'linear-gradient(135deg, #1A0505, #0F0F0F, #1A0505)',
        borderTop: '1px solid var(--primary)',
        borderBottom: '1px solid var(--primary)',
        padding: '80px clamp(24px, 5vw, 60px)',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>
    </section>
  );
}
