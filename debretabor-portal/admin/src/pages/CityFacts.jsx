import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { Plus, Trash2, Edit, X, MapPinned } from 'lucide-react';

const EMPTY = { label_en: '', label_am: '', value_en: '', value_am: '', note_en: '', note_am: '', icon: '', sort_order: 0, is_published: true };
const input = { width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' };
const label = { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#cbd5e1' };

export default function CityFacts() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null); // null = closed
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/city-facts/admin/all');
      setRows(res.data.data || []);
    } catch (e) { setError(e.response?.data?.message || 'Could not load city facts.'); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const open = (item) => {
    setError('');
    setEditId(item ? item.id : null);
    setForm(item ? Object.fromEntries(Object.keys(EMPTY).map((k) => [k, item[k] ?? EMPTY[k]])) : { ...EMPTY, sort_order: rows.length + 1 });
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const body = { ...form, sort_order: Number(form.sort_order) || 0 };
      if (editId) await api.put(`/api/city-facts/${editId}`, body); else await api.post('/api/city-facts', body);
      setForm(null); load();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save.'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this fact?')) return;
    try { await api.delete(`/api/city-facts/${id}`); load(); } catch { alert('Failed to delete.'); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div style={{ color: '#f8fafc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '22px', color: '#ffffff', fontWeight: 700 }}>City Facts (ከተማዋ በጨረፍታ)</h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Area, population and other figures shown on the home page above “Latest Updates”. Only publish verified figures.</p>
        </div>
        <button onClick={() => open(null)} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
          <Plus size={18} /> Add Fact
        </button>
      </div>

      {error && !form && <p role="alert" style={{ color: '#f87171' }}>{error}</p>}
      {loading ? <p style={{ color: '#94a3b8' }}>Loading…</p> : (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '560px' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', color: '#94a3b8', fontSize: '13px' }}>
                {['Order', 'Label (EN / AM)', 'Value (EN / AM)', 'Status', ''].map((h, i) => <th key={i} style={{ padding: '14px 18px', textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}><MapPinned size={18} style={{ verticalAlign: 'middle' }} /> No facts yet. Add the city area and population.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid #334155', fontSize: '14px', color: '#cbd5e1' }}>
                  <td style={{ padding: '14px 18px' }}>{r.sort_order}</td>
                  <td style={{ padding: '14px 18px', color: '#fff', fontWeight: 600 }}>{r.icon} {r.label_en}{r.label_am && <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 400 }}>{r.label_am}</div>}</td>
                  <td style={{ padding: '14px 18px' }}>{r.value_en}{r.value_am && <div style={{ fontSize: '12px', color: '#94a3b8' }}>{r.value_am}</div>}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: r.is_published ? '#34d399' : '#f87171', background: r.is_published ? 'rgba(52,211,153,.1)' : 'rgba(248,113,113,.1)' }}>{r.is_published ? 'Published' : 'Hidden'}</span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button aria-label="Edit" onClick={() => open(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#38bdf8', marginRight: '12px' }}><Edit size={16} /></button>
                    <button aria-label="Delete" onClick={() => remove(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '12px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px', width: '640px', maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>{editId ? 'Edit Fact' : 'New Fact'}</h3>
              <button aria-label="Close" onClick={() => setForm(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={save}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div><label style={label}>Label (English) *</label><input style={input} required maxLength={100} value={form.label_en} onChange={set('label_en')} placeholder="Area" /></div>
                <div><label style={label}>Label (Amharic)</label><input style={input} maxLength={100} value={form.label_am} onChange={set('label_am')} placeholder="ስፋት" /></div>
                <div><label style={label}>Value (English) *</label><input style={input} required maxLength={100} value={form.value_en} onChange={set('value_en')} placeholder="e.g. 1,234 km²" /></div>
                <div><label style={label}>Value (Amharic)</label><input style={input} maxLength={100} value={form.value_am} onChange={set('value_am')} /></div>
                <div><label style={label}>Note (English)</label><input style={input} maxLength={150} value={form.note_en} onChange={set('note_en')} placeholder="e.g. source or year" /></div>
                <div><label style={label}>Note (Amharic)</label><input style={input} maxLength={150} value={form.note_am} onChange={set('note_am')} /></div>
                <div><label style={label}>Icon (emoji)</label><input style={input} maxLength={16} value={form.icon} onChange={set('icon')} placeholder="🗺️" /></div>
                <div><label style={label}>Order</label><input style={input} type="number" value={form.sort_order} onChange={set('sort_order')} /></div>
                <div><label style={label}>Status</label>
                  <select style={input} value={String(form.is_published)} onChange={(e) => setForm({ ...form, is_published: e.target.value === 'true' })}>
                    <option value="true">Published</option><option value="false">Hidden</option>
                  </select>
                </div>
              </div>
              {error && <p role="alert" style={{ color: '#f87171', fontSize: '13px' }}>{error}</p>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #334155', paddingTop: '14px' }}>
                <button type="button" onClick={() => setForm(null)} style={{ padding: '10px 18px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 18px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
