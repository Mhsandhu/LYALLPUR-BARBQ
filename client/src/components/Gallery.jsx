import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const galleryItems = [
  { src: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80', caption: 'Signature Tikka Boti', tall: true },
  { src: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80', caption: 'Fresh off the Grill', tall: false },
  { src: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80', caption: 'Malai Special', tall: false },
  { src: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&q=80', caption: 'Chicken Kebab', tall: false },
  { src: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&q=80', caption: 'Lyalupuri Thaal', tall: true },
  { src: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c8?w=600&q=80', caption: 'Grilled to Perfection', tall: false },
  { src: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&q=80', caption: 'Tandoori Wings', tall: false },
  { src: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80', caption: 'BBQ Platter', tall: false },
  { src: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&q=80', caption: "Chef's Special", tall: true },
];

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

function GalleryImage({ item, index, onClick }) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-30px' }}
      className="gallery-img-wrap cursor-pointer relative overflow-hidden"
      style={{
        borderRadius: '8px',
        gridRow: item.tall ? 'span 2' : 'span 1',
      }}
      onClick={() => onClick(index)}
    >
      <img
        src={item.src}
        alt={item.caption}
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transition: 'transform 0.4s ease',
        }}
        className="gallery-img"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.parentElement.style.background = 'var(--bg-input)';
        }}
      />
      <div
        className="gallery-overlay absolute inset-0 flex items-center justify-center"
        style={{
          background: 'rgba(0,0,0,0.5)',
          opacity: 0,
          transition: 'opacity 0.4s ease',
        }}
      >
        <span
          className="font-bold uppercase"
          style={{
            fontFamily: "'Oswald', sans-serif",
            color: 'white',
            fontSize: '1rem',
            letterSpacing: '0.1em',
          }}
        >
          {item.caption}
        </span>
      </div>
    </motion.div>
  );
}

function Lightbox({ images, currentIndex, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.92)' }}
        onClick={onClose}
      >
        <button
          onClick={onClose}
          title="Close lightbox"
          className="absolute top-6 right-6 cursor-pointer z-10"
          style={{ background: 'none', border: 'none', color: 'white' }}
        >
          <FiX size={28} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          title="Previous image"
          aria-label="Previous image"
          className="absolute left-4 cursor-pointer z-10"
          style={{ background: 'rgba(192,57,43,0.5)', border: 'none', color: 'white', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <FiChevronLeft size={24} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          title="Next image"
          aria-label="Next image"
          className="absolute right-4 cursor-pointer z-10"
          style={{ background: 'rgba(192,57,43,0.5)', border: 'none', color: 'white', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <FiChevronRight size={24} />
        </button>
        <motion.img
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          src={images[currentIndex].src}
          alt={images[currentIndex].caption}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '90vw',
            maxHeight: '85vh',
            objectFit: 'contain',
            borderRadius: '8px',
          }}
        />
        <p
          className="absolute bottom-6 text-center w-full"
          style={{ fontFamily: "'Oswald', sans-serif", color: 'white', fontSize: '1rem', letterSpacing: '0.1em' }}
        >
          {images[currentIndex].caption}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => setLightboxIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  const nextImage = () => setLightboxIndex((prev) => (prev + 1) % galleryItems.length);

  return (
    <section id="gallery" style={{ background: 'var(--bg-page)' }}>
      <div style={{ padding: '100px clamp(24px, 5vw, 60px)', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '12px', color: '#D4AC0D', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Our Kitchen
          </p>
          <h2 className="mb-4" style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 700, color: 'var(--text-primary)' }}>
            Our Kitchen, Our Pride
          </h2>
          <p className="italic" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: '#D4AC0D' }}>
            Every dish cooked with passion over open flame
          </p>
        </motion.div>

        <div
          className="gallery-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridAutoRows: '180px',
            gap: '20px',
          }}
        >
          {galleryItems.map((item, i) => (
            <GalleryImage key={i} item={item} index={i} onClick={openLightbox} />
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={galleryItems}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </section>
  );
}
