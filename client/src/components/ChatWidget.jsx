import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiX, FiMessageCircle } from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';
import publicApi from '../utils/api';

const WELCOME = {
  role: 'assistant',
  text: 'Assalam o Alaikum! 🔥 Lyallpur BarBQ mein khush aamdeed!\n\nMujhe batayein — menu, prices, delivery, ya koi bhi sawal!',
  id: 'welcome',
};

const SUGGESTIONS = [
  'Menu kya hai?',
  'Delivery available hai?',
  'Opening hours kya hain?',
  'Best item konsa hai?',
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDot, setShowDot] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setShowDot(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput('');
    const userMsg = { role: 'user', text: userText, id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const history = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', text: m.text }));

    try {
      const { data } = await publicApi.post('/chat', { message: userText, history });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.reply, id: Date.now() + 1 },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Maafi chahta hoon, abhi thodi takleef hai. Thodi der baad dobara try karein ya WhatsApp pe contact karein. 🙏',
          id: Date.now() + 1,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showSuggestions = messages.length === 1;

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.92 }}
        aria-label="Open chat"
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #C0392B, #E67E22)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(192,57,43,0.5)',
          zIndex: 9990,
          color: 'white',
        }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <FiX size={22} />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <FiMessageCircle size={22} />
            </motion.span>
          )}
        </AnimatePresence>
        {/* Unread dot */}
        {showDot && !open && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            style={{ position: 'absolute', top: '4px', right: '4px', width: '12px', height: '12px', borderRadius: '50%', background: '#D4AC0D', border: '2px solid white' }}
          />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              bottom: '155px',
              right: '14px',
              width: 'clamp(310px, 92vw, 370px)',
              height: 'clamp(440px, 65vh, 540px)',
              borderRadius: '18px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 9989,
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 16px',
              background: 'linear-gradient(135deg, #1a0a06, #2a0e08)',
              borderBottom: '1px solid rgba(192,57,43,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexShrink: 0,
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #C0392B, #E67E22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FaRobot size={18} color="white" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontFamily: "'Oswald', sans-serif", fontSize: '14px', letterSpacing: '0.08em', color: '#F5F5F0', textTransform: 'uppercase' }}>
                  Barbq Assistant
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2ecc71', flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Lora', serif", fontSize: '11px', color: 'rgba(245,245,240,0.55)', fontStyle: 'italic' }}>
                    Online — AI Powered
                  </span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(245,245,240,0.5)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              WebkitOverflowScrolling: 'touch',
            }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-end',
                    gap: '7px',
                  }}
                >
                  {msg.role === 'assistant' && (
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #C0392B, #E67E22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FaRobot size={13} color="white" />
                    </div>
                  )}
                  <div style={{
                    maxWidth: '78%',
                    padding: '10px 13px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #C0392B, #E67E22)'
                      : 'var(--bg-elevated)',
                    color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                    fontFamily: "'Lora', serif",
                    fontSize: '13px',
                    lineHeight: 1.55,
                    boxShadow: msg.role === 'user' ? '0 2px 12px rgba(192,57,43,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                    border: msg.role === 'assistant' ? '1px solid var(--border-subtle)' : 'none',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '7px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #C0392B, #E67E22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FaRobot size={13} color="white" />
                  </div>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '16px 16px 16px 4px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex', gap: '5px', alignItems: 'center',
                  }}>
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C0392B', display: 'block' }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestion chips */}
              {showSuggestions && !loading && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '4px' }}>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      style={{
                        background: 'none',
                        border: '1px solid rgba(192,57,43,0.5)',
                        borderRadius: '50px',
                        padding: '6px 12px',
                        fontFamily: "'Oswald', sans-serif",
                        fontSize: '11px',
                        letterSpacing: '0.05em',
                        color: '#C0392B',
                        cursor: 'pointer',
                        transition: 'all 0.18s',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#C0392B'; e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#C0392B'; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '10px 12px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-end',
              background: 'var(--bg-card)',
              flexShrink: 0,
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Apna sawal likhein..."
                rows={1}
                style={{
                  flex: 1,
                  resize: 'none',
                  border: '1px solid var(--border-input)',
                  borderRadius: '12px',
                  padding: '10px 13px',
                  fontFamily: "'Lora', serif",
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  background: 'var(--bg-input)',
                  outline: 'none',
                  lineHeight: 1.5,
                  maxHeight: '80px',
                  overflowY: 'auto',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: input.trim() && !loading ? 'linear-gradient(135deg, #C0392B, #E67E22)' : 'var(--bg-elevated)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  color: input.trim() && !loading ? 'white' : 'var(--text-dimmed)',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                  boxShadow: input.trim() && !loading ? '0 2px 12px rgba(192,57,43,0.4)' : 'none',
                }}
              >
                <FiSend size={16} style={{ transform: 'translateX(1px)' }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
