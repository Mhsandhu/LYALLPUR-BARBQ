import { useState } from 'react';

function createParticle(id) {
  return {
    id,
    x: Math.random() > 0.5
      ? Math.random() * 30          // left 0-30%
      : 70 + Math.random() * 30,    // right 70-100%
    size: 2 + Math.random() * 2,
    duration: 4 + Math.random() * 6,
    delay: Math.random() * 5,
    drift: (Math.random() - 0.5) * 40,
    opacity: 0.15 + Math.random() * 0.25,
    color: Math.random() > 0.5 ? '#E67E22' : '#C0392B',
  };
}

export default function EmberParticles({ count = 50 }) {
  const [particles] = useState(() =>
    Array.from({ length: count }, (_, i) => createParticle(i))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full ember-particle"
          style={{
            left: `${p.x}%`,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            opacity: 0,
            '--drift': `${p.drift}px`,
            '--duration': `${p.duration}s`,
            '--delay': `${p.delay}s`,
            '--particle-opacity': p.opacity,
            animation: `particle-rise var(--duration) var(--delay) linear infinite`,
          }}
        />
      ))}
    </div>
  );
}
