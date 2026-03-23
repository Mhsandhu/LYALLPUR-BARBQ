import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiLink } from 'react-icons/fi';
import { adminApi as api } from '../../utils/api';

const API_BASE = import.meta.env.VITE_API_URL || '';

const cardStyle = { background: '#141414', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '12px', overflow: 'hidden' };
const inputStyle = { background: '#1A1A1A', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '8px', padding: '12px 14px', color: 'white', fontFamily: "'Lora', serif", fontSize: '0.9rem', outline: 'none', width: '100%' };
const labelStyle = { fontFamily: "'Oswald', sans-serif", fontSize: '0.75rem', letterSpacing: '0.1em', color: '#D4AC0D', textTransform: 'uppercase', marginBottom: '6px', display: 'block' };

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | item object for edit
  const navigate = useNavigate();

  const fetchItems = () => {
    api.get('/menu').then(r => { setItems(r.data); setLoading(false); }).catch(err => {
      if (err.response?.status === 401) { localStorage.removeItem('lbq_admin_token'); navigate('/dashboard-lbq-a8f2c9d1/login', { replace: true }); }
      setLoading(false);
    });
  };
  useEffect(() => { fetchItems(); }, []);

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try { await api.delete(`/menu/${id}`); setItems(prev => prev.filter(i => i._id !== id)); toast.success('Deleted'); } catch { toast.error('Failed to delete'); }
  };

  const toggleAvailability = async (item) => {
    try {
      const { data } = await api.put(`/menu/${item._id}`, { ...item, isAvailable: !item.isAvailable });
      setItems(prev => prev.map(i => i._id === data._id ? data : i));
    } catch { toast.error('Update failed'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><span className="inline-block w-8 h-8 border-2 border-[#C0392B] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-white font-bold" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.6rem', letterSpacing: '0.03em' }}>Menu Items ({items.length})</h1>
        <button onClick={() => setModal('add')} className="flex items-center gap-3 cursor-pointer" style={{ background: '#E67E22', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 24px', fontFamily: "'Oswald', sans-serif", fontSize: '0.95rem', letterSpacing: '0.06em' }}>
          <FiPlus size={18} /> Add New Item
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item._id} style={{ ...cardStyle, opacity: item.isAvailable ? 1 : 0.5 }}>
            <div style={{ height: '140px', background: '#1A1A1A', position: 'relative' }}>
              {item.image ? (
                <img src={item.image.startsWith('/') ? `${API_BASE}${item.image}` : item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
              ) : (
                <div className="flex items-center justify-center h-full" style={{ color: '#444', fontFamily: "'Lora', serif", fontSize: '0.8rem', fontStyle: 'italic' }}>No image</div>
              )}
              {!item.isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                  <span style={{ fontFamily: "'Oswald', sans-serif", color: '#C0392B', fontSize: '0.8rem', letterSpacing: '0.1em' }}>UNAVAILABLE</span>
                </div>
              )}
            </div>
            <div style={{ padding: '14px' }}>
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-bold" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.9rem', color: '#F5F5F0' }}>{item.name}</h3>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.85rem', color: '#D4AC0D' }}>Rs. {item.price}</span>
              </div>
              <p style={{ fontFamily: "'Lora', serif", fontSize: '0.75rem', color: '#888', marginBottom: '10px' }}>{item.category}</p>
              <div className="flex items-center gap-3">
                <button onClick={() => toggleAvailability(item)} className="flex-1 cursor-pointer text-center" style={{ background: item.isAvailable ? 'rgba(39,174,96,0.15)' : 'rgba(192,57,43,0.15)', color: item.isAvailable ? '#27AE60' : '#C0392B', border: 'none', borderRadius: '8px', padding: '8px 6px', fontFamily: "'Oswald', sans-serif", fontSize: '0.78rem', letterSpacing: '0.05em' }}>
                  {item.isAvailable ? 'Available' : 'Hidden'}
                </button>
                <button onClick={() => setModal(item)} className="cursor-pointer flex items-center justify-center" style={{ background: 'rgba(230,126,34,0.15)', color: '#E67E22', border: 'none', borderRadius: '8px', padding: '8px 10px', minWidth: '36px', minHeight: '36px' }}><FiEdit2 size={16} /></button>
                <button onClick={() => deleteItem(item._id)} className="cursor-pointer flex items-center justify-center" style={{ background: 'rgba(192,57,43,0.15)', color: '#C0392B', border: 'none', borderRadius: '8px', padding: '8px 10px', minWidth: '36px', minHeight: '36px' }}><FiTrash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {modal && <MenuItemModal item={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); fetchItems(); }} />}
    </div>
  );
}

