import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';

const BPM = 65;
const STEP = (60 / BPM) / 4;  // 16th note

// 16-step patterns
const KICK  = [1,0,0,0, 1,0,0,0, 0,0,1,0, 1,0,0,0];
const SNARE = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0];
const HAT   = [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,1];

// Bass riff — C minor pentatonic
const BASS  = [65.41,0,65.41,0, 77.78,0,65.41,0, 73.42,0,65.41,0, 87.31,0,65.41,0];

// Melody — C major pentatonic (high)
const MELODY_POOL = [261.63,293.66,329.63,392.00,440.00,523.25,587.33,392.00];

function makeReverb(ctx) {
  const c = ctx.createConvolver();
  const len = ctx.sampleRate * 3;
  const b = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random()*2-1) * Math.pow(1-i/len, 2.5);
  }
  c.buffer = b;
  return c;
}

function noiseBuf(ctx, secs) {
  const b = ctx.createBuffer(1, ctx.sampleRate * secs, ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random()*2-1;
  return b;
}

function kick(ctx, dest, t) {
  const o = ctx.createOscillator();
  o.frequency.setValueAtTime(160, t);
  o.frequency.exponentialRampToValueAtTime(40, t+0.12);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.9, t);
  g.gain.exponentialRampToValueAtTime(0.001, t+0.35);
  o.connect(g); g.connect(dest);
  o.start(t); o.stop(t+0.35);
}

function snare(ctx, dest, t) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf(ctx, 0.2);
  const f = ctx.createBiquadFilter();
  f.type='bandpass'; f.frequency.value=900; f.Q.value=0.7;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.5, t);
  g.gain.exponentialRampToValueAtTime(0.001, t+0.18);
  src.connect(f); f.connect(g); g.connect(dest);
  src.start(t); src.stop(t+0.2);
}

function hihat(ctx, dest, t) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf(ctx, 0.08);
  const f = ctx.createBiquadFilter();
  f.type='highpass'; f.frequency.value=8000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.18, t);
  g.gain.exponentialRampToValueAtTime(0.001, t+0.06);
  src.connect(f); f.connect(g); g.connect(dest);
  src.start(t); src.stop(t+0.08);
}

function bassNote(ctx, dest, freq, t) {
  if (!freq) return;
  const o = ctx.createOscillator();
  o.type='triangle'; o.frequency.value=freq;
  const o2 = ctx.createOscillator();
  o2.type='sine'; o2.frequency.value=freq*0.5;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.28, t+0.04);
  g.gain.exponentialRampToValueAtTime(0.001, t+STEP*1.8);
  o.connect(g); o2.connect(g); g.connect(dest);
  o.start(t); o.stop(t+STEP*2);
  o2.start(t); o2.stop(t+STEP*2);
}

function melodyNote(ctx, dest, reverb, freq, t) {
  const o = ctx.createOscillator();
  o.type='sine'; o.frequency.value=freq;
  const o2 = ctx.createOscillator();
  o2.type='triangle'; o2.frequency.value=freq*1.003;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.07, t+0.08);
  g.gain.exponentialRampToValueAtTime(0.0001, t+2.8);
  o.connect(g); o2.connect(g);
  g.connect(dest); g.connect(reverb);
  o.start(t); o.stop(t+3);
  o2.start(t); o2.stop(t+3);
}

function buildAmbience(ctx) {
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const reverb = makeReverb(ctx);
  const rvGain = ctx.createGain();
  rvGain.gain.value = 0.35;
  reverb.connect(rvGain);
  rvGain.connect(master);

  // Vinyl-style soft noise floor
  const vnBuf = ctx.createBuffer(1, ctx.sampleRate * 6, ctx.sampleRate);
  const vnd = vnBuf.getChannelData(0);
  for (let i = 0; i < vnd.length; i++) vnd[i] = (Math.random()*2-1)*0.015;
  const vnSrc = ctx.createBufferSource();
  vnSrc.buffer = vnBuf; vnSrc.loop = true;
  vnSrc.connect(master); vnSrc.start();

  let stopped = false;
  let barCount = 0;

  function scheduleBar(startT) {
    if (stopped) return;
    for (let s = 0; s < 16; s++) {
      const t = startT + s * STEP;
      if (KICK[s])  kick(ctx, master, t);
      if (SNARE[s]) snare(ctx, master, t);
      if (HAT[s])   hihat(ctx, master, t);
      if (BASS[s])  bassNote(ctx, master, BASS[s], t);
      // Melody: random note on every 4th step (quarter note)
      if (s % 4 === 0) {
        const mf = MELODY_POOL[Math.floor(Math.random() * MELODY_POOL.length)];
        melodyNote(ctx, master, reverb, mf, t);
      }
    }
    barCount++;
    const barDur = STEP * 16;
    setTimeout(() => scheduleBar(ctx.currentTime + barDur * 0.05), (barDur - 0.1) * 1000);
  }

  scheduleBar(ctx.currentTime + 0.05);
  return { master, stop: () => { stopped = true; } };
}

export default function AmbientSound() {
  const [playing, setPlaying] = useState(false);
  const [initialised, setInitialised] = useState(false);
  const ctxRef = useRef(null);
  const masterRef = useRef(null);

  const toggle = () => {
    if (!initialised) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      ctxRef.current = ctx;
      const amb = buildAmbience(ctx);
      masterRef.current = amb;
      setInitialised(true);
      amb.master.gain.setTargetAtTime(1, ctx.currentTime, 1.5);
      setPlaying(true);
      return;
    }
    const ctx = ctxRef.current;
    const { master } = masterRef.current;
    if (playing) {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.8);
      setPlaying(false);
    } else {
      master.gain.setTargetAtTime(1, ctx.currentTime, 1.2);
      setPlaying(true);
    }
  };

  return (
    <motion.button
      onClick={toggle}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 3, duration: 0.5 }}
      title={playing ? 'Pause ambiance' : 'Play restaurant ambiance'}
      style={{
        position: 'fixed',
        bottom: '84px',
        right: '18px',
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        background: playing ? 'rgba(192,57,43,0.18)' : 'var(--bg-elevated)',
        border: `1.5px solid ${playing ? 'rgba(192,57,43,0.7)' : 'var(--border-card)'}`,
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 9000,
        color: playing ? '#E67E22' : 'var(--text-muted)',
        boxShadow: playing ? '0 0 16px rgba(192,57,43,0.3)' : 'none',
        transition: 'all 0.35s ease',
        padding: 0,
      }}
    >
      {/* Pulse ring when playing */}
      <AnimatePresence>
        {playing && (
          <motion.span
            key="pulse"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '1.5px solid rgba(192,57,43,0.5)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>
      {playing ? <FiVolume2 size={18} /> : <FiVolumeX size={18} />}
    </motion.button>
  );
}
