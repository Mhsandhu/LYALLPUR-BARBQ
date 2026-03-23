import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import MenuItemModal from './MenuItemModal';

const fallbackItems = [
  { name: 'Leg Piece', image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=400&q=80', category: 'Chicken', price: 0 },
  { name: 'Chest Piece', image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c8?w=400&q=80', category: 'Chicken', price: 0 },
  { name: 'Malai Chest Piece', image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&q=80', category: 'Chicken', price: 0 },
  { name: 'Malai Leg Piece', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', category: 'Chicken', price: 0 },
  { name: 'Chicken Wings', image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80', category: 'Chicken', price: 0 },
  { name: 'Malai Wings', image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400&q=80', category: 'Chicken', price: 0 },
  { name: 'Tandoori Wings', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80', category: 'Chicken', price: 0 },
  { name: 'Candy Boti', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80', category: 'Chicken', price: 0 },
  { name: 'Tikka Boti', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80', category: 'Chicken', price: 0 },
  { name: 'Malai Boti', image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&q=80', category: 'Chicken', price: 0 },
  { name: 'Chicken Kebab', image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&q=80', category: 'Chicken', price: 0 },
  { name: 'Full Plate Rice', image: 'https://images.unsplash.com/photo-1536304993881-ff86e0c9e193?w=400&q=80', category: 'Rice & Bread', price: 0 },
  { name: 'Half Plate Rice', image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&q=80', category: 'Rice & Bread', price: 0 },
  { name: 'Naan', image: 'https://images.unsplash.com/photo-1600628421055-4d30de868b8f?w=400&q=80', category: 'Rice & Bread', price: 0 },
  { name: 'Roti', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80', category: 'Rice & Bread', price: 0 },
  { name: 'Rogni Naan', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80', category: 'Rice & Bread', price: 0 },
  { name: 'Imli Sauce', image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400&q=80', category: 'Extras', price: 0 },
  { name: 'Raita', image: 'https://images.unsplash.com/photo-1571167530149-c1105da4a2b1?w=400&q=80', category: 'Extras', price: 0 },
  { name: 'Salad', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', category: 'Extras', price: 0 },
];

const tabs = ['All', 'Chicken', 'Rice & Bread', 'Extras'];

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' },
  }),
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

function MenuCard({ item, index, onClickItem }) {
  const imgSrc = item.image || '';
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      exit="exit"
      viewport={{ once: true, margin: '-30px' }}
      className="menu-item-card cursor-pointer"
      style={{
        background: '#141414',
        border: '1px solid rgba(192,57,43,0.2)',
        borderRadius: '10px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
      onClick={() => onClickItem(item)}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: '160px', background: '#1A1A1A' }}>
        <img
          src={imgSrc}
          alt={item.name}
          loading="lazy"
          className="menu-card-img img-fade"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.4s ease, opacity 0.4s ease',
          }}
          onLoad={(e) => e.target.classList.add('loaded')}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.style.background = '#1A1A1A';
            e.target.parentElement.innerHTML = '<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:2rem">🔥</span>';
          }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute bottom-0 left-0 w-full pointer-events-none"
          style={{
            height: '50%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
          }}
        />
      </div>

      {/* Card Body */}
      <div className="text-center" style={{ padding: '18px 16px 20px' }}>
        <h4
          className="text-white font-bold uppercase"
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: '0.95rem',
            letterSpacing: '0.05em',
          }}
        >
          {item.name}
        </h4>
        <p
          className="italic mt-1"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '0.85rem',
            color: '#D4AC0D',
          }}
        >
          {item.price > 0 ? `Rs. ${item.price.toLocaleString()}` : 'Ask for price'}
        </p>
        <button
          className="w-full mt-4 cursor-pointer font-bold uppercase menu-add-btn"
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: '13px',
            letterSpacing: '0.1em',
            background: 'transparent',
            border: '2px solid #C0392B',
            color: '#F5F5F0',
            borderRadius: '50px',
            padding: '10px 8px',
            transition: 'all 0.3s ease',
          }}
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
}

export default function MenuSection() {
  const [activeTab, setActiveTab] = useState('All');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    axios.get('/api/menu')
      .then(res => {
        const available = res.data.filter(item => item.isAvailable !== false);
        if (available.length > 0) {
          // Merge: use DB data but fill missing images from fallback
          const fallbackMap = {};
          fallbackItems.forEach(f => { fallbackMap[f.name] = f.image; });
          const merged = available.map(item => ({
            ...item,
            image: item.image || fallbackMap[item.name] || '',
          }));
          setMenuItems(merged);
        } else {
          setMenuItems(fallbackItems);
        }
        setLoading(false);
      })
      .catch(() => {
        setMenuItems(fallbackItems);
        setLoading(false);
      });
  }, []);

  const filtered =
    activeTab === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === activeTab);

  return (
    <section id="menu" style={{ background: '#0A0A0A' }}>
      <div className="max-w-7xl mx-auto" style={{ padding: '100px clamp(24px, 5vw, 60px)' }}>
        {/* Section Header */}
        <div className="text-center" style={{ marginBottom: '32px' }}>
          <p
            className="uppercase mb-3"
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: '12px',
              color: '#D4AC0D',
              letterSpacing: '0.4em',
            }}
          >
            À La Carte
          </p>
          <h2
            className="text-white mb-4"
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontWeight: 700,
            }}
          >
            Individual Items
          </h2>
          <p
            className="italic"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.1rem',
              color: '#D4AC0D',
            }}
          >
            Mix and match — your order, your way
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4" style={{ marginBottom: '40px' }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="cursor-pointer font-bold uppercase transition-all duration-300"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                letterSpacing: '0.1em',
                borderRadius: '50px',
                padding: '10px 20px',
                border: '2px solid #C0392B',
                background: activeTab === tab ? '#C0392B' : 'transparent',
                color: activeTab === tab ? 'white' : '#C0392B',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Skeleton Loading */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: '24px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} style={{ background: '#141414', border: '1px solid rgba(192,57,43,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: '160px', borderRadius: 0 }} />
                <div className="text-center" style={{ padding: '18px 16px 20px' }}>
                  <div className="skeleton mx-auto" style={{ height: '16px', width: '70%', marginBottom: '10px' }} />
                  <div className="skeleton mx-auto" style={{ height: '14px', width: '40%', marginBottom: '16px' }} />
                  <div className="skeleton mx-auto" style={{ height: '40px', borderRadius: '50px' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Items Grid */}
        {!loading && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              style={{ gap: '24px', padding: '0' }}
            >
              {filtered.map((item, i) => (
                <MenuCard key={item.name || item._id} item={item} index={i} onClickItem={setSelectedItem} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <MenuItemModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </section>
  );
}
