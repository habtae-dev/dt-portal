
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';

import {
  Newspaper, FileText, Briefcase, AlertCircle,
  Calendar, Bell, MapPin, Landmark, Shield,
  Users, Image, TrendingUp, Mail, Video,
  RefreshCw, BarChart3, PieChart as PieIcon,
  Activity
} from 'lucide-react';

import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';

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
  { key: 'videos', title: 'Video Gallery', icon: Video, color: '#f472b6', path: '/admin/videogallery' },
  { key: 'business', title: 'Business Guides', icon: TrendingUp, color: '#4ade80', path: '/admin/business' },
  { key: 'council', title: 'Council Content', icon: Landmark, color: '#818cf8', path: null },
  { key: 'subCities', title: 'Sub-Cities', icon: Users, color: '#fbbf24', path: '/admin/subcities' },
  { key: 'executive', title: 'Executive Content', icon: Shield, color: '#f472b6', path: '/admin/executive' },
  { key: 'subscribers', title: 'E-mail Subscribers', icon: Mail, color: '#22d3ee', path: '/admin/subscribers' }
];

const COLORS = [
  '#38bdf8', '#34d399', '#c084fc', '#f87171',
  '#fb923c', '#facc15', '#2dd4bf', '#60a5fa',
  '#a78bfa', '#4ade80', '#fbbf24', '#f472b6',
  '#22d3ee', '#818cf8', '#fb7185'
];