function MenuItemModal({ item, onClose, onSaved }) {
  const [name, setName] = useState(item?.name || '');
  const [category, setCategory] = useState(item?.category || 'Chicken');
  const [price, setPrice] = useState(item?.price || 0);
  const [description, setDescription] = useState(item?.description || '');
  const [imageMode, setImageMode] = useState('url');
  const [imageUrl, setImageUrl] = useState(item?.image || '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(item?.image || '');
  const [isAvailable, setIsAvailable] = useState(item?.isAvailable !== false);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  };

  const handleUrlChange = (val) => {
    setImageUrl(val);
    setPreview(val);
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('category', category);
      formData.append('price', price);
      formData.append('description', description.trim());
      formData.append('isAvailable', isAvailable);
      if (imageMode === 'file' && file) {
        formData.append('image', file);
      } else {
        formData.append('imageUrl', imageUrl);
      }

      if (item) {
        await api.put(`/menu/${item._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/menu', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      toast.success(item ? 'Item updated' : 'Item added');
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
          <h3 className="text-white font-bold" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.1rem' }}>{item ? 'Edit Item' : 'Add New Item'}</h3>
          <button onClick={onClose} className="cursor-pointer" style={{ background: 'none', border: 'none', color: '#888' }}><FiX size={20} /></button>
        </div>

        <div className="space-y-4">
          <div><label style={labelS}>Name</label><input value={name} onChange={e => setName(e.target.value)} style={inputS} placeholder="Item name" /></div>
          <div><label style={labelS}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputS, cursor: 'pointer' }}>
              <option value="Chicken">Chicken</option>
              <option value="Rice & Bread">Rice & Bread</option>
              <option value="Extras">Extras</option>
            </select>
          </div>
          <div><label style={labelS}>Price (Rs.)</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} style={inputS} /></div>
          <div><label style={labelS}>Description (optional)</label><textarea value={description} onChange={e => setDescription(e.target.value)} style={{ ...inputS, resize: 'vertical' }} rows={2} /></div>

          {/* Image */}
          <div>
            <label style={labelS}>Image</label>
            <div className="flex gap-2 mb-3">
              <button onClick={() => setImageMode('url')} className="cursor-pointer flex items-center gap-1" style={{ background: imageMode === 'url' ? '#C0392B' : '#1A1A1A', color: imageMode === 'url' ? 'white' : '#A0A09A', border: '1px solid #C0392B', borderRadius: '6px', padding: '6px 12px', fontFamily: "'Oswald', sans-serif", fontSize: '0.75rem' }}>
                <FiLink size={12} /> URL
              </button>
              <button onClick={() => setImageMode('file')} className="cursor-pointer flex items-center gap-1" style={{ background: imageMode === 'file' ? '#C0392B' : '#1A1A1A', color: imageMode === 'file' ? 'white' : '#A0A09A', border: '1px solid #C0392B', borderRadius: '6px', padding: '6px 12px', fontFamily: "'Oswald', sans-serif", fontSize: '0.75rem' }}>
                <FiUpload size={12} /> Upload
              </button>
            </div>
            {imageMode === 'url' && <input value={imageUrl} onChange={e => handleUrlChange(e.target.value)} style={inputS} placeholder="Paste image URL" />}
            {imageMode === 'file' && <input type="file" accept="image/*" onChange={handleFileChange} style={{ ...inputS, padding: '10px' }} />}
            {preview && (
              <div className="mt-3" style={{ borderRadius: '8px', overflow: 'hidden', height: '120px', background: '#1A1A1A' }}>
                <img src={preview.startsWith('/') ? `${API_BASE}${preview}` : preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label style={labelS} className="mb-0">Available</label>
            <button onClick={() => setIsAvailable(!isAvailable)} className="cursor-pointer" style={{ width: '44px', height: '24px', borderRadius: '12px', background: isAvailable ? '#27AE60' : '#333', border: 'none', position: 'relative', transition: 'background 0.3s' }}>
              <span style={{ position: 'absolute', top: '2px', left: isAvailable ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.3s' }} />
            </button>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full mt-6 cursor-pointer font-bold uppercase flex items-center justify-center gap-2" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '14px', letterSpacing: '0.1em', background: '#E67E22', color: 'white', border: 'none', borderRadius: '8px', padding: '14px', opacity: saving ? 0.7 : 1 }}>
          {saving && <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {saving ? 'Saving...' : (item ? 'Update Item' : 'Add Item')}
        </button>
      </div>
    </div>
  );
}
