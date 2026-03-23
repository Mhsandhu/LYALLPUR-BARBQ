import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiShoppingBag, FiDollarSign, FiClock, FiTrendingUp } from 'react-icons/fi';

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('lbq_admin_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const statusColors = {
  pending: { bg: 'rgba(241,196,15,0.15)', text: '#F1C40F' },
  confirmed: { bg: 'rgba(52,152,219,0.15)', text: '#3498DB' },
  preparing: { bg: 'rgba(230,126,34,0.15)', text: '#E67E22' },
  out_for_delivery: { bg: 'rgba(155,89,182,0.15)', text: '#9B59B6' },
  delivered: { bg: 'rgba(39,174,96,0.15)', text: '#27AE60' },
  cancelled: { bg: 'rgba(192,57,43,0.15)', text: '#C0392B' },
};

export default function AdminOverview() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/orders').then(r => { setOrders(r.data); setLoading(false); }).catch(err => {
      if (err.response?.status === 401) { localStorage.removeItem('lbq_admin_token'); navigate('/dashboard-lbq-a8f2c9d1/login', { replace: true }); }
      setLoading(false);
    });
  }, [navigate]);

  const today = new Date().toDateString();
  const todaysOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
  const todaysRevenue = todaysOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  const stats = [
    { label: "Today's Orders", value: todaysOrders.length, icon: <FiShoppingBag size={22} />, accent: '#E67E22' },
    { label: "Today's Revenue", value: `Rs. ${todaysRevenue.toLocaleString()}`, icon: <FiDollarSign size={22} />, accent: '#27AE60' },
    { label: 'Pending Orders', value: pendingCount, icon: <FiClock size={22} />, accent: '#F1C40F', badge: pendingCount > 0 },
    { label: 'Total Orders', value: orders.length, icon: <FiTrendingUp size={22} />, accent: '#3498DB' },
  ];

  const recent = orders.slice(0, 10);

  const cardStyle = {
    background: '#141414',
    border: '1px solid rgba(192,57,43,0.2)',
    borderRadius: '12px',
    padding: '24px',
  };

  if (loading) return <div className="flex items-center justify-center h-64"><span className="inline-block w-8 h-8 border-2 border-[#C0392B] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-white font-bold mb-8" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.6rem', letterSpacing: '0.03em' }}>Overview</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} style={cardStyle} className="relative">
            <div className="absolute top-4 right-4" style={{ color: s.accent }}>{s.icon}</div>
            {s.badge && <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-red-500" />}
            <p className="text-white font-bold" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2.5rem' }}>{s.value}</p>
            <p style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#A0A09A', marginTop: '4px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div style={cardStyle}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.1rem', letterSpacing: '0.05em' }}>Recent Orders</h2>
          <button onClick={() => navigate('../orders')} className="cursor-pointer transition-colors" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.9rem', color: '#E67E22', background: 'rgba(230,126,34,0.1)', border: '1px solid rgba(230,126,34,0.3)', borderRadius: '8px', padding: '8px 18px', letterSpacing: '0.05em' }}>
            View All Orders
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(192,57,43,0.2)' }}>
                {['Order #', 'Customer', 'Phone', 'Items', 'Total', 'Status', 'Time'].map(h => (
                  <th key={h} className="pb-3 pr-4" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.75rem', color: '#A0A09A', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center" style={{ fontFamily: "'Lora', serif", color: '#666660', fontStyle: 'italic' }}>No orders yet</td></tr>
              )}
              {recent.map(o => {
                const items = o.selectedDeal ? `Deal: ${o.selectedDeal.dealName}` : (o.individualItems || []).map(i => `${i.name}×${i.quantity}`).join(', ') || '-';
                const sc = statusColors[o.status] || statusColors.pending;
                return (
                  <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="py-3 pr-4" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.85rem', color: '#E67E22' }}>{o.orderNumber}</td>
                    <td className="py-3 pr-4" style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#F5F5F0' }}>{o.customerName}</td>
                    <td className="py-3 pr-4" style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#A0A09A' }}>{o.phone}</td>
                    <td className="py-3 pr-4" style={{ fontFamily: "'Lora', serif", fontSize: '0.8rem', color: '#A0A09A', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{items}</td>
                    <td className="py-3 pr-4" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.85rem', color: '#D4AC0D' }}>Rs. {(o.totalPrice || 0).toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '50px', background: sc.bg, color: sc.text }}>{o.status?.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="py-3" style={{ fontFamily: "'Lora', serif", fontSize: '0.8rem', color: '#A0A09A' }}>{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
