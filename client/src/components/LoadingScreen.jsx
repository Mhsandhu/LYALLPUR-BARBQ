import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function playIntroSound() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0.85;
    master.connect(ctx.destination);
    const now = ctx.currentTime;

    // 1. Cinematic whoosh — noise sweep high→low
    const wBuf = ctx.createBuffer(1, ctx.sampleRate * 1.2, ctx.sampleRate);
    const wd = wBuf.getChannelData(0);
    for (let i = 0; i < wd.length; i++) wd[i] = (Math.random() * 2 - 1);
    const wSrc = ctx.createBufferSource();
    wSrc.buffer = wBuf;
    const wf = ctx.createBiquadFilter();
    wf.type = 'bandpass'; wf.frequency.value = 2000; wf.Q.value = 0.4;
    const wg = ctx.createGain();
    wg.gain.setValueAtTime(0, now);
    wg.gain.linearRampToValueAtTime(0.4, now + 0.15);
    wg.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
    wf.frequency.setValueAtTime(3500, now);
    wf.frequency.exponentialRampToValueAtTime(400, now + 1.0);
    wSrc.connect(wf); wf.connect(wg); wg.connect(master);
    wSrc.start(now); wSrc.stop(now + 1.2);

    // 2. Deep cinematic BOOM — low sine punch
    const boom = ctx.createOscillator();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(80, now + 0.3);
    boom.frequency.exponentialRampToValueAtTime(38, now + 1.0);
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(0, now + 0.3);
    bg.gain.linearRampToValueAtTime(0.7, now + 0.38);
    bg.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
    boom.connect(bg); bg.connect(master);
    boom.start(now + 0.3); boom.stop(now + 1.7);

    // 3. Sparkle ring — high sine shimmer on logo reveal
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const sp = ctx.createOscillator();
      sp.type = 'sine'; sp.frequency.value = freq;
      const sg = ctx.createGain();
      sg.gain.setValueAtTime(0, now + 0.55 + i * 0.08);
      sg.gain.linearRampToValueAtTime(0.06, now + 0.65 + i * 0.08);
      sg.gain.exponentialRampToValueAtTime(0.0001, now + 1.8 + i * 0.1);
      sp.connect(sg); sg.connect(master);
      sp.start(now + 0.55 + i * 0.08);
      sp.stop(now + 2);
    });

    setTimeout(() => ctx.close(), 3000);
  } catch (_) {}
}

export default function LoadingScreen() {
  const [visible, setVisible] = useState(() => !sessionStorage.getItem('lbq_loaded'));
  const [entered, setEntered] = useState(false);
  const [wiping, setWiping] = useState(false);

  const handleEnter = () => {
    if (entered) return;
    setEntered(true);
    playIntroSound();
  };

  useEffect(() => {
    if (!entered) return;
    const t1 = setTimeout(() => setWiping(true), 1900);
    const t2 = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('lbq_loaded', '1');
    }, 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [entered]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="loader"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={handleEnter}
        onTouchStart={handleEnter}
        style={{
          position: 'fixed', inset: 0, zIndex: 999999,
          background: '#040404',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          cursor: entered ? 'default' : 'pointer',
        }}
      >
        {/* Ember particles bg */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {Array.from({ length: 22 }).map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: Math.random() * 4 + 2 + 'px',
                height: Math.random() * 4 + 2 + 'px',
                borderRadius: '50%',
                background: ['#C0392B','#E67E22','#D4AC0D'][i % 3],
                left: Math.random() * 100 + '%',
                bottom: 0,
                boxShadow: `0 0 6px currentColor`,
              }}
              animate={{ y: [0, -(300 + Math.random() * 400)], opacity: [0, 0.8, 0] }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>

        {/* Radial glow */}
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '300px',
          background: 'radial-gradient(ellipse at center, rgba(192,57,43,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Tap to Enter — shown before interaction */}
        <AnimatePresence>
          {!entered && (
            <motion.div
              key="tap"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.9, 0.3] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', bottom: '48px', left: '50%',
                transform: 'translateX(-50%)',
                fontFamily: "'Oswald', sans-serif",
                fontSize: '0.75rem', letterSpacing: '0.45em',
                color: '#C0392B', textTransform: 'uppercase',
                zIndex: 3, pointerEvents: 'none', whiteSpace: 'nowrap',
              }}
            >
              Tap to Enter
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: '0.7rem', letterSpacing: '0.5em',
              color: '#D4AC0D', textTransform: 'uppercase',
              marginBottom: '14px',
            }}
          >
            Est. Faisalabad, Pakistan
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: 'clamp(2rem, 8vw, 4.5rem)',
              fontWeight: 700, color: '#F5F5F0',
              textShadow: '0 0 40px rgba(192,57,43,0.55), 0 0 80px rgba(192,57,43,0.2)',
              margin: 0, lineHeight: 1.1,
            }}
          >
            LYALLPUR
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: 'clamp(2rem, 8vw, 4.5rem)',
              fontWeight: 700, color: '#C0392B',
              textShadow: '0 0 30px rgba(192,57,43,0.8)',
              margin: 0, lineHeight: 1.1,
            }}
          >
            BBQ
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.9, duration: 0.9, ease: 'easeOut' }}
            style={{
              height: '2px', width: '180px', margin: '18px auto 0',
              background: 'linear-gradient(90deg, transparent, #C0392B, #E67E22, #C0392B, transparent)',
              transformOrigin: 'center',
            }}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.6 }}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic', fontSize: '1.15rem',
              color: '#D4AC0D', marginTop: '14px',
            }}
          >
            Taste the Flame
          </motion.p>
        </div>

        {/* Curtain wipe exit */}
        <AnimatePresence>
          {wiping && (
            <motion.div
              key="wipe"
              initial={{ y: '-100%' }}
              animate={{ y: '100%' }}
              transition={{ duration: 0.72, ease: [0.76, 0, 0.24, 1] }}
              style={{
                position: 'absolute', inset: 0,
                background: '#040404', zIndex: 10,
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
