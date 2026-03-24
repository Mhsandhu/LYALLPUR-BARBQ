import { useState, useEffect } from 'react';
import { FaInstagram, FaFacebookF, FaTiktok } from 'react-icons/fa';
import { FiChevronUp } from 'react-icons/fi';

const quickLinks = [
  { label: 'Home', href: '#' },
  { label: 'Menu', href: '#menu' },
  { label: 'Deals', href: '#deals' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
  { label: 'Order Now', href: '#order' },
];

const socials = [
  { icon: <FaInstagram size={18} />, href: '#', label: 'Instagram' },
  { icon: <FaFacebookF size={18} />, href: '#', label: 'Facebook' },
  { icon: <FaTiktok size={18} />, href: '#', label: 'TikTok' },
];

export default function Footer() {
  const [showTop, setShowTop] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <footer style={{ background: '#050505', borderTop: '2px solid #C0392B' }} className="footer-top-border">
        <div style={{ padding: '70px clamp(24px, 5vw, 60px) 36px', maxWidth: '1100px', margin: '0 auto' }}>
          {/* Top 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-14 md:gap-12 mb-12">
            {/* Column 1 — Brand */}
            <div>
              <h3
                className="mb-3"
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #E67E22, #C0392B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Lyallpur BarBQ
              </h3>
              <p className="italic mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: '#D4AC0D' }}>
                Taste the Flame.
              </p>
              <p style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#888880', lineHeight: 1.7 }}>
                Authentic BBQ from the heart of Faisalabad
              </p>
            </div>

            {/* Column 2 — Quick Links */}
            <div>
              <h4 className="font-bold uppercase mb-4" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1rem', color: '#F5F5F0', letterSpacing: '0.1em' }}>
                Quick Links
              </h4>
              <ul className="space-y-2">
                {quickLinks.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="footer-link transition-all duration-300"
                      style={{ fontFamily: "'Lora', serif", fontSize: '0.9rem', color: '#A0A09A', textDecoration: 'none' }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Connect */}
            <div>
              <h4 className="font-bold uppercase mb-5" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1rem', color: '#F5F5F0', letterSpacing: '0.1em' }}>
                Connect With Us
              </h4>
              <div className="flex gap-4 mb-6">
                {socials.map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="social-icon-btn flex items-center justify-center transition-all duration-300"
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      border: '1px solid #C0392B',
                      color: '#C0392B',
                      textDecoration: 'none',
                    }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="order-input"
                  style={{
                    flex: '1 1 160px',
                    minWidth: 0,
                    background: '#1A1A1A',
                    border: '1px solid rgba(192,57,43,0.3)',
                    borderRadius: '50px',
                    padding: '11px 16px',
                    color: 'white',
                    fontFamily: "'Lora', serif",
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
                <button
                  className="cursor-pointer font-bold uppercase transition-all duration-300"
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: '12px',
                    letterSpacing: '0.1em',
                    background: '#C0392B',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '11px 22px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                  onClick={() => {
                    if (email.trim()) setEmail('');
                  }}
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{ borderTop: '1px solid rgba(192,57,43,0.2)', paddingTop: '24px' }}>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <p style={{ fontFamily: "'Lora', serif", fontSize: '0.8rem', color: '#666660' }}>
                &copy; 2025 Lyallpur BarBQ. All Rights Reserved.
              </p>
              <p style={{ fontFamily: "'Lora', serif", fontSize: '0.8rem', color: '#666660' }}>
                Crafted with fire in Faisalabad
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        title="Back to top"
        aria-label="Back to top"
        className="fixed cursor-pointer z-40 flex items-center justify-center transition-all duration-300 back-to-top-btn"
        style={{
          bottom: '24px',
          right: '24px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: '#C0392B',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 15px rgba(192,57,43,0.4)',
          opacity: showTop ? 1 : 0,
          pointerEvents: showTop ? 'auto' : 'none',
          transform: showTop ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        <FiChevronUp size={22} />
      </button>
    </>
  );
}