const panelStyle = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '14px',
  padding: '20px',
  minWidth: 0
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid #475569',
      borderRadius: '8px',
      padding: '12px',
      color: '#fff'
    }}>
      <p style={{ margin: '0 0 8px', color: '#cbd5e1' }}>
        {label || payload[0].name}
      </p>

      {payload.map((item) => (
        <p key={item.dataKey} style={{
          margin: '4px 0',
          color: item.color || '#38bdf8'
        }}>
          {item.name}: {Number(item.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function DashboardHome() {
  const navigate = useNavigate();

  const [counts, setCounts] = useState({});
  const [status, setStatus] = useState('loading');

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem('adminUser') || 'null');
  } catch {
    user = null;
  }

  const fetchStats = useCallback(async () => {
    try {
      setStatus('loading');

      const res = await axios.get('/api/stats');

      if (!res.data?.success) {
        throw new Error('Invalid statistics response');
      }

      setCounts(res.data.data || {});
      setStatus('ready');
    } catch (error) {
      console.error('Dashboard stats error:', error);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const totalRecords = CARDS.reduce(
    (sum, card) => sum + Number(counts[card.key] || 0),
    0
  );

  const barData = CARDS.map(card => ({
    name: card.title,
    total: Number(counts[card.key] || 0)
  }));

  const pieData = (counts.complaintStatuses || []).filter(
    item => Number(item.value) > 0
  );

  const lineData = counts.lineChart || [];

  return (
    <div style={{
      width: '100%',
      color: '#fff',
      paddingBottom: '35px'
    }}>

      {/* HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{
            margin: '0 0 7px',
            fontSize: '25px',
            fontWeight: 700
          }}>
            Welcome back{user?.username ? `, ${user.username}` : ''}
          </h2>

          <p style={{
            margin: 0,
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            Debre Tabor City Administration Dashboard
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={status === 'loading'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={16} />
          {status === 'loading' ? 'Loading...' : 'Refresh Stats'}
        </button>
      </div>

      {status === 'loading' && (
        <p style={{ color: '#94a3b8', padding: '30px' }}>
          Loading dashboard statistics...
        </p>
      )}

      {status === 'error' && (
        <div style={{
          padding: '25px',
          background: '#451a1a',
          border: '1px solid #7f1d1d',
          borderRadius: '10px',
          color: '#fecaca'
        }}>
          <p>Could not load dashboard statistics.</p>
          <button onClick={fetchStats}>Try Again</button>
        </div>
      )}

      {status === 'ready' && (
        <>
          {/* 1. TOTAL RECORDS AT THE TOP */}
          <div style={{
            background: 'linear-gradient(120deg, #1d4ed8, #4338ca)',
            padding: '25px',
            borderRadius: '15px',
            marginBottom: '25px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div>
              <p style={{
                margin: '0 0 8px',
                color: '#dbeafe',
                fontSize: '15px'
              }}>
                TOTAL PORTAL RECORDS
              </p>

              <h1 style={{
                margin: 0,
                fontSize: '42px',
                fontWeight: 800
              }}>
                {totalRecords.toLocaleString()}
              </h1>

              <p style={{
                margin: '8px 0 0',
                color: '#bfdbfe',
                fontSize: '13px'
              }}>
                Across {CARDS.length} portal sections
              </p>
            </div>

            <BarChart3 size={55} color="#bfdbfe" />
          </div>

          {/* 2. FULL MONTHLY LINE CHART */}
          <section style={{ ...panelStyle, marginBottom: '22px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px'
            }}>
              <Activity color="#38bdf8" size={23} />

              <div>
                <h3 style={{ margin: 0, fontSize: '17px' }}>
                  Monthly Portal Activity
                </h3>
                <p style={{
                  margin: '5px 0 0',
                  color: '#94a3b8',
                  fontSize: '12px'
                }}>
                  News, Events and Complaints — last 12 months
                </p>
              </div>
            </div>

            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={360}>
                <LineChart
                  data={lineData}
                  margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    stroke="#334155"
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis
                    stroke="#94a3b8"
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                  />

                  <Tooltip content={<ChartTooltip />} />
                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="news"
                    name="News"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 7 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="events"
                    name="Events"
                    stroke="#fb923c"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 7 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="complaints"
                    name="Complaints"
                    stroke="#f87171"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: '#94a3b8' }}>
                No monthly activity data available.
              </p>
            )}
          </section>

          {/* 3. BAR AND PIE CHARTS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
            gap: '20px',
            marginBottom: '25px'
          }}>

            {/* BAR CHART */}
            <section style={panelStyle}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px'
              }}>
                <BarChart3 color="#38bdf8" size={22} />
                <h3 style={{ margin: 0, fontSize: '16px' }}>
                  All Portal Statistics
                </h3>
              </div>

              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={barData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 75 }}
                >
                  <CartesianGrid
                    stroke="#334155"
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    angle={-40}
                    textAnchor="end"
                    interval={0}
                    tick={{ fontSize: 10 }}
                  />

                  <YAxis
                    stroke="#94a3b8"
                    allowDecimals={false}
                  />

                  <Tooltip content={<ChartTooltip />} />

                  <Bar
                    dataKey="total"
                    name="Records"
                    fill="#38bdf8"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </section>

            {/* COMPLAINT PIE CHART */}
            <section style={panelStyle}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px'
              }}>
                <PieIcon color="#c084fc" size={22} />
                <h3 style={{ margin: 0, fontSize: '16px' }}>
                  Complaint Status Distribution
                </h3>
              </div>

              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={105}
                      paddingAngle={3}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((item, index) => (
                        <Cell
                          key={item.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip content={<ChartTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p style={{
                  color: '#94a3b8',
                  textAlign: 'center',
                  padding: '100px 0'
                }}>
                  No complaint status data available.
                </p>
              )}
            </section>
          </div>

          {/* 4. ALL STATISTICS CARDS AT THE BOTTOM */}
          <h3 style={{
            fontSize: '18px',
            margin: '10px 0 15px'
          }}>
            All Portal Statistics
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: '16px'
          }}>
            {CARDS.map(({ key, title, icon: Icon, color, path }) => {
              const cardContent = (
                <>
                  <span>
                    <span style={{
                      display: 'block',
                      fontSize: '13px',
                      color: '#94a3b8'
                    }}>
                      {title}
                    </span>

                    <span style={{
                      display: 'block',
                      fontSize: '28px',
                      fontWeight: 700,
                      marginTop: '5px'
                    }}>
                      {Number(counts[key] || 0).toLocaleString()}
                    </span>
                  </span>

                  <span style={{
                    background: `${color}22`,
                    padding: '12px',
                    borderRadius: '10px',
                    color,
                    display: 'flex'
                  }}>
                    <Icon size={23} />
                  </span>
                </>
              );

              return (
                <button
                  key={key}
                  onClick={() => path && navigate(path)}
                  disabled={!path}
                  style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: path ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    color: '#fff',
                    opacity: 1
                  }}
                >
                  {cardContent}
                </button>
              );
            })}
          </div>

          {/* 5. PENDING COMPLAINTS */}
          <button
            onClick={() => navigate('/admin/complaints')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '15px',
              width: '100%',
              marginTop: '22px',
              padding: '18px 20px',
              background: 'rgba(248,113,113,0.10)',
              border: '1px solid rgba(248,113,113,0.4)',
              borderRadius: '12px',
              color: '#fecaca',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <span>
              <strong>Pending Complaints</strong>
              <span style={{
                display: 'block',
                color: '#fca5a5',
                fontSize: '13px',
                marginTop: '5px'
              }}>
                Complaints waiting for administrator review
              </span>
            </span>

            <strong style={{ fontSize: '28px' }}>
              {Number(counts.pendingComplaints || 0)}
            </strong>
          </button>
        </>
      )}
    </div>
  );
}
