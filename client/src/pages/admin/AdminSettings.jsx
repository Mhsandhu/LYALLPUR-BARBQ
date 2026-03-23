import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiSave } from 'react-icons/fi';
import { adminApi as api } from '../../utils/api';

const cardStyle = { background: '#141414', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '12px', padding: '28px', marginBottom: '24px' };
const inputStyle = { background: '#1A1A1A', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '8px', padding: '12px 14px', color: 'white', fontFamily: "'Lora', serif", fontSize: '0.9rem', outline: 'none', width: '100%' };
const labelStyle = { fontFamily: "'Oswald', sans-serif", fontSize: '0.75rem', letterSpacing: '0.1em', color: '#D4AC0D', textTransform: 'uppercase', marginBottom: '6px', display: 'block' };

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    api.get('/settings').then(r => { setSettings(r.data); setLoading(false); }).catch(err => {
      if (err.response?.status === 401) { localStorage.removeItem('lbq_admin_token'); navigate('/dashboard-lbq-a8f2c9d1/login', { replace: true }); }
      setLoading(false);
    });
  }, [navigate]);

  const updateField = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/settings', settings);
      setSettings(data);
      toast.success('Settings saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { toast.error('Fill in all password fields'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setPwSaving(true);
    try {
      const { data } = await api.put('/settings/password', { currentPassword, newPassword });
      toast.success(data.message || 'Password changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to change password'); }
    finally { setPwSaving(false); }
  };

  if (loading || !settings) return <div className="flex items-center justify-center h-64"><span className="inline-block w-8 h-8 border-2 border-[#C0392B] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div style={{ maxWidth: '700px' }}>
      <h1 className="text-white font-bold mb-8" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.6rem', letterSpacing: '0.03em' }}>Settings</h1>

      {/* Restaurant Info */}
      <div style={cardStyle}>
        <h3 className="text-white font-bold mb-5" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.05rem', borderLeft: '3px solid #C0392B', paddingLeft: '12px' }}>Restaurant Info</h3>
        <div className="space-y-4">
          <div><label style={labelStyle}>Restaurant Name</label><input value={settings.restaurantName || ''} onChange={e => updateField('restaurantName', e.target.value)} style={inputStyle} /></div>
          <div><label style={labelStyle}>Address</label><input value={settings.address || ''} onChange={e => updateField('address', e.target.value)} style={inputStyle} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label style={labelStyle}>Phone</label><input value={settings.phone || ''} onChange={e => updateField('phone', e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>WhatsApp</label><input value={settings.whatsapp || ''} onChange={e => updateField('whatsapp', e.target.value)} style={inputStyle} /></div>
          </div>
          <div><label style={labelStyle}>Opening Hours</label><input value={settings.openingHours || ''} onChange={e => updateField('openingHours', e.target.value)} style={inputStyle} /></div>
        </div>
      </div>

      {/* Delivery Settings */}
      <div style={cardStyle}>
        <h3 className="text-white font-bold mb-5" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.05rem', borderLeft: '3px solid #C0392B', paddingLeft: '12px' }}>Delivery Settings</h3>
        <div className="space-y-4">
          <div><label style={labelStyle}>Delivery Charge (Rs.)</label><input type="number" value={settings.deliveryCharge || 0} onChange={e => updateField('deliveryCharge', e.target.value)} style={inputStyle} /></div>
          <div className="flex items-center gap-3">
            <label style={{ ...labelStyle, marginBottom: 0 }}>Delivery Available</label>
            <button onClick={() => updateField('deliveryAvailable', !settings.deliveryAvailable)} className="cursor-pointer" style={{ width: '44px', height: '24px', borderRadius: '12px', background: settings.deliveryAvailable ? '#27AE60' : '#333', border: 'none', position: 'relative', transition: 'background 0.3s' }}>
              <span style={{ position: 'absolute', top: '2px', left: settings.deliveryAvailable ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.3s' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Announcement Banner */}
      <div style={cardStyle}>
        <h3 className="text-white font-bold mb-5" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.05rem', borderLeft: '3px solid #C0392B', paddingLeft: '12px' }}>Announcement Banner</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label style={{ ...labelStyle, marginBottom: 0 }}>Show Announcement</label>
            <button onClick={() => updateField('announcementEnabled', !settings.announcementEnabled)} className="cursor-pointer" style={{ width: '44px', height: '24px', borderRadius: '12px', background: settings.announcementEnabled ? '#27AE60' : '#333', border: 'none', position: 'relative', transition: 'background 0.3s' }}>
              <span style={{ position: 'absolute', top: '2px', left: settings.announcementEnabled ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.3s' }} />
            </button>
          </div>
          {settings.announcementEnabled && (
            <div><label style={labelStyle}>Announcement Text</label><input value={settings.announcementText || ''} onChange={e => updateField('announcementText', e.target.value)} style={inputStyle} placeholder="e.g. Free delivery on orders above Rs. 1500!" /></div>
          )}
        </div>
      </div>

      {/* Founders / Owners */}
      <div style={cardStyle}>
        <h3 className="text-white font-bold mb-5" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.05rem', borderLeft: '3px solid #C0392B', paddingLeft: '12px' }}>Founders</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Owner 1 — Name</label>
              <input value={settings.owner1Name || ''} onChange={e => updateField('owner1Name', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Owner 1 — Photo URL</label>
              <input value={settings.owner1Photo || ''} onChange={e => updateField('owner1Photo', e.target.value)} style={inputStyle} placeholder="Paste image URL" />
            </div>
          </div>
          {settings.owner1Photo && (
            <div><img src={settings.owner1Photo} alt="Owner 1" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(192,57,43,0.3)' }} onError={e => { e.target.style.display = 'none'; }} /></div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Owner 2 — Name</label>
              <input value={settings.owner2Name || ''} onChange={e => updateField('owner2Name', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Owner 2 — Photo URL</label>
              <input value={settings.owner2Photo || ''} onChange={e => updateField('owner2Photo', e.target.value)} style={inputStyle} placeholder="Paste image URL" />
            </div>
          </div>
          {settings.owner2Photo && (
            <div><img src={settings.owner2Photo} alt="Owner 2" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(192,57,43,0.3)' }} onError={e => { e.target.style.display = 'none'; }} /></div>
          )}
        </div>
      </div>

      {/* Save Settings Button */}
      <button onClick={handleSaveSettings} disabled={saving} className="w-full cursor-pointer font-bold uppercase flex items-center justify-center gap-2 mb-8" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '14px', letterSpacing: '0.1em', background: '#E67E22', color: 'white', border: 'none', borderRadius: '8px', padding: '14px', opacity: saving ? 0.7 : 1 }}>
        {saving ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave size={16} />}
        {saving ? 'Saving...' : 'Save All Settings'}
      </button>

      {/* Change Password */}
      <div style={cardStyle}>
        <h3 className="text-white font-bold mb-5" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.05rem', borderLeft: '3px solid #C0392B', paddingLeft: '12px' }}>Change Password</h3>
        <div className="space-y-4">
          <div><label style={labelStyle}>Current Password</label><input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={inputStyle} /></div>
          <div><label style={labelStyle}>New Password</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} /></div>
          <div><label style={labelStyle}>Confirm New Password</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} /></div>
        </div>
        <button onClick={handleChangePassword} disabled={pwSaving} className="w-full mt-5 cursor-pointer font-bold uppercase flex items-center justify-center gap-2" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '14px', letterSpacing: '0.1em', background: '#C0392B', color: 'white', border: 'none', borderRadius: '8px', padding: '14px', opacity: pwSaving ? 0.7 : 1 }}>
          {pwSaving && <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {pwSaving ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </div>
  );
}
