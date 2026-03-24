import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const reviews = [
  {
    name: 'Ahmed Raza',
    location: 'Faisalabad',
    stars: 5,
    review: 'Lyallpur BarBQ ka Malai Special Thaal toh kamaal hai! Malai boti itni soft thi ke muh mein ghul gayi. Family ke saath gaye the, sab ne bohot enjoy kiya. Zaroor dobara aayenge!',
  },
  {
    name: 'Fatima Malik',
    location: 'Faisalabad',
    stars: 5,
    review: 'Best BBQ in Faisalabad hands down! The Lyalupuri Thaal is absolutely incredible. Chicken wings were perfectly grilled. Highly recommend to everyone!',
  },
  {
    name: 'Usman Khan',
    location: 'Lahore',
    stars: 5,
    review: 'Faisalabad visit pe Lyallpur BarBQ must try hai. Protein Thaal order kiya tha, leg piece aur tikka boti dono perfect the. Price bhi reasonable hai quality ke hisaab se.',
  },
  {
    name: 'Sara Ahmed',
    location: 'Faisalabad',
    stars: 5,
    review: 'Online order kiya tha delivery ke liye. Khana bilkul garam aaya aur taste mein koi compromise nahi. WhatsApp pe order karna bohot easy tha!',
  },
  {
    name: 'Hassan Ali',
    location: 'Chiniot',
    stars: 4,
    review: 'Deal 6 try ki thi friends ke saath. Malai chest piece aur tandoori wings ka combination amazing tha. Service bhi fast thi. Definitely coming back!',
  },
  {
    name: 'Zainab Sheikh',
    location: 'Faisalabad',
    stars: 5,
    review: 'Single Person Thaal for lunch was perfect! Just the right amount of food. The imli sauce is the star of the show. This is my regular lunch spot now.',
  },
];

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

function StarRating({ count }) {
  return (
    <span style={{ color: '#D4AC0D', fontSize: '1rem', letterSpacing: '2px' }}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  );
}

function ReviewCard({ review }) {
  return (
    <div
      className="flex-shrink-0"
      style={{
        width: '360px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: '12px',
        padding: '32px',
      }}
    >
      <StarRating count={review.stars} />
      <div style={{ position: 'relative', marginTop: '12px' }}>
        <span
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: '4rem',
            color: '#C0392B',
            opacity: 0.3,
            lineHeight: 1,
            position: 'absolute',
            top: '-20px',
            left: '-4px',
          }}
        >
          &ldquo;
        </span>
        <p
          style={{
            fontFamily: "'Lora', serif",
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            fontStyle: 'italic',
            paddingTop: '16px',
            minHeight: '100px',
          }}
        >
          {review.review}
        </p>
      </div>
      <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
        <p
          className="font-bold uppercase"
          style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.95rem', color: 'var(--text-primary)', letterSpacing: '0.05em' }}
        >
          {review.name}
        </p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.85rem', color: '#D4AC0D', fontStyle: 'italic' }}>
          {review.location}
        </p>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [activeDot, setActiveDot] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);

  const duplicated = [...reviews, ...reviews];
  const cardWidth = 360;
  const gap = 24;
  const singleSetWidth = reviews.length * (cardWidth + gap);

  useEffect(() => {
    const speed = 0.5;
    function animate() {
      if (!paused) {
        posRef.current -= speed;
        if (Math.abs(posRef.current) >= singleSetWidth) {
          posRef.current += singleSetWidth;
        }
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(${posRef.current}px)`;
        }
        const idx = Math.floor(Math.abs(posRef.current) / (cardWidth + gap)) % reviews.length;
        setActiveDot(idx);
      }
      animRef.current = requestAnimationFrame(animate);
    }
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [paused, singleSetWidth]);

  return (
    <section style={{ background: 'var(--bg-section)' }}>
      <div style={{ padding: '100px clamp(24px, 5vw, 60px)', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '12px', color: '#D4AC0D', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Happy Customers
          </p>
          <h2 className="mb-4" style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 700, color: 'var(--text-primary)' }}>
            What Our Guests Say
          </h2>
          <p className="italic" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: '#D4AC0D' }}>
            Real reviews from real BBQ lovers
          </p>
        </motion.div>

        <div
          className="overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          <div
            ref={trackRef}
            className="flex"
            style={{ gap: `${gap}px`, willChange: 'transform' }}
          >
            {duplicated.map((r, i) => (
              <ReviewCard key={i} review={r} />
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-10">
          {reviews.map((_, i) => (
            <button
              key={i}
              className="cursor-pointer"
              aria-label={`Go to review ${i + 1}`}
              title={`Review ${i + 1}`}
              style={{
                width: activeDot === i ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: activeDot === i ? '#C0392B' : 'rgba(192,57,43,0.3)',
                border: 'none',
                transition: 'all 0.3s ease',
                minWidth: '8px',
                padding: 0,
              }}
              onClick={() => {
                posRef.current = -(i * (cardWidth + gap));
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
