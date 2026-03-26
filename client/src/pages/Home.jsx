import { motion } from 'framer-motion';
import AnnouncementBanner from '../components/AnnouncementBanner';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import MarqueeStrip from '../components/MarqueeStrip';
import FireDivider from '../components/FireDivider';
import DealsSection from '../components/DealsSection';
import MenuSection from '../components/MenuSection';
import StatsBanner from '../components/StatsBanner';
import Testimonials from '../components/Testimonials';
import Gallery from '../components/Gallery';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import ChatWidget from '../components/ChatWidget';

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <AnnouncementBanner />
      <Navbar />
      <Hero />
      <MarqueeStrip />
      <FireDivider />
      <DealsSection />
      <FireDivider />
      <MenuSection />
      <FireDivider />
      <StatsBanner />
      <FireDivider />
      <Testimonials />
      <FireDivider />
      <Gallery />
      <FireDivider />
      <About />
      <FireDivider />
      <Contact />
      <FireDivider />
      <Footer />
      <FloatingWhatsApp />
      <ChatWidget />
    </motion.div>
  );
}
