import React, { useState, useEffect } from 'react';
import { API_ORIGIN } from '../config';
import axios from '../api';
import { User, Lock, Mail, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState({ username: '', email: '', role: '', is_active: true });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_ORIGIN}/api/auth/profile`);
      if (res.data.success) {
        setProfile(res.data.user);
      }
    } catch (err) {
      setError('Failed to load profile data.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await axios.put(`${API_ORIGIN}/api/auth/profile`, {
        username: profile.username,
        email: profile.email,
        current_password: passwords.current_password || undefined,
        new_password: passwords.new_password || undefined
      });

      if (res.data.success) {
        setMessage('Profile updated successfully!');
        setPasswords({ current_password: '', new_password: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', color: '#f8fafc' }}>
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '22px', color: '#ffffff', fontWeight: '700' }}>Admin Profile & Security</h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Manage your account credentials and security settings based on system records.</p>
      </div>

      {message && (
        <div style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid #34d399', padding: '12px 16px', borderRadius: '8px', color: '#34d399', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={18} /> {message}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid #f87171', padding: '12px 16px', borderRadius: '8px', color: '#f87171', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <form onSubmit={handleUpdate} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)' }}>
        
        {/* Role & Status Info Badge */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}>
            <Shield size={16} /> Role: {profile.role || 'Admin'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}>
            Status: Active
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#cbd5e1' }}>
            <User size={16} color="#38bdf8" /> Username
          </label>
          <input 
            type="text" 
            value={profile.username} 
            onChange={(e) => setProfile({ ...profile, username: e.target.value })} 
            style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', fontSize: '14px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#cbd5e1' }}>
            <Mail size={16} color="#38bdf8" /> Email Address
          </label>
          <input 
            type="email" 
            value={profile.email} 
            onChange={(e) => setProfile({ ...profile, email: e.target.value })} 
            style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', fontSize: '14px' }}
            required
          />
        </div>

        <hr style={{ margin: '25px 0', border: '0', borderTop: '1px solid #334155' }} />

        <h4 style={{ margin: '0 0 15px 0', color: '#ffffff', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={16} color="#c084fc" /> Password Management
        </h4>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#cbd5e1' }}>Current Password</label>
          <input 
            type="password" 
            value={passwords.current_password} 
            onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })} 
            placeholder="Enter current password if changing"
            style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#cbd5e1' }}>New Password</label>
          <input 
            type="password" 
            value={passwords.new_password} 
            onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })} 
            placeholder="Leave blank to keep existing password"
            style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', fontSize: '14px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
        >
          {loading ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
}