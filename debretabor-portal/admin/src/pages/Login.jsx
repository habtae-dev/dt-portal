import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';

const field = { width: '100%', padding: '11px 12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#f8fafc' };

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not sign in. Check your credentials and that the server is running.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '16px', background: '#0f172a' }}>
      <form onSubmit={handleLogin} style={{ background: '#1e293b', border: '1px solid #334155', padding: '32px', borderRadius: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.35)', width: '380px', maxWidth: '100%' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '22px', color: '#38bdf8', textAlign: 'center' }}>DT Admin Portal</h1>
        <p style={{ margin: '0 0 22px', fontSize: '13px', color: '#94a3b8', textAlign: 'center' }}>Debre Tabor City Administration</p>
        {error && <p role="alert" style={{ color: '#fca5a5', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.4)', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', margin: '0 0 14px' }}>{error}</p>}
        <label htmlFor="email" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#cbd5e1' }}>Email</label>
        <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ ...field, marginBottom: '14px' }} />
        <label htmlFor="password" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#cbd5e1' }}>Password</label>
        <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ ...field, marginBottom: '20px' }} />
        <button type="submit" disabled={busy} style={{ width: '100%', padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
