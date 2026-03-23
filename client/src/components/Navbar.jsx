import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'Menu', href: '#menu' },
  { name: 'Deals', href: '#deals' },
  { name: 'Gallery', href: '#gallery' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
];

const navItemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
  }),
};

const mobileMenuVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const mobileLinkVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, type: 'spring', stiffness: 100, damping: 15 },
  }),
  exit: { opacity: 0, y: 20, transition: { duration: 0.15 } },
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileOpen(false);
  };

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-500 ${
          scrolled
            ? 'bg-[#0F0F0F]/95 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.5)]'
            : 'bg-transparent backdrop-blur-[2px]'
        }`}
      >
        <div className="w-full flex items-center justify-between h-20" style={{ padding: '0 clamp(20px, 4vw, 48px)', maxWidth: '1280px', margin: '0 auto' }}>
          {/* Logo */}
          <motion.a
            href="#home"
            onClick={scrollToTop}
            custom={0}
            initial="hidden"
            animate="visible"
            variants={navItemVariants}
            className="relative z-10 cursor-pointer select-none"
          >
            <span
              className="text-2xl md:text-3xl font-bold fire-gradient animate-flicker"
              style={{ fontFamily: "'Cinzel Decorative', serif" }}
            >
              Lyallpur BarBQ
            </span>
          </motion.a>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <motion.a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                custom={i + 1}
                initial="hidden"
                animate="visible"
                variants={navItemVariants}
                className="nav-link relative text-[#F5F5F0] hover:text-white text-base font-bold tracking-[0.2em] uppercase transition-colors duration-300"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {link.name}
                <span className="nav-underline absolute left-0 -bottom-1 h-[3px] w-0 bg-[#C0392B] transition-all duration-300 ease-out" />
              </motion.a>
            ))}
          </div>

          {/* Cart Button (Desktop) */}
          <motion.button
            onClick={openCart}
            custom={navLinks.length + 1}
            initial="hidden"
            animate="visible"
            variants={navItemVariants}
            className="hidden lg:inline-flex items-center justify-center gap-2 cursor-pointer border-2 border-[#C0392B] bg-[#C0392B] text-white font-bold tracking-[0.15em] uppercase transition-all duration-300 ease-in-out hover:bg-[#a93226] hover:border-[#a93226] shadow-[0_2px_15px_rgba(192,57,43,0.4)]"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: '14px', borderRadius: '50px', padding: '10px 20px', position: 'relative' }}
            title="Open cart"
          >
            <FiShoppingCart size={18} />
            Cart
            {cartCount > 0 && (
              <span className="flex items-center justify-center" style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#E67E22', fontSize: '11px', fontWeight: 700, color: 'white' }}>
                {cartCount}
              </span>
            )}
          </motion.button>

          {/* Mobile: Cart + Hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            <motion.button
              custom={1}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
              onClick={openCart}
              className="relative z-10 text-[#F5F5F0] p-2 cursor-pointer"
              aria-label="Open cart"
              title="Open cart"
              style={{ background: 'none', border: 'none' }}
            >
              <FiShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center" style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#C0392B', fontSize: '10px', fontFamily: "'Oswald', sans-serif", fontWeight: 700, color: 'white' }}>
                  {cartCount}
                </span>
              )}
            </motion.button>
            <motion.button
              custom={2}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
              onClick={() => setMobileOpen(true)}
              className="relative z-10 text-[#F5F5F0] p-2 cursor-pointer"
              aria-label="Open menu"
              title="Open menu"
              style={{ background: 'none', border: 'none' }}
            >
              <HiMenuAlt3 size={28} />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Full-Screen Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-overlay"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[2000] bg-[#080808]/98 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 text-[#F5F5F0] p-2"
              aria-label="Close menu"
            >
              <HiX size={32} />
            </motion.button>

            {/* Mobile Logo */}
            <motion.a
              href="#home"
              onClick={scrollToTop}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-12"
            >
              <span
                className="text-3xl font-bold fire-gradient"
                style={{ fontFamily: "'Cinzel Decorative', serif" }}
              >
                Lyallpur BarBQ
              </span>
            </motion.a>

            {/* Mobile Links */}
            <nav className="flex flex-col items-center gap-6">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  custom={i}
                  variants={mobileLinkVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="text-2xl tracking-[0.2em] uppercase text-[#F5F5F0]/80 hover:text-[#E67E22] transition-colors duration-300"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  {link.name}
                </motion.a>
              ))}

              {/* Mobile Cart Button */}
              <motion.button
                custom={navLinks.length}
                variants={mobileLinkVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => { setMobileOpen(false); openCart(); }}
                className="mt-4 px-10 py-4 text-lg font-bold tracking-[0.15em] uppercase text-white rounded-full bg-[#C0392B] flex items-center gap-3 cursor-pointer relative"
                style={{ fontFamily: "'Oswald', sans-serif", border: 'none' }}
              >
                <FiShoppingCart size={20} />
                Cart
                {cartCount > 0 && (
                  <span className="flex items-center justify-center" style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#E67E22', fontSize: '12px', fontWeight: 700 }}>
                    {cartCount}
                  </span>
                )}
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
