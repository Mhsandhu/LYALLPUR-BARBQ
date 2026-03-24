import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import { FaWhatsapp, FaInstagram, FaFacebookF, FaTiktok } from 'react-icons/fa';
import publicApi from '../utils/api';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const socials = [
  { icon: <FaInstagram size={18} />, href: '#', label: 'Instagram' },
  { icon: <FaFacebookF size={18} />, href: '#', label: 'Facebook' },
  { icon: <FaTiktok size={18} />, href: '#', label: 'TikTok' },
];

export default function Contact() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    publicApi.get('/settings').then(r => setSettings(r.data)).catch(() => {});
  }, []);

  const address = settings?.address || 'Faisalabad, Pakistan';
  const phone = settings?.phone || '0300-0000000';
  const hours = settings?.openingHours || 'Mon-Sun: 12:00 PM — 12:00 AM';
  const whatsapp = settings?.whatsapp || '+923706050759';
  const whatsappNum = whatsapp.replace(/[^0-9]/g, '');

  const contactInfo = [
    { icon: <FiMapPin size={20} />, text: address },
    { icon: <FiPhone size={20} />, text: phone },
    { icon: <FiClock size={20} />, text: hours },
  ];

  return (
    <section id="contact" style={{ background: '#080808' }}>
      <div style={{ padding: '100px clamp(24px, 5vw, 60px)', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '12px', color: '#D4AC0D', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Get in Touch
          </p>
          <h2 className="text-white mb-4" style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 700 }}>
            Visit Us
          </h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left — Contact Info */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <div className="space-y-5 mb-8">
              {contactInfo.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      border: '1px solid rgba(192,57,43,0.3)',
                      color: '#C0392B',
                    }}
                  >
                    {item.icon}
                  </div>
                  <span style={{ fontFamily: "'Lora', serif", fontSize: '1rem', color: '#C8C8C0' }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* WhatsApp Button */}
            <a
              href={`https://wa.me/${whatsappNum}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full cursor-pointer font-bold uppercase transition-all duration-300 hover:scale-[1.02]"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '16px',
                letterSpacing: '0.15em',
                background: '#25D366',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                padding: '16px',
                textDecoration: 'none',
                marginBottom: '32px',
              }}
            >
              <FaWhatsapp size={20} />
              Chat on WhatsApp
            </a>

            {/* Social Icons */}
            <div className="flex gap-4">
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
          </motion.div>

          {/* Right — Map */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108888.00765631867!2d73.02484085!3d31.4199966!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3922693f0afea573%3A0x77731f69c74ba1ef!2sFaisalabad%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1699999999999!5m2!1sen!2s"
              width="100%"
              height="350"
              style={{ border: 0, borderRadius: '12px', filter: 'grayscale(50%) contrast(1.1)' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lyallpur BarBQ Location"
            />
            <a
              href="https://www.google.com/maps/search/Faisalabad+Pakistan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full cursor-pointer font-bold uppercase transition-all duration-300 contact-directions-btn"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '15px',
                letterSpacing: '0.1em',
                background: 'transparent',
                color: '#C0392B',
                border: '2px solid #C0392B',
                borderRadius: '50px',
                padding: '14px',
                textDecoration: 'none',
                marginTop: '20px',
              }}
            >
              Get Directions
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
