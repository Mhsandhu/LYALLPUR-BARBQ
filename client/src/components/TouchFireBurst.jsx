import { useEffect } from 'react';

const COLORS = ['#C0392B', '#E67E22', '#F39C12', '#D4AC0D', '#FF6B35'];

function spawnRipple(x, y) {
  const ripple = document.createElement('div');
  Object.assign(ripple.style, {
    position: 'fixed',
    width: '24px',
    height: '24px',
    border: '2px solid rgba(192,57,43,0.85)',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: '99996',
    left: x + 'px',
    top: y + 'px',
    transform: 'translate(-50%, -50%)',
  });
  document.body.appendChild(ripple);
  ripple.animate(
    [
      { opacity: 0.85, transform: 'translate(-50%, -50%) scale(1)', borderColor: 'rgba(192,57,43,0.85)' },
      { opacity: 0, transform: 'translate(-50%, -50%) scale(7)', borderColor: 'rgba(230,126,34,0)' },
    ],
    { duration: 650, easing: 'ease-out', fill: 'forwards' }
  ).onfinish = () => ripple.remove();
}

function spawnEmbers(x, y, count) {
  for (let i = 0; i < count; i++) {
    const ember = document.createElement('div');
    const size = Math.random() * 6 + 3;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
    const dist = Math.random() * 65 + 30;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist - dist * 0.35;
    const duration = Math.random() * 420 + 380;

    Object.assign(ember.style, {
      position: 'fixed',
      width: size + 'px',
      height: size + 'px',
      background: color,
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: '99996',
      left: x + 'px',
      top: y + 'px',
      transform: 'translate(-50%, -50%)',
      boxShadow: `0 0 ${size * 2}px ${color}`,
    });
    document.body.appendChild(ember);

    ember.animate(
      [
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
        { opacity: 0, transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.05)` },
      ],
      { duration, easing: 'ease-out', fill: 'forwards' }
    ).onfinish = () => ember.remove();
  }
}

function isButton(el) {
  let node = el;
  while (node && node !== document.body) {
    const tag = node.tagName?.toLowerCase();
    if (['a', 'button'].includes(tag)) return true;
    if (window.getComputedStyle(node).cursor === 'pointer') return true;
    node = node.parentElement;
  }
  return false;
}

export default function TouchFireBurst() {
  useEffect(() => {
    if (!('ontouchstart' in window)) return;

    const handleTouch = (e) => {
      Array.from(e.changedTouches).forEach((touch) => {
        const x = touch.clientX;
        const y = touch.clientY;
        const onButton = isButton(e.target);

        spawnRipple(x, y);
        spawnEmbers(x, y, onButton ? 8 : 5);

        if (onButton && navigator.vibrate) {
          navigator.vibrate(30);
        }
      });
    };

    document.addEventListener('touchstart', handleTouch, { passive: true });
    return () => document.removeEventListener('touchstart', handleTouch);
  }, []);

  return null;
}
