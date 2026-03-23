import { createContext, useContext, useState } from 'react';

export const SoundContext = createContext({ muted: false, setMuted: () => {} });

export function SoundProvider({ children }) {
  const [muted, setMuted] = useState(false);
  return (
    <SoundContext.Provider value={{ muted, setMuted }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSizzle() {
  const { muted } = useContext(SoundContext);

  const play = () => {
    if (muted) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const duration = 0.75;
      const sr = ctx.sampleRate;
      const buf = ctx.createBuffer(1, sr * duration, sr);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.2);
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 3800;
      filter.Q.value = 0.5;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start();
    } catch (_) {}
  };

  return play;
}
