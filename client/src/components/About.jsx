import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiAward, FiUser } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import publicApi from '../utils/api';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const features = [
  { icon: <FaFire size={24} />, title: 'Open Flame', text: 'Every piece grilled over live coal' },
  { icon: <FiStar size={24} />, title: 'Fresh Daily', text: 'Ingredients sourced fresh every morning' },
  { icon: <FiAward size={24} />, title: 'Since 2018', text: 'Years of authentic BBQ excellence' },
];

function OwnerCard({ name, photo }) {
  const [imgError, setImgError] = useState(false);
  const hasPhoto = photo && !imgError;
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="flex flex-col items-center text-center"
    >
      <div
        className="flex items-center justify-center overflow-hidden"
        style={{
          width: '130px',
          height: '130px',
          borderRadius: '50%',
          border: '3px solid rgba(192,57,43,0.4)',
          background: '#141414',
          marginBottom: '16px',
        }}
      >
        {hasPhoto ? (
          <img
            src={photo}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <FiUser size={40} color="#555" />
        )}
      </div>
      <h4
        className="font-bold uppercase"
        style={{
          fontFamily: "'Oswald', sans-serif",
          fontSize: '1rem',
          color: '#F5F5F0',
          letterSpacing: '0.08em',
          marginBottom: '4px',
        }}
      >
        {name}
      </h4>
      <p style={{ fontFamily: "'Lora', serif", fontSize: '0.8rem', color: '#D4AC0D', fontStyle: 'italic' }}>
        Co-Founder
      </p>
    </motion.div>
  );
}

export default function About() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    publicApi.get('/settings').then(r => setSettings(r.data)).catch(() => {});
  }, []);

  const owner1Name = settings?.owner1Name || 'Moiz Ur Rehman Khalid';
  const owner1Photo = settings?.owner1Photo || '';
  const owner2Name = settings?.owner2Name || 'Hammad';
  const owner2Photo = settings?.owner2Photo || '';

  return (
    <section id="about" style={{ background: '#0A0A0A' }}>
      <div style={{ padding: '100px clamp(24px, 5vw, 60px)', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="flex flex-col lg:flex-row gap-14 lg:gap-20">
          {/* Left Column — 45% */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="w-full lg:w-[45%] relative"
          >
              {/* Atmospheric food image panel */}
            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: '12px',
                height: 'clamp(320px, 45vw, 520px)',
                background: '#111',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=85"
                alt="Lyallpur BBQ"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  opacity: 0.75,
                }}
              />
              {/* Dark gradient on bottom */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.9) 0%, rgba(8,8,8,0.2) 50%, transparent 100%)' }}
              />
              {/* EST. badge top-left */}
              <div className="absolute top-5 left-5">
                <span
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: '0.65rem',
                    letterSpacing: '0.35em',
                    color: '#D4AC0D',
                    textTransform: 'uppercase',
                    background: 'rgba(8,8,8,0.6)',
                    backdropFilter: 'blur(6px)',
                    padding: '6px 14px',
                    borderRadius: '50px',
                    border: '1px solid rgba(212,172,13,0.3)',
                  }}
                >
                  Est. Faisalabad, 2018
                </span>
              </div>
              {/* Quote bottom */}
              <div className="absolute bottom-6 left-6 right-6">
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                    fontStyle: 'italic',
                    color: '#F5F5F0',
                    lineHeight: 1.5,
                    marginBottom: '10px',
                  }}
                >
                  "Coal-fired. Soul-inspired."  
                </p>
                <div style={{ width: '40px', height: '2px', background: '#C0392B' }} />
              </div>
            </div>
          </motion.div>

          {/* Right Column — 55% */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="w-full lg:w-[55%]"
          >
            <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '12px', color: '#D4AC0D', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Our Story
            </p>
            <h2 className="text-white mb-6" style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', fontWeight: 700 }}>
              The Legacy of Lyallpur
            </h2>
            <p style={{ fontFamily: "'Lora', serif", fontSize: '1rem', color: '#C8C8C0', lineHeight: 1.8, marginBottom: '20px' }}>
              Born in the heart of Faisalabad — the city once called Lyallpur — our BBQ is cooked over open flame, marinated with secret spice blends passed down through generations. Every Thaal tells a story of authentic Punjabi flavors.
            </p>
            <p style={{ fontFamily: "'Lora', serif", fontSize: '1rem', color: '#C8C8C0', lineHeight: 1.8, marginBottom: '32px' }}>
              From our signature Malai Special to the classic Protein Thaal, every dish is prepared fresh daily with the finest ingredients. We believe great BBQ is not just food — it's an experience.
            </p>

            {/* Feature Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <div
                  key={i}
                  style={{
                    background: '#141414',
                    border: '1px solid rgba(192,57,43,0.2)',
                    borderRadius: '8px',
                    padding: '24px 20px',
                  }}
                >
                  <div style={{ color: '#C0392B', marginBottom: '10px' }}>{f.icon}</div>
                  <p className="font-bold uppercase" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.9rem', color: '#F5F5F0', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    {f.title}
                  </p>
                  <p style={{ fontFamily: "'Lora', serif", fontSize: '0.8rem', color: '#888880' }}>
                    {f.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Mission of Founders Section */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
          style={{ marginTop: '80px' }}
        >
          <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '12px', color: '#D4AC0D', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '12px' }}>
            The Visionaries
          </p>
          <h2 className="text-white mb-6" style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', fontWeight: 700 }}>
            Mission of Founders
          </h2>
          <p style={{ fontFamily: "'Lora', serif", fontSize: '1rem', color: '#C8C8C0', lineHeight: 1.8, maxWidth: '700px', margin: '0 auto 48px' }}>
            Driven by a passion for authentic flavors, our founders set out to bring the true taste of Punjabi BBQ to every doorstep. Their mission is simple — serve honest, flame-grilled food with the warmth and hospitality of Faisalabad, one Thaal at a time.
          </p>

          {/* Owner Cards */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-16">
            <OwnerCard name={owner1Name} photo={owner1Photo} />
            <OwnerCard name={owner2Name} photo={owner2Photo} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
