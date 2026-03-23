import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiX } from 'react-icons/fi';

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('lbq_admin_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const cardStyle = { background: '#141414', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '12px', padding: '24px' };
const inputStyle = { background: '#1A1A1A', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '8px', padding: '10px 14px', color: 'white', fontFamily: "'Lora', serif", fontSize: '0.85rem', outline: 'none' };

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/customers').then(r => { setCustomers(r.data); setLoading(false); }).catch(err => {
      if (err.response?.status === 401) { localStorage.removeItem('lbq_admin_token'); navigate('/dashboard-lbq-a8f2c9d1/login', { replace: true }); }
      setLoading(false);
    });
  }, [navigate]);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const s = search.toLowerCase();
    return customers.filter(c => c.customerName?.toLowerCase().includes(s) || c.phone?.includes(s));
  }, [customers, search]);

  const viewOrders = async (phone) => {
    setSelectedPhone(phone);
    setOrdersLoading(true);
    try {
      const { data } = await api.get(`/customers/${encodeURIComponent(phone)}/orders`);
      setCustomerOrders(data);
    } catch { setCustomerOrders([]); }
    finally { setOrdersLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><span className="inline-block w-8 h-8 border-2 border-[#C0392B] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-white font-bold" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.6rem', letterSpacing: '0.03em' }}>Customers ({filtered.length})</h1>
        <div className="relative">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#888' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or phone" style={{ ...inputStyle, paddingLeft: '32px', width: '240px' }} />
        </div>
      </div>

      <div style={cardStyle}>
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(192,57,43,0.2)' }}>
                {['Name', 'Phone', 'Total Orders', 'Total Spent', 'Last Order'].map(h => (
                  <th key={h} className="pb-3 pr-4" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.75rem', color: '#A0A09A', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center" style={{ fontFamily: "'Lora', serif", color: '#666660', fontStyle: 'italic' }}>No customers found</td></tr>
              )}
              {filtered.map((c, i) => (
                <tr key={i} className="cursor-pointer" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} onClick={() => viewOrders(c.phone)}>
                  <td className="py-3 pr-4" style={{ fontFamily: "'Lora', serif", fontSize: '0.9rem', color: '#F5F5F0' }}>{c.customerName}</td>
                  <td className="py-3 pr-4" style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#A0A09A' }}>{c.phone}</td>
                  <td className="py-3 pr-4" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.95rem', color: '#E67E22' }}>{c.totalOrders}</td>
                  <td className="py-3 pr-4" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.9rem', color: '#D4AC0D' }}>Rs. {(c.totalSpent || 0).toLocaleString()}</td>
                  <td className="py-3" style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#A0A09A' }}>{c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Orders Modal */}
      {selectedPhone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setSelectedPhone(null)}>
          <div onClick={e => e.stopPropagation()} className="overflow-y-auto" style={{ background: '#141414', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '12px', padding: '32px', maxWidth: '600px', width: '90%', maxHeight: '80vh' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.1rem' }}>Orders for {selectedPhone}</h3>
              <button onClick={() => setSelectedPhone(null)} className="cursor-pointer" style={{ background: 'none', border: 'none', color: '#888' }}><FiX size={20} /></button>
            </div>
            {ordersLoading ? (
              <div className="flex justify-center py-8"><span className="inline-block w-6 h-6 border-2 border-[#C0392B] border-t-transparent rounded-full animate-spin" /></div>
            ) : customerOrders.length === 0 ? (
              <p style={{ fontFamily: "'Lora', serif", color: '#666660', fontStyle: 'italic' }}>No orders found</p>
            ) : (
              <div className="space-y-3">
                {customerOrders.map(o => (
                  <div key={o._id} style={{ background: '#1A1A1A', borderRadius: '8px', padding: '14px', border: '1px solid rgba(192,57,43,0.15)' }}>
                    <div className="flex justify-between mb-1">
                      <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.85rem', color: '#E67E22' }}>{o.orderNumber}</span>
                      <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.85rem', color: '#D4AC0D' }}>Rs. {(o.totalPrice || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ fontFamily: "'Lora', serif", fontSize: '0.8rem', color: '#A0A09A' }}>
                        {o.selectedDeal ? `Deal: ${o.selectedDeal.dealName}` : (o.individualItems || []).map(i => `${i.name}×${i.quantity}`).join(', ') || '-'}
                      </span>
                      <span style={{ fontFamily: "'Lora', serif", fontSize: '0.75rem', color: '#888' }}>{new Date(o.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
