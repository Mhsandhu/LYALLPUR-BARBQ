import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AnnouncementBanner() {
  const [text, setText] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    axios.get('/api/settings')
      .then(res => {
        if (res.data.announcementEnabled && res.data.announcementText) {
          setText(res.data.announcementText);
          setVisible(true);
        }
      })
      .catch(() => {});
  }, []);

  if (!visible) return null;

  return (
    <div
      className="w-full text-center"
      style={{
        background: 'linear-gradient(90deg, #C0392B, #E67E22, #C0392B)',
        padding: '10px 20px',
        fontFamily: "'Oswald', sans-serif",
        fontSize: '14px',
        letterSpacing: '0.1em',
        color: 'white',
        textTransform: 'uppercase',
        position: 'relative',
        zIndex: 1001,
      }}
    >
      <span>🔥 {text} 🔥</span>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
        style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', lineHeight: 1 }}
        aria-label="Close announcement"
        title="Close announcement"
      >
        ✕
      </button>
    </div>
  );
}
