import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiEdit2, FiX } from 'react-icons/fi';

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('lbq_admin_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const cardStyle = { background: '#141414', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '12px', padding: '24px' };

export default function AdminDeals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDeal, setEditDeal] = useState(null);
  const navigate = useNavigate();

  const fetchDeals = () => {
    api.get('/deals').then(r => { setDeals(r.data); setLoading(false); }).catch(err => {
      if (err.response?.status === 401) { localStorage.removeItem('lbq_admin_token'); navigate('/dashboard-lbq-a8f2c9d1/login', { replace: true }); }
      setLoading(false);
    });
  };
  useEffect(() => { fetchDeals(); }, []);

  const toggleActive = async (deal) => {
    try {
      const { data } = await api.put(`/deals/${deal._id}`, { ...deal, isActive: !deal.isActive });
      setDeals(prev => prev.map(d => d._id === data._id ? data : d));
      toast.success(data.isActive ? 'Deal activated' : 'Deal hidden');
    } catch { toast.error('Update failed'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><span className="inline-block w-8 h-8 border-2 border-[#C0392B] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-white font-bold mb-8" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.6rem', letterSpacing: '0.03em' }}>Deals ({deals.length})</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {deals.map(deal => (
          <div key={deal._id} style={{ ...cardStyle, opacity: deal.isActive ? 1 : 0.5 }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.75rem', color: '#E67E22', letterSpacing: '0.1em' }}>DEAL {deal.dealId}</p>
                <h3 className="font-bold" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.1rem', color: '#F5F5F0' }}>{deal.dealName}</h3>
              </div>
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.2rem', color: '#D4AC0D', fontWeight: 700 }}>Rs. {deal.price?.toLocaleString()}</span>
            </div>
            <p style={{ fontFamily: "'Lora', serif", fontSize: '0.8rem', color: '#A0A09A', lineHeight: 1.6, marginBottom: '12px' }}>
              {deal.items?.split(', ').length || 0} items included
            </p>
            <p style={{ fontFamily: "'Lora', serif", fontSize: '0.75rem', color: '#888', lineHeight: 1.5, marginBottom: '16px', maxHeight: '60px', overflow: 'hidden' }}>
              {deal.items}
            </p>
            <div className="flex items-center gap-3">
              <button onClick={() => toggleActive(deal)} className="flex-1 cursor-pointer text-center" style={{ background: deal.isActive ? 'rgba(39,174,96,0.15)' : 'rgba(192,57,43,0.15)', color: deal.isActive ? '#27AE60' : '#C0392B', border: 'none', borderRadius: '8px', padding: '10px 8px', fontFamily: "'Oswald', sans-serif", fontSize: '0.82rem', letterSpacing: '0.05em' }}>
                {deal.isActive ? 'Active' : 'Hidden'}
              </button>
              <button onClick={() => setEditDeal(deal)} className="cursor-pointer flex items-center gap-2" style={{ background: 'rgba(230,126,34,0.15)', color: '#E67E22', border: 'none', borderRadius: '8px', padding: '10px 16px', fontFamily: "'Oswald', sans-serif", fontSize: '0.82rem' }}>
                <FiEdit2 size={15} /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {editDeal && <EditDealModal deal={editDeal} onClose={() => setEditDeal(null)} onSaved={() => { setEditDeal(null); fetchDeals(); }} />}
    </div>
  );
}

function EditDealModal({ deal, onClose, onSaved }) {
  const [dealName, setDealName] = useState(deal.dealName);
  const [price, setPrice] = useState(deal.price);
  const [items, setItems] = useState(deal.items);
  const [isActive, setIsActive] = useState(deal.isActive);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('lbq_admin_token');
      await axios.put(`/api/deals/${deal._id}`, { dealName, price: Number(price), items, isActive }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Deal updated');
      onSaved();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const inputS = { background: '#1A1A1A', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '8px', padding: '12px 14px', color: 'white', fontFamily: "'Lora', serif", fontSize: '0.9rem', outline: 'none', width: '100%' };
  const labelS = { fontFamily: "'Oswald', sans-serif", fontSize: '0.75rem', letterSpacing: '0.1em', color: '#D4AC0D', textTransform: 'uppercase', marginBottom: '6px', display: 'block' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="overflow-y-auto" style={{ background: '#141414', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '12px', padding: '32px', maxWidth: '500px', width: '90%', maxHeight: '90vh' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.1rem' }}>Edit Deal {deal.dealId}</h3>
          <button onClick={onClose} className="cursor-pointer" style={{ background: 'none', border: 'none', color: '#888' }}><FiX size={20} /></button>
        </div>
        <div className="space-y-4">
          <div><label style={labelS}>Deal Name</label><input value={dealName} onChange={e => setDealName(e.target.value)} style={inputS} /></div>
          <div><label style={labelS}>Price (Rs.)</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} style={inputS} /></div>
          <div><label style={labelS}>Items (comma separated)</label><textarea value={items} onChange={e => setItems(e.target.value)} style={{ ...inputS, resize: 'vertical' }} rows={4} /></div>
          <div className="flex items-center gap-3">
            <label style={{ ...labelS, marginBottom: 0 }}>Active</label>
            <button onClick={() => setIsActive(!isActive)} className="cursor-pointer" style={{ width: '44px', height: '24px', borderRadius: '12px', background: isActive ? '#27AE60' : '#333', border: 'none', position: 'relative', transition: 'background 0.3s' }}>
              <span style={{ position: 'absolute', top: '2px', left: isActive ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.3s' }} />
            </button>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="w-full mt-6 cursor-pointer font-bold uppercase flex items-center justify-center gap-2" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '14px', letterSpacing: '0.1em', background: '#E67E22', color: 'white', border: 'none', borderRadius: '8px', padding: '14px', opacity: saving ? 0.7 : 1 }}>
          {saving && <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {saving ? 'Saving...' : 'Update Deal'}
        </button>
      </div>
    </div>
  );
}
