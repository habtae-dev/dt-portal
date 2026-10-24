import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, User, Newspaper, FileText, Briefcase, AlertCircle,
  Calendar, Bell, Image, Video, MapPin, TrendingUp, Landmark, Building2,
  Users, Info, ShieldAlert, LogOut, MapPinned, Mail
} from 'lucide-react';

const MENU = [
  { label: 'Dashboard Home', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Admin Profile', path: '/admin/profile', icon: User },
  { label: 'News & Updates', path: '/admin/news', icon: Newspaper },
  { label: 'Tenders', path: '/admin/tenders', icon: FileText },
  { label: 'Job Vacancies', path: '/admin/vacancies', icon: Briefcase },
  { label: 'Citizen Complaints', path: '/admin/complaints', icon: AlertCircle },
  { label: 'Events', path: '/admin/events', icon: Calendar },
  { label: 'Noticeboard', path: '/admin/noticeboard', icon: Bell },
  { label: 'Photo Gallery', path: '/admin/photogallery', icon: Image },
  { label: 'Video Gallery', path: '/admin/videogallery', icon: Video },
  { label: 'Tourism Places', path: '/admin/places', icon: MapPin },
  { label: 'Doing Business', path: '/admin/business', icon: TrendingUp },
  { label: 'Projects', path: '/admin/projects', icon: Landmark },
  { label: 'City Council', path: '/admin/council', icon: Building2 },
  { label: 'Sub-Cities', path: '/admin/subcities', icon: Users },
  { label: 'Executive Cabinet', path: '/admin/executive', icon: ShieldAlert },
  { label: 'About City', path: '/admin/about', icon: Info },
  { label: 'City Facts', path: '/admin/cityfacts', icon: MapPinned },
  { label: 'E-mail Subscribers', path: '/admin/subscribers', icon: Mail }
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  let user = null;
  try { user = JSON.parse(localStorage.getItem('adminUser') || 'null'); } catch { /* ignore corrupt value */ }

  // close the mobile drawer after every navigation
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const current = MENU.find((m) => m.path === location.pathname);

  return (
    <div className="dt-shell">
      <div className={`dt-backdrop${open ? ' open' : ''}`} onClick={() => setOpen(false)} />

      <aside className={`dt-sidebar${open ? ' open' : ''}`} aria-label="Main navigation">
        <div style={{ padding: '22px', fontSize: '18px', fontWeight: 700, borderBottom: '1px solid #334155', textAlign: 'center', color: '#38bdf8' }}>
          DT Admin Portal
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
          {MENU.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 20px',
                  backgroundColor: isActive ? '#3b82f6' : 'transparent', color: isActive ? '#ffffff' : '#94a3b8',
                  border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', fontWeight: isActive ? 600 : 400
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: '15px', borderTop: '1px solid #334155' }}>
          {user && (
            <div style={{ marginBottom: '10px', fontSize: '12px', color: '#94a3b8', textAlign: 'center', overflowWrap: 'anywhere' }}>
              {user.username || user.email} · {user.role}
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, justifyContent: 'center' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <div className="dt-main">
        <header className="dt-header">
          <button className="dt-menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
          <h1 style={{ color: '#ffffff', fontSize: '18px', margin: 0, fontWeight: 600, flex: 1 }}>{current?.label || 'Admin Portal'}</h1>
          <span className="dt-org" style={{ fontSize: '13px', color: '#94a3b8' }}>Debre Tabor City Administration</span>
        </header>
        <main className="dt-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
