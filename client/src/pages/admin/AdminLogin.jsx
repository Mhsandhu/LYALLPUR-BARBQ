import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import publicApi from '../../utils/api';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!password.trim()) { toast.error('Enter password'); return; }
    setLoading(true);
    try {
      const { data } = await publicApi.post('/admin/login', { password });
      localStorage.setItem('lbq_admin_token', data.token);
      toast.success('Welcome back!');
      navigate('/dashboard-lbq-a8f2c9d1/overview');
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error(err.response?.data?.error || 'Incorrect password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1, x: shake ? [0, -10, 10, -10, 10, 0] : 0 }}
        transition={{ duration: shake ? 0.4 : 0.5 }}
        style={{
          background: '#141414',
          border: '1px solid rgba(192,57,43,0.3)',
          borderRadius: '20px',
          padding: 'clamp(28px, 7vw, 52px)',
          width: '100%',
          maxWidth: '420px',
          margin: '0 clamp(16px, 4vw, 24px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(192,57,43,0.1)',
        }}
      >
        <div className="text-center mb-8">
          <h1
            className="mb-2"
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: '1.5rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #E67E22, #C0392B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Lyallpur BarBQ
          </h1>
          <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.85rem', color: '#D4AC0D', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            Admin Dashboard
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div
            className="flex items-center justify-center"
            style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)' }}
          >
            <FiLock size={28} color="#C0392B" />
          </div>
        </div>

        <div className="mb-6">
          <label style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.8rem', letterSpacing: '0.1em', color: '#D4AC0D', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
            Password
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter admin password"
              className="order-input w-full"
              style={{
                background: '#1A1A1A',
                border: '1px solid rgba(192,57,43,0.3)',
                borderRadius: '8px',
                padding: '14px 48px 14px 16px',
                color: 'white',
                fontFamily: "'Lora', serif",
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
            <button
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              style={{ background: 'none', border: 'none', color: '#888' }}
            >
              {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full cursor-pointer font-bold uppercase flex items-center justify-center gap-2 transition-all duration-300"
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: '16px',
            letterSpacing: '0.15em',
            background: '#E67E22',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: '16px',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading && <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {loading ? 'Authenticating...' : 'Enter Dashboard'}
        </button>
      </motion.div>
    </div>
  );
}
