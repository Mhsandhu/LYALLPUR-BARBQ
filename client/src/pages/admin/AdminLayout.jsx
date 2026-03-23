import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { FiGrid, FiShoppingBag, FiMenu, FiTag, FiUsers, FiBarChart2, FiSettings, FiLogOut, FiX } from 'react-icons/fi';

const navItems = [
  { path: 'overview', label: 'Overview', icon: <FiGrid size={20} /> },
  { path: 'orders', label: 'Orders', icon: <FiShoppingBag size={20} /> },
  { path: 'menu', label: 'Menu Items', icon: <FiMenu size={20} /> },
  { path: 'deals', label: 'Deals', icon: <FiTag size={20} /> },
  { path: 'customers', label: 'Customers', icon: <FiUsers size={20} /> },
  { path: 'analytics', label: 'Analytics', icon: <FiBarChart2 size={20} /> },
  { path: 'settings', label: 'Settings', icon: <FiSettings size={20} /> },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('lbq_admin_token');

  useEffect(() => {
    if (!token) navigate('/dashboard-lbq-a8f2c9d1/login', { replace: true });
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('lbq_admin_token');
    navigate('/dashboard-lbq-a8f2c9d1/login', { replace: true });
  };

  if (!token) return null;

  const linkBase = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    borderRadius: '8px',
    fontFamily: "'Oswald', sans-serif",
    fontSize: '0.9rem',
    letterSpacing: '0.05em',
    textDecoration: 'none',
    transition: 'all 0.2s',
    color: '#A0A09A',
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0A0A0A' }}>
      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-50 top-0 left-0 h-full flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{
          width: '260px',
          minWidth: '260px',
          background: '#0F0F0F',
          borderRight: '1px solid rgba(192,57,43,0.2)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between" style={{ padding: '20px 20px', borderBottom: '1px solid rgba(192,57,43,0.15)' }}>
          <div>
            <h2
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: '1.2rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #E67E22, #C0392B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Lyallpur BarBQ
            </h2>
            <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.7rem', color: '#D4AC0D', letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: '4px' }}>
              Admin Panel
            </p>
          </div>
          <button className="lg:hidden cursor-pointer" style={{ background: 'none', border: 'none', color: '#888' }} onClick={() => setSidebarOpen(false)}>
            <FiX size={22} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto" style={{ padding: '16px 14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '13px 18px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: '0.95rem',
                  letterSpacing: '0.05em',
                  transition: 'all 0.2s ease',
                  background: isActive ? '#C0392B' : 'transparent',
                  color: isActive ? 'white' : '#999',
                })}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div style={{ padding: '14px', borderTop: '1px solid rgba(192,57,43,0.15)' }}>
          <button
            onClick={handleLogout}
            className="w-full cursor-pointer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '13px 18px',
              borderRadius: '10px',
              fontFamily: "'Oswald', sans-serif",
              fontSize: '0.95rem',
              letterSpacing: '0.05em',
              color: '#C0392B',
              background: 'rgba(192,57,43,0.08)',
              border: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <FiLogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-6 h-16 flex-shrink-0"
          style={{ background: '#0F0F0F', borderBottom: '1px solid rgba(192,57,43,0.2)' }}
        >
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden cursor-pointer"
              style={{ background: 'none', border: 'none', color: '#F5F5F0' }}
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu size={22} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '0.8rem',
                letterSpacing: '0.1em',
                color: '#D4AC0D',
                textTransform: 'uppercase',
                background: 'rgba(212,172,13,0.1)',
                padding: '6px 16px',
                borderRadius: '50px',
                border: '1px solid rgba(212,172,13,0.2)',
              }}
            >
              Admin
            </span>
            <button
              onClick={handleLogout}
              className="cursor-pointer"
              style={{ background: 'none', border: 'none', color: '#C0392B', padding: '4px' }}
              title="Logout"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
