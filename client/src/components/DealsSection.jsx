import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import publicApi from '../utils/api';
import DealDetailModal from './DealDetailModal';

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.35,
      ease: 'easeOut',
    },
  }),
};

function DealBadge({ number }) {
  return (
    <div className="absolute -top-3 -right-3 z-10">
      <div
        className="relative flex items-center justify-center"
        style={{
          width: '52px',
          height: '52px',
          background: '#C0392B',
          clipPath:
            'polygon(50% 0%, 61% 11%, 75% 3%, 78% 18%, 95% 20%, 87% 35%, 100% 50%, 87% 65%, 95% 80%, 78% 82%, 75% 97%, 61% 89%, 50% 100%, 39% 89%, 25% 97%, 22% 82%, 5% 80%, 13% 65%, 0% 50%, 13% 35%, 5% 20%, 22% 18%, 25% 3%, 39% 11%)',
          animation: 'spin-slow 10s linear infinite',
        }}
      >
        <span
          className="text-white font-bold uppercase text-center leading-tight"
          style={{ fontFamily: "'Oswald', sans-serif", fontSize: '11px' }}
        >
          Deal
          <br />
          {number}
        </span>
      </div>
    </div>
  );
}

function DealCard({ deal, index, onClickDeal }) {
  const dealItems = Array.isArray(deal.items) ? deal.items : (deal.items || '').split(', ').filter(Boolean);
  const displayPrice = typeof deal.price === 'number' ? deal.price.toLocaleString() : deal.price;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className="deal-card relative overflow-visible flex flex-col cursor-pointer"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: '12px',
        padding: '28px',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.35s ease',
      }}
      onClick={() => onClickDeal(deal)}
    >
      <DealBadge number={deal.dealId || deal.id} />

      {/* Deal Name */}
      <h3
        className="font-semibold mt-4"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.6rem',
          color: 'var(--text-primary)',
        }}
      >
        {deal.dealName || deal.name}
      </h3>

      {/* Price */}
      <div className="mt-3 deal-price-wrap">
        <span
          className="deal-price"
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontWeight: 700,
            fontSize: '2.8rem',
            color: '#D4AC0D',
            lineHeight: 1,
          }}
        >
          <span style={{ fontSize: '1.2rem', verticalAlign: 'top', marginRight: '2px' }}>
            Rs.
          </span>
          {displayPrice}
        </span>
      </div>

      {/* Divider */}
      <div
        className="my-4"
        style={{ height: '1px', background: 'var(--border-card)' }}
      />

      {/* Items List */}
      <ul className="space-y-2 mb-4 flex-1" style={{ listStyle: 'none', padding: 0 }}>
        {dealItems.map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-3"
            style={{
              fontFamily: "'Lora', serif",
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}
          >
            <span className="shrink-0 inline-block w-[6px] h-[6px] rounded-full bg-[#C0392B]" />
            {item}
          </li>
        ))}
      </ul>

      {/* View Deal Button */}
      <button
        className="w-full cursor-pointer font-bold uppercase transition-all duration-300 deal-order-btn"
        style={{
          fontFamily: "'Oswald', sans-serif",
          letterSpacing: '0.15em',
          background: 'transparent',
          border: '2px solid #C0392B',
          color: 'var(--text-primary)',
          borderRadius: '50px',
          padding: '16px',
          fontSize: '15px',
          marginTop: '4px',
        }}
      >
        Order This Deal
      </button>
    </motion.div>
  );
}

export default function DealsSection() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState(null);

  useEffect(() => {
    publicApi.get('/deals')
      .then(res => {
        const active = res.data.filter(d => d.isActive !== false);
        setDeals(active);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section id="deals" className="relative" style={{ background: 'var(--bg-page)' }}>
      {/* Section content */}
      <div className="max-w-7xl mx-auto" style={{ padding: '100px clamp(24px, 5vw, 60px)' }}>
        {/* Section Header */}
        <div className="text-center mb-16">
          <p
            className="uppercase mb-3"
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: '12px',
              color: '#D4AC0D',
              letterSpacing: '0.4em',
            }}
          >
            Signature
          </p>
          <h2
            className="mb-4"
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            Special Thaals
          </h2>
          <p
            className="italic mb-6"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.2rem',
              color: '#D4AC0D',
            }}
          >
            A feast crafted for every appetite
          </p>
          {/* Decorative line */}
          <div className="mx-auto" style={{ width: '60px', height: '2px', background: '#C0392B' }} />
        </div>

        {/* Skeleton Loading */}
        {loading && (
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
              gap: '28px',
            }}
          >
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '14px', overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: '220px', borderRadius: 0 }} />
                <div style={{ padding: '28px' }}>
                  <div className="skeleton" style={{ height: '22px', width: '70%', marginBottom: '12px' }} />
                  <div className="skeleton" style={{ height: '14px', width: '90%', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ height: '14px', width: '60%', marginBottom: '16px' }} />
                  <div className="skeleton" style={{ height: '28px', width: '40%', marginBottom: '16px' }} />
                  <div className="skeleton" style={{ height: '44px', borderRadius: '50px' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cards Grid */}
        {!loading && deals.length > 0 && (
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
              gap: '28px',
              alignItems: 'stretch',
            }}
          >
            {deals.map((deal, i) => (
              <DealCard key={deal._id || deal.dealId} deal={deal} index={i} onClickDeal={setSelectedDeal} />
            ))}
          </div>
        )}
      </div>

      <DealDetailModal
        deal={selectedDeal}
        isOpen={!!selectedDeal}
        onClose={() => setSelectedDeal(null)}
      />
    </section>
  );
}
