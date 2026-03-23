const row1Items = [
  '🔥 TIKKA BOTI',
  'MALAI CHEST PIECE',
  'LYALUPURI THAAL',
  'CHICKEN KEBAB',
  'CANDY BOTI',
  'TANDOORI WINGS',
  'LEG PIECE',
  'MALAI BOTI',
];

const row2Items = [
  '⭐ SPECIAL DEALS',
  'FRESH DAILY',
  "FAISALABAD'S FINEST BBQ",
  'OPEN FLAME COOKING',
  'AUTHENTIC LYALLPURI FLAVORS',
];

function MarqueeRow({ items, direction = 'left', color }) {
  const content = items.join(' • ') + ' • ';
  const animClass = direction === 'left' ? 'marquee-left' : 'marquee-right';

  return (
    <div className="overflow-hidden whitespace-nowrap">
      <div className={`inline-flex ${animClass}`}>
        <span
          className="font-bold uppercase"
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: 'clamp(10px, 2.5vw, 13px)',
            letterSpacing: '0.2em',
            color,
            paddingRight: '16px',
          }}
        >
          {content}
        </span>
        <span
          className="font-bold uppercase"
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: 'clamp(10px, 2.5vw, 13px)',
            letterSpacing: '0.2em',
            color,
            paddingRight: '16px',
          }}
        >
          {content}
        </span>
      </div>
    </div>
  );
}

export default function MarqueeStrip() {
  return (
    <div
      className="w-full flex flex-col justify-center gap-2 overflow-hidden"
      style={{
        background: '#1A0A0A',
        borderTop: '1px solid rgba(192,57,43,0.4)',
        borderBottom: '1px solid rgba(192,57,43,0.4)',
        height: '58px',
        padding: '6px 0',
      }}
    >
      <MarqueeRow items={row1Items} direction="left" color="#E67E22" />
      <MarqueeRow items={row2Items} direction="right" color="#D4AC0D" />
    </div>
  );
}
