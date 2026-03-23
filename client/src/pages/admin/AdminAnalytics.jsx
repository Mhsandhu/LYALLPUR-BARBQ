import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('lbq_admin_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const cardStyle = { background: '#141414', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '12px', padding: '24px' };
const COLORS = ['#C0392B', '#E67E22', '#D4AC0D', '#27AE60', '#3498DB', '#9B59B6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1A1A1A', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '8px', padding: '10px 14px' }}>
      <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.8rem', color: '#F5F5F0', marginBottom: '4px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontFamily: "'Lora', serif", fontSize: '0.8rem', color: p.color }}>{p.name}: {typeof p.value === 'number' && p.name?.includes('Revenue') ? `Rs. ${p.value.toLocaleString()}` : p.value}</p>
      ))}
    </div>
  );
};

export default function AdminAnalytics() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/orders').then(r => { setOrders(r.data); setLoading(false); }).catch(err => {
      if (err.response?.status === 401) { localStorage.removeItem('lbq_admin_token'); navigate('/dashboard-lbq-a8f2c9d1/login', { replace: true }); }
      setLoading(false);
    });
  }, [navigate]);

  // Orders last 7 days
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const count = orders.filter(o => new Date(o.createdAt).toDateString() === key).length;
      days.push({ name: label, Orders: count });
    }
    return days;
  }, [orders]);

  // Revenue last 30 days
  const last30Days = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      const revenue = orders.filter(o => new Date(o.createdAt).toDateString() === key).reduce((s, o) => s + (o.totalPrice || 0), 0);
      days.push({ name: label, Revenue: revenue });
    }
    return days;
  }, [orders]);

  // Popular Deals
  const dealStats = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      if (o.selectedDeal?.dealName) {
        const name = o.selectedDeal.dealName;
        map[name] = (map[name] || 0) + 1;
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // Delivery vs Takeaway
  const typeStats = useMemo(() => {
    const delivery = orders.filter(o => o.orderType === 'delivery').length;
    const takeaway = orders.filter(o => o.orderType === 'takeaway').length;
    return [
      { name: 'Delivery', value: delivery },
      { name: 'Takeaway', value: takeaway },
    ].filter(d => d.value > 0);
  }, [orders]);

  if (loading) return <div className="flex items-center justify-center h-64"><span className="inline-block w-8 h-8 border-2 border-[#C0392B] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-white font-bold mb-8" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.6rem', letterSpacing: '0.03em' }}>Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Last 7 Days */}
        <div style={cardStyle}>
          <h3 className="text-white font-bold mb-4" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1rem' }}>Orders — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#A0A09A', fontSize: 11, fontFamily: "'Lora', serif" }} />
              <YAxis tick={{ fill: '#A0A09A', fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="Orders" stroke="#E67E22" strokeWidth={2} dot={{ fill: '#E67E22', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Last 30 Days */}
        <div style={cardStyle}>
          <h3 className="text-white font-bold mb-4" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1rem' }}>Revenue — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={last30Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#A0A09A', fontSize: 9, fontFamily: "'Lora', serif" }} interval={4} />
              <YAxis tick={{ fill: '#A0A09A', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Revenue" fill="#C0392B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Deals */}
        <div style={cardStyle}>
          <h3 className="text-white font-bold mb-4" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1rem' }}>Popular Deals</h3>
          {dealStats.length === 0 ? (
            <p style={{ fontFamily: "'Lora', serif", color: '#666660', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>No deal orders yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={dealStats} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {dealStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Delivery vs Takeaway */}
        <div style={cardStyle}>
          <h3 className="text-white font-bold mb-4" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1rem' }}>Delivery vs Takeaway</h3>
          {typeStats.length === 0 ? (
            <p style={{ fontFamily: "'Lora', serif", color: '#666660', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>No orders yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={typeStats} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  <Cell fill="#E67E22" />
                  <Cell fill="#D4AC0D" />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.8rem', color: '#A0A09A' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
