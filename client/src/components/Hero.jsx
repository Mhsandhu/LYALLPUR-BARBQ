import { motion } from 'framer-motion';
import { HiArrowRight, HiChevronDown } from 'react-icons/hi';
import EmberParticles from './EmberParticles';
import { useCart } from '../context/CartContext';

const headlineWords = [
  { text: 'WHERE', glow: false },
  { text: 'FIRE', glow: true },
];

const headlineWords2 = [
  { text: 'MEETS', glow: false },
  { text: 'FLAVOR', glow: false },
];

const wordVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.8 + i * 0.15,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const fadeIn = (delay) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.6, ease: 'easeOut' },
  },
});

const buttonSpring = (delay) => ({
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { delay, type: 'spring', stiffness: 120, damping: 14 },
  },
});

export default function Hero() {
  const { openCart } = useCart();
  const allWords = [...headlineWords, ...headlineWords2];

  return (
    <section
      id="home"
      className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
    >
      {/* Background base */}
      <div className="absolute inset-0 bg-[#080808]" />

      {/* Radial ember glow at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(192,57,43,0.15)_0%,_transparent_70%)] pointer-events-none" />

      {/* Diagonal accent line - bottom left */}
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[300px] h-[1px] bg-gradient-to-r from-[#C0392B]/60 to-transparent origin-bottom-left rotate-[-35deg] translate-y-[-40px]" />
      </div>

      {/* Ember Particles */}
      <EmberParticles count={typeof window !== 'undefined' && window.innerWidth < 640 ? 20 : 50} />

      {/* Content */}
      <div className="relative z-10 text-center px-6 sm:px-10 max-w-5xl mx-auto flex flex-col items-center">
        {/* EST Label */}
        <motion.p
          variants={fadeIn(0.5)}
          initial="hidden"
          animate="visible"
          className="text-[#F0D000] text-xs sm:text-sm tracking-[0.5em] uppercase mb-6 sm:mb-8"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          EST. Faisalabad, Pakistan
        </motion.p>

        {/* Headline Line 1: WHERE FIRE */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
          {headlineWords.map((word, i) => (
            <motion.span
              key={word.text}
              custom={i}
              variants={wordVariants}
              initial="hidden"
              animate="visible"
              className="inline-block text-[clamp(2.5rem,8vw,7rem)] leading-[1.1] font-bold text-[#F5F5F0]"
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                ...(word.glow && {
                  color: '#F5F5F0',
                  textShadow:
                    '0 0 20px rgba(192,57,43,0.8), 0 0 40px rgba(192,57,43,0.4), 0 0 80px rgba(230,126,34,0.3)',
                }),
              }}
            >
              {word.text}
            </motion.span>
          ))}
        </div>

        {/* Headline Line 2: MEETS FLAVOR */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap mt-1 sm:mt-2">
          {headlineWords2.map((word, i) => (
            <motion.span
              key={word.text}
              custom={i + headlineWords.length}
              variants={wordVariants}
              initial="hidden"
              animate="visible"
              className="inline-block text-[clamp(2.5rem,8vw,7rem)] leading-[1.1] font-bold text-[#F5F5F0]"
              style={{ fontFamily: "'Cinzel Decorative', serif" }}
            >
              {word.text}
            </motion.span>
          ))}
        </div>

        {/* Subheadline */}
        <motion.p
          variants={fadeIn(1.6)}
          initial="hidden"
          animate="visible"
          className="mt-6 sm:mt-8 text-[#D4AC0D] text-xl sm:text-2xl md:text-3xl italic max-w-2xl"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Authentic BBQ Experience from the Heart of Lyallpur
        </motion.p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-3 sm:gap-7 mt-8 sm:mt-14 px-6 sm:px-2">
          {/* Explore Menu - Outlined */}
          <motion.a
            href="#menu"
            variants={buttonSpring(2.0)}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="cursor-pointer inline-flex items-center justify-center w-auto min-w-[180px] sm:min-w-[200px] border-2 border-[#C0392B] bg-[#C0392B] text-white font-bold tracking-[0.15em] uppercase transition-all duration-300 ease-in-out hover:bg-[#a93226] hover:border-[#a93226]"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(13px, 3.5vw, 17px)', borderRadius: '50px', padding: 'clamp(12px, 3vw, 18px) clamp(28px, 6vw, 48px)' }}
          >
            Explore Menu
          </motion.a>

          {/* Order Now - Opens Cart */}
          <motion.button
            onClick={openCart}
            variants={buttonSpring(2.15)}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group cursor-pointer inline-flex items-center justify-center gap-2 w-auto min-w-[180px] sm:min-w-[200px] border-2 border-[#E67E22] bg-[#E67E22] text-white font-bold tracking-[0.15em] uppercase transition-all duration-300 ease-in-out hover:bg-[#C0392B] hover:border-[#C0392B] shadow-[0_4px_25px_rgba(230,126,34,0.5)] hover:shadow-[0_4px_25px_rgba(192,57,43,0.5)]"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(13px, 3.5vw, 17px)', borderRadius: '50px', padding: 'clamp(12px, 3vw, 18px) clamp(28px, 6vw, 48px)' }}
          >
            Order Now
            <HiArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
          </motion.button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        variants={fadeIn(2.5)}
        initial="hidden"
        animate="visible"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span
          className="text-[#F5F5F0]/40 text-[10px] tracking-[0.3em] uppercase"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <HiChevronDown className="text-[#C0392B]/70 text-xl" />
        </motion.div>
      </motion.div>
    </section>
  );
}
