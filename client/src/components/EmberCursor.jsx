import { useEffect, useRef } from 'react';

export default function EmberCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const ringPos = useRef({ x: -200, y: -200 });
  const targetPos = useRef({ x: -200, y: -200 });
  const rafRef = useRef(null);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(Date.now());
  const isHovering = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('ontouchstart' in window) return;

    document.body.style.cursor = 'none';

    const dot = dotRef.current;
    const ring = ringRef.current;

    const lerp = (a, b, n) => a + (b - a) * n;

    const animateRing = () => {
      ringPos.current.x = lerp(ringPos.current.x, targetPos.current.x, 0.1);
      ringPos.current.y = lerp(ringPos.current.y, targetPos.current.y, 0.1);
      if (ring) {
        ring.style.left = ringPos.current.x + 'px';
        ring.style.top = ringPos.current.y + 'px';
      }
      rafRef.current = requestAnimationFrame(animateRing);
    };
    rafRef.current = requestAnimationFrame(animateRing);

    const spawnEmber = (x, y) => {
      const ember = document.createElement('div');
      const size = Math.random() * 5 + 2;
      const colors = ['#C0392B', '#E67E22', '#F39C12', '#D4AC0D', '#FF6B35'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const driftX = (Math.random() - 0.5) * 50;
      const riseY = -(Math.random() * 55 + 25);
      const duration = Math.random() * 500 + 350;

      Object.assign(ember.style, {
        position: 'fixed',
        width: size + 'px',
        height: size + 'px',
        background: color,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: '99997',
        left: x + 'px',
        top: y + 'px',
        transform: 'translate(-50%, -50%)',
        boxShadow: `0 0 ${size * 2}px ${color}`,
      });

      document.body.appendChild(ember);

      ember.animate(
        [
          { opacity: 0.95, transform: 'translate(-50%, -50%) scale(1)' },
          {
            opacity: 0,
            transform: `translate(calc(-50% + ${driftX}px), calc(-50% + ${riseY}px)) scale(0.05)`,
          },
        ],
        { duration, easing: 'ease-out', fill: 'forwards' }
      ).onfinish = () => ember.remove();
    };

    const handleMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;

      if (dot) {
        dot.style.left = x + 'px';
        dot.style.top = y + 'px';
      }
      targetPos.current = { x, y };

      const now = Date.now();
      const dt = Math.max(now - lastTime.current, 1);
      const dx = x - lastX.current;
      const dy = y - lastY.current;
      const speed = Math.sqrt(dx * dx + dy * dy) / dt;

      lastX.current = x;
      lastY.current = y;
      lastTime.current = now;

      if (speed > 1.2) {
        const count = Math.min(Math.ceil(speed * 0.7), 2);
        for (let i = 0; i < count; i++) {
          setTimeout(
            () =>
              spawnEmber(
                x + (Math.random() - 0.5) * 8,
                y + (Math.random() - 0.5) * 8
              ),
            i * 60
          );
        }
      }
    };

    const isClickable = (el) => {
      let node = el;
      while (node && node !== document.body) {
        const tag = node.tagName?.toLowerCase();
        if (['a', 'button', 'input', 'select', 'textarea', 'label'].includes(tag)) return true;
        const computed = window.getComputedStyle(node).cursor;
        if (computed === 'pointer') return true;
        node = node.parentElement;
      }
      return false;
    };

    const handleMouseOver = (e) => {
      if (isClickable(e.target)) {
        isHovering.current = true;
        if (dot) {
          dot.style.transform = 'translate(-50%, -50%) scale(2.8)';
          dot.style.background = '#E67E22';
          dot.style.boxShadow = '0 0 12px #E67E22, 0 0 28px rgba(230,126,34,0.7)';
        }
        if (ring) {
          ring.style.transform = 'translate(-50%, -50%) scale(0.4)';
          ring.style.borderColor = 'rgba(230,126,34,0.7)';
        }
      }
    };

    const handleMouseOut = (e) => {
      if (isHovering.current && !isClickable(e.relatedTarget)) {
        isHovering.current = false;
        if (dot) {
          dot.style.transform = 'translate(-50%, -50%) scale(1)';
          dot.style.background = '#C0392B';
          dot.style.boxShadow = '0 0 8px #C0392B, 0 0 20px rgba(192,57,43,0.6)';
        }
        if (ring) {
          ring.style.transform = 'translate(-50%, -50%) scale(1)';
          ring.style.borderColor = 'rgba(192,57,43,0.45)';
        }
      }
    };

    const handleMouseLeaveWindow = () => {
      if (dot) dot.style.opacity = '0';
      if (ring) ring.style.opacity = '0';
    };

    const handleMouseEnterWindow = () => {
      if (dot) dot.style.opacity = '1';
      if (ring) ring.style.opacity = '1';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.documentElement.addEventListener('mouseleave', handleMouseLeaveWindow);
    document.documentElement.addEventListener('mouseenter', handleMouseEnterWindow);

    return () => {
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeaveWindow);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnterWindow);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          width: '10px',
          height: '10px',
          background: '#C0392B',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          left: '-200px',
          top: '-200px',
          transform: 'translate(-50%, -50%) scale(1)',
          boxShadow: '0 0 8px #C0392B, 0 0 20px rgba(192,57,43,0.6)',
          transition: 'transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease',
          mixBlendMode: 'screen',
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          width: '38px',
          height: '38px',
          border: '1.5px solid rgba(192,57,43,0.45)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99998,
          left: '-200px',
          top: '-200px',
          transform: 'translate(-50%, -50%) scale(1)',
          transition: 'transform 0.2s ease, border-color 0.18s ease',
        }}
      />
    </>
  );
}
