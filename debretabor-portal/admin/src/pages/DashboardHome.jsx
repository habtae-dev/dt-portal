import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import {
  Newspaper, FileText, Briefcase, AlertCircle, Calendar, Bell, MapPin, Landmark, Shield, Users, Image, TrendingUp, Mail
} from 'lucide-react';

// `key` = field returned by GET /api/stats (backend/src/controllers/statsController.js)
const CARDS = [
  { key: 'news', title: 'News & Updates', icon: Newspaper, color: '#38bdf8', path: '/admin/news' },
  { key: 'tenders', title: 'Tenders', icon: FileText, color: '#34d399', path: '/admin/tenders' },
  { key: 'vacancies', title: 'Job Vacancies', icon: Briefcase, color: '#c084fc', path: '/admin/vacancies' },
  { key: 'complaints', title: 'Complaints', icon: AlertCircle, color: '#f87171', path: '/admin/complaints' },
  { key: 'events', title: 'City Events', icon: Calendar, color: '#fb923c', path: '/admin/events' },
  { key: 'noticeboard', title: 'Notices', icon: Bell, color: '#facc15', path: '/admin/noticeboard' },
  { key: 'places', title: 'Tourism Places', icon: MapPin, color: '#2dd4bf', path: '/admin/places' },
  { key: 'projects', title: 'City Projects', icon: Landmark, color: '#60a5fa', path: '/admin/projects' },
  { key: 'photos', title: 'Photo Albums', icon: Image, color: '#a78bfa', path: '/admin/photogallery' },
  { key: 'business', title: 'Business Guides', icon: TrendingUp, color: '#4ade80', path: '/admin/business' },
  { key: 'subCities', title: 'Sub-Cities', icon: Users, color: '#fbbf24', path: '/admin/subcities' },
  { key: 'executive', title: 'Executive Content', icon: Shield, color: '#f472b6', path: '/admin/executive' },
  { key: 'subscribers', title: 'E-mail Subscribers', icon: Mail, color: '#22d3ee', path: '/admin/subscribers' }
];

export default function DashboardHome() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});
  const [status, setStatus] = useState('loading');

  let user = null;
  try { user = JSON.parse(localStorage.getItem('adminUser') || 'null'); } catch { /* ignore */ }

  useEffect(() => {
    // one lightweight request: COUNT(*) per table
    axios.get('/api/stats')
      .then((res) => { setCounts(res.data.data || {}); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '24px', color: '#fff', fontWeight: 700 }}>Welcome back{user?.username ? `, ${user.username}` : ''}</h2>
        <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Overview of everything published on the Debre Tabor City portal.</p>
      </div>

      {status === 'ready' && counts.pendingComplaints > 0 && (
        <button
          onClick={() => navigate('/admin/complaints')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', marginBottom: '20px', padding: '14px 18px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.5)', borderRadius: '10px', color: '#fecaca', cursor: 'pointer', fontSize: '14px' }}
        >
          <AlertCircle size={20} />
          <span><strong>{counts.pendingComplaints}</strong> citizen complaint{counts.pendingComplaints === 1 ? '' : 's'} waiting for review →</span>
        </button>
      )}

      {status === 'loading' && <p style={{ color: '#94a3b8' }}>Loading…</p>}
      {status === 'error' && <p style={{ color: '#fca5a5' }}>Could not load the overview. Check that the API is running and try again.</p>}

      {status === 'ready' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {CARDS.map(({ key, title, icon: Icon, color, path }) => (
            <button
              key={key}
              onClick={() => navigate(path)}
              style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', color: '#fff' }}
            >
              <span>
                <span style={{ display: 'block', fontSize: '13px', color: '#94a3b8' }}>{title}</span>
                <span style={{ display: 'block', fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>{counts[key] ?? 0}</span>
              </span>
              <span style={{ background: `${color}22`, padding: '12px', borderRadius: '10px', color, display: 'flex' }}><Icon size={22} /></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
