import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiSearch, FiDownload, FiChevronDown, FiChevronUp, FiTrash2, FiCheck } from 'react-icons/fi';
import { adminApi as api } from '../../utils/api';

const allStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
const statusColors = {
  pending: { bg: 'rgba(241,196,15,0.15)', text: '#F1C40F' },
  confirmed: { bg: 'rgba(52,152,219,0.15)', text: '#3498DB' },
  preparing: { bg: 'rgba(230,126,34,0.15)', text: '#E67E22' },
  out_for_delivery: { bg: 'rgba(155,89,182,0.15)', text: '#9B59B6' },
  delivered: { bg: 'rgba(39,174,96,0.15)', text: '#27AE60' },
  cancelled: { bg: 'rgba(192,57,43,0.15)', text: '#C0392B' },
};

const cardStyle = { background: '#141414', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '12px', padding: '24px' };
const inputStyle = { background: '#1A1A1A', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '8px', padding: '10px 14px', color: 'white', fontFamily: "'Lora', serif", fontSize: '0.85rem', outline: 'none' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [selected, setSelected] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = () => {
    api.get('/orders').then(r => { setOrders(r.data); setLoading(false); }).catch(err => {
      if (err.response?.status === 401) { localStorage.removeItem('lbq_admin_token'); navigate('/dashboard-lbq-a8f2c9d1/login', { replace: true }); }
      setLoading(false);
    });
  };
  useEffect(() => { fetchOrders(); }, []);

  const filtered = useMemo(() => {
    let result = [...orders];
    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter);
    if (typeFilter !== 'all') result = result.filter(o => o.orderType === typeFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(o => o.customerName?.toLowerCase().includes(s) || o.phone?.includes(s) || o.orderNumber?.toLowerCase().includes(s));
    }
    if (dateFrom) result = result.filter(o => new Date(o.createdAt) >= new Date(dateFrom));
    if (dateTo) result = result.filter(o => new Date(o.createdAt) <= new Date(dateTo + 'T23:59:59'));
    return result;
  }, [orders, statusFilter, typeFilter, search, dateFrom, dateTo]);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o._id === id ? data : o));
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const deleteOrder = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/orders/${deleteId}`);
      setOrders(prev => prev.filter(o => o._id !== deleteId));
      setDeleteId(null);
      toast.success('Order deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const bulkConfirm = async () => {
    if (selected.length === 0) return;
    try {
      await api.patch('/orders/bulk-status', { ids: selected, status: 'confirmed' });
      fetchOrders();
      setSelected([]);
      toast.success(`${selected.length} orders confirmed`);
    } catch { toast.error('Bulk update failed'); }
  };

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(prev => prev.length === filtered.length ? [] : filtered.map(o => o._id));

  const exportCSV = () => {
    const headers = ['Order #', 'Customer', 'Phone', 'Type', 'Items', 'Total', 'Status', 'Date'];
    const rows = filtered.map(o => {
      const items = o.selectedDeal ? `Deal: ${o.selectedDeal.dealName}` : (o.individualItems || []).map(i => `${i.name}x${i.quantity}`).join('; ');
      return [o.orderNumber, o.customerName, o.phone, o.orderType, `"${items}"`, o.totalPrice, o.status, new Date(o.createdAt).toLocaleDateString()];
    });
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><span className="inline-block w-8 h-8 border-2 border-[#C0392B] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-white font-bold" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.6rem', letterSpacing: '0.03em' }}>Orders ({filtered.length})</h1>
        <div className="flex gap-3 flex-wrap">
          {selected.length > 0 && (
            <button onClick={bulkConfirm} className="flex items-center gap-2 cursor-pointer" style={{ background: '#27AE60', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontFamily: "'Oswald', sans-serif", fontSize: '0.9rem', letterSpacing: '0.05em' }}>
              <FiCheck size={16} /> Confirm ({selected.length})
            </button>
          )}
          <button onClick={exportCSV} className="flex items-center gap-2 cursor-pointer" style={{ background: 'rgba(230,126,34,0.1)', color: '#E67E22', border: '1px solid rgba(230,126,34,0.3)', borderRadius: '10px', padding: '10px 20px', fontFamily: "'Oswald', sans-serif", fontSize: '0.9rem', letterSpacing: '0.05em' }}>
            <FiDownload size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#888' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name / phone / order #" style={{ ...inputStyle, paddingLeft: '32px', width: '240px' }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="all">All Status</option>
          {allStatuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="all">All Types</option>
          <option value="delivery">Delivery</option>
          <option value="takeaway">Takeaway</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
      </div>

      {/* Table */}
      <div style={cardStyle}>
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ minWidth: '900px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(192,57,43,0.2)' }}>
                <th className="pb-3 pr-2"><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="cursor-pointer" /></th>
                {['Order #', 'Customer', 'Phone', 'Type', 'Items', 'Total', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="pb-3 pr-3" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.7rem', color: '#A0A09A', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="py-8 text-center" style={{ fontFamily: "'Lora', serif", color: '#666660', fontStyle: 'italic' }}>No orders found</td></tr>
              )}
              {filtered.map(o => {
                const items = o.selectedDeal ? `Deal: ${o.selectedDeal.dealName}` : (o.individualItems || []).map(i => `${i.name}×${i.quantity}`).join(', ') || '-';
                const sc = statusColors[o.status] || statusColors.pending;
                const isExpanded = expanded === o._id;
                return (
                  <tbody key={o._id}>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }} onClick={() => setExpanded(isExpanded ? null : o._id)}>
                      <td className="py-3 pr-2" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selected.includes(o._id)} onChange={() => toggleSelect(o._id)} className="cursor-pointer" /></td>
                      <td className="py-3 pr-3" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.8rem', color: '#E67E22' }}>{o.orderNumber}</td>
                      <td className="py-3 pr-3" style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#F5F5F0' }}>{o.customerName}</td>
                      <td className="py-3 pr-3" style={{ fontFamily: "'Lora', serif", fontSize: '0.8rem', color: '#A0A09A' }}>{o.phone}</td>
                      <td className="py-3 pr-3" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.75rem', color: '#A0A09A', textTransform: 'capitalize' }}>{o.orderType}</td>
                      <td className="py-3 pr-3" style={{ fontFamily: "'Lora', serif", fontSize: '0.8rem', color: '#A0A09A', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{items}</td>
                      <td className="py-3 pr-3" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.85rem', color: '#D4AC0D' }}>Rs. {(o.totalPrice || 0).toLocaleString()}</td>
                      <td className="py-3 pr-3" onClick={e => e.stopPropagation()}>
                        <select value={o.status} onChange={e => updateStatus(o._id, e.target.value)} className="cursor-pointer" style={{ background: sc.bg, color: sc.text, border: 'none', borderRadius: '50px', padding: '4px 8px', fontFamily: "'Oswald', sans-serif", fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase', outline: 'none' }}>
                          {allStatuses.map(s => <option key={s} value={s} style={{ background: '#1A1A1A', color: '#F5F5F0' }}>{s.replace(/_/g, ' ')}</option>)}
                        </select>
                      </td>
                      <td className="py-3 pr-3" style={{ fontFamily: "'Lora', serif", fontSize: '0.8rem', color: '#A0A09A' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setExpanded(isExpanded ? null : o._id)} className="cursor-pointer" style={{ background: 'none', border: 'none', color: '#888' }}>{isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}</button>
                          <button onClick={() => setDeleteId(o._id)} className="cursor-pointer" style={{ background: 'none', border: 'none', color: '#C0392B' }}><FiTrash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr style={{ background: 'rgba(192,57,43,0.05)' }}>
                        <td colSpan={10} className="p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#C8C8C0' }}>
                            <div><strong style={{ color: '#D4AC0D' }}>Address:</strong> {o.address || 'N/A'}{o.city ? `, ${o.city}` : ''}</div>
                            <div><strong style={{ color: '#D4AC0D' }}>Payment:</strong> {o.paymentMethod?.replace(/_/g, ' ') || 'Cash on Delivery'}</div>
                            <div><strong style={{ color: '#D4AC0D' }}>Subtotal:</strong> Rs. {(o.subtotal || 0).toLocaleString()}</div>
                            <div><strong style={{ color: '#D4AC0D' }}>Delivery:</strong> Rs. {(o.deliveryCharge || 0)}</div>
                            {o.specialInstructions && <div className="col-span-2"><strong style={{ color: '#D4AC0D' }}>Notes:</strong> {o.specialInstructions}</div>}
                            {o.selectedDeal && <div className="col-span-2"><strong style={{ color: '#D4AC0D' }}>Deal:</strong> Deal {o.selectedDeal.dealId} - {o.selectedDeal.dealName} — Rs. {o.selectedDeal.price}</div>}
                            {o.individualItems?.length > 0 && <div className="col-span-2"><strong style={{ color: '#D4AC0D' }}>Items:</strong> {o.individualItems.map(i => `${i.name} ×${i.quantity}`).join(', ')}</div>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setDeleteId(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#141414', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '12px', padding: '32px', maxWidth: '400px', width: '90%' }}>
            <h3 className="text-white font-bold mb-3" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.1rem' }}>Delete Order?</h3>
            <p style={{ fontFamily: "'Lora', serif", fontSize: '0.9rem', color: '#A0A09A', marginBottom: '20px' }}>This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 cursor-pointer" style={{ ...inputStyle, textAlign: 'center', fontFamily: "'Oswald', sans-serif" }}>Cancel</button>
              <button onClick={deleteOrder} className="flex-1 cursor-pointer" style={{ ...inputStyle, background: '#C0392B', borderColor: '#C0392B', color: 'white', textAlign: 'center', fontFamily: "'Oswald', sans-serif" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
