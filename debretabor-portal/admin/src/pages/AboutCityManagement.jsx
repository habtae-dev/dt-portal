import React, { useState, useEffect, useCallback } from 'react';
import { API_ORIGIN, assetUrl } from '../config';
import axios from '../api';
import { Pencil, X, Image as ImageIcon } from 'lucide-react';

// The four fixed "About Debre Tabor" sections (about_city.category is UNIQUE -> one row per section).
const SECTIONS = [
  { key: 'history', label: 'History (ታሪክ)' },
  { key: 'geography', label: 'Geography (መልክዓ ምድር)' },
  { key: 'community', label: 'Community (ማህበረሰብ)' },
  { key: 'city_administration', label: 'City Administration (የከተማ አስተዳደር)' }
];

const input = { padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '6px', width: '100%', boxSizing: 'border-box' };
const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' };
const EMPTY = { title_en: '', title_am: '', content_en: '', content_am: '', is_published: true };

export default function AboutCityManagement() {
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // section key
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${API_ORIGIN}/api/about/admin/all`);
      setItems(Object.fromEntries((res.data.data || []).map((r) => [r.category, r])));
    } catch (err) {
      console.error('Error loading about sections:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const open = (key) => {
    const row = items[key];
    setForm(row ? Object.fromEntries(Object.keys(EMPTY).map((k) => [k, row[k] ?? EMPTY[k]])) : EMPTY);
    setImage(null);
    setEditing(key);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v ?? ''));
      if (image) data.append('image', image);
      await axios.put(`${API_ORIGIN}/api/about/${editing}`, data);
      setEditing(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save this section.');
    } finally {
      setSaving(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div style={{ padding: '20px', color: '#f8fafc', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ ...card, padding: '18px', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#ffffff' }}>About Debre Tabor (ስለ ደብረ ታቦር)</h3>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
          Edit the four public "About" pages in English and Amharic. A section with no saved content shows the built-in default text on the public site.
        </p>
      </div>

      {loading ? <p style={{ color: '#94a3b8' }}>Loading...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {SECTIONS.map(({ key, label }) => {
            const row = items[key];
            return (
              <div key={key} style={{ ...card, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '120px', backgroundColor: '#0f172a' }}>
                  {row?.image_url ? <img src={assetUrl(row.image_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={32} color="#475569" /></div>}
                </div>
                <div style={{ padding: '15px', flex: 1 }}>
                  <h4 style={{ margin: '0 0 6px', color: '#fff' }}>{label}</h4>
                  {row ? (
                    <>
                      <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#cbd5e1' }}>{row.title_en}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: row.is_published ? '#34d399' : '#fbbf24' }}>
                        {row.is_published ? 'Published' : 'Draft (hidden)'} · {row.title_am ? 'EN + አማ' : 'EN only'}
                      </p>
                    </>
                  ) : <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Not set — default text is shown.</p>}
                </div>
                <div style={{ padding: '10px 15px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => open(key)} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <Pencil size={15} /> {row ? 'Edit' : 'Create'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ ...card, padding: '25px', width: '760px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>{SECTIONS.find((s) => s.key === editing).label}</h3>
              <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            <form onSubmit={save}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <input style={input} placeholder="Title (EN) *" value={form.title_en} onChange={set('title_en')} required maxLength={255} />
                <input style={input} placeholder="ርዕስ (አማርኛ)" value={form.title_am} onChange={set('title_am')} maxLength={255} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <textarea style={input} rows="10" placeholder="Content (EN) *" value={form.content_en} onChange={set('content_en')} required />
                <textarea style={input} rows="10" placeholder="ይዘት (አማርኛ)" value={form.content_am} onChange={set('content_am')} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#cbd5e1' }}>Cover image {items[editing]?.image_url && '(leave empty to keep current)'}</label>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImage(e.target.files[0] || null)} style={{ fontSize: '11px' }} />
                </div>
                <select style={input} value={String(form.is_published)} onChange={(e) => setForm({ ...form, is_published: e.target.value === 'true' })}>
                  <option value="true">Published</option>
                  <option value="false">Draft</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setEditing(null)} style={{ padding: '8px 16px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
