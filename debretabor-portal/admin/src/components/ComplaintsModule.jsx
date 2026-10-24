import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trash2, Eye, X, Search, Paperclip } from 'lucide-react';
import api from '../api';

// complaints.status ENUM
const STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
const TONES = {
  Pending: ['#fbbf24', 'rgba(251,191,36,0.15)'],
  'In Progress': ['#38bdf8', 'rgba(56,189,248,0.15)'],
  Resolved: ['#34d399', 'rgba(52,211,153,0.15)'],
  Rejected: ['#f87171', 'rgba(248,113,113,0.15)']
};

const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' };
const input = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#f8fafc' };
const th = { padding: '12px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94a3b8', borderBottom: '1px solid #334155', whiteSpace: 'nowrap' };
const td = { padding: '12px 16px', borderBottom: '1px solid #273449', fontSize: '14px', verticalAlign: 'top' };

const fmt = (v) => (v ? String(v).replace('T', ' ').slice(0, 16) : '—');

function StatusBadge({ status }) {
  const [color, bg] = TONES[status] || TONES.Pending;
  return <span style={{ color, background: bg, padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{status}</span>;
}

export default function ComplaintsModule() {
  const [rows, setRows] = useState([]);
  const [state, setState] = useState('loading');
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('Pending');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notify, setNotify] = useState(true);   // e-mail the citizen about this update
  const [flash, setFlash] = useState(null);     // { ok, text } result of the last save, incl. the e-mail outcome

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/complaints');
      setRows(Array.isArray(res.data) ? res.data : res.data.data || []);
      setState('ready');
    } catch {
      setState('error');
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) =>
      (filter === 'All' || r.status === filter) &&
      (!q || [r.tracking_code, r.citizen_name, r.subject, r.department, r.phone].some((v) => String(v || '').toLowerCase().includes(q)))
    );
  }, [rows, filter, query]);

  const open = (row) => { setSelected(row); setStatus(row.status); setNotes(row.admin_notes || ''); setError(''); setNotify(true); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const res = await api.put(`/api/complaints/${selected.id}`, { status, admin_notes: notes, notify });
      const r = res.data || {};
      const to = selected.email;
      setFlash(
        r.email === 'sent' ? { ok: true, text: `Saved. The citizen was e-mailed at ${to}.` }
        : r.email === 'failed' ? { ok: false, text: `Saved, but the e-mail to ${to} could NOT be sent: ${r.error || 'unknown error'}` }
        : r.email === 'not-configured' ? { ok: false, text: `Saved, but e-mail is not set up on the server (${r.error || 'see docs/EMAIL.md'}).` }
        : r.email === 'no-address' ? { ok: true, text: 'Saved. The citizen gave no e-mail address, so no message was sent (they can still track with their code).' }
        : { ok: true, text: 'Saved.' }
      );
      setSelected(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update this complaint.');
    } finally {
      setSaving(false);
    }
  };

  // attachments are private: fetch them with the staff token and open the result in a new tab
  const openAttachment = async (row) => {
    try {
      const res = await api.get(`/api/complaints/${row.id}/attachment`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      alert('Could not open the attachment.');
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete complaint ${row.tracking_code}? This cannot be undone.`)) return;
    try { await api.delete(`/api/complaints/${row.id}`); load(); }
    catch (err) { alert(err.response?.data?.message || 'Could not delete this complaint.'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#94a3b8' }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search code, name, subject, phone…" style={{ ...input, paddingLeft: '36px' }} />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ ...input, width: 'auto', minWidth: '160px' }} aria-label="Filter by status">
          <option value="All">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {flash && (
        <div role="status" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 14, padding: '10px 14px', borderRadius: 8, fontSize: 14, background: flash.ok ? 'rgba(52,211,153,.12)' : 'rgba(251,146,60,.12)', border: `1px solid ${flash.ok ? '#34d399' : '#fb923c'}`, color: flash.ok ? '#6ee7b7' : '#fdba74' }}>
          <span>{flash.text}</span>
          <button type="button" aria-label="Dismiss" onClick={() => setFlash(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {state === 'loading' && <p style={{ color: '#94a3b8' }}>Loading…</p>}
      {state === 'error' && <p style={{ color: '#fca5a5' }}>Could not load complaints.</p>}

      {state === 'ready' && (
        <div style={{ ...card, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
            <thead>
              <tr>{['Code', 'Citizen', 'Department', 'Subject', 'Received', 'Status', ''].map((h) => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id}>
                  <td style={{ ...td, fontWeight: 700, color: '#60a5fa', whiteSpace: 'nowrap' }}>{r.tracking_code}</td>
                  <td style={td}>{r.citizen_name}<div style={{ color: '#94a3b8', fontSize: '12px' }}>{r.phone}</div></td>
                  <td style={td}>{r.department}</td>
                  <td style={td}>{r.subject}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap', color: '#94a3b8' }}>{fmt(r.created_at)}</td>
                  <td style={td}><StatusBadge status={r.status} /></td>
                  <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button onClick={() => open(r)} title="View / update" aria-label="View or update" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#60a5fa', marginRight: 10 }}><Eye size={17} /></button>
                    <button onClick={() => remove(r)} title="Delete" aria-label="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}><Trash2 size={17} /></button>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: '#94a3b8', padding: '32px' }}>No complaints match.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px' }}>
          <form onSubmit={save} style={{ ...card, width: '560px', maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>{selected.tracking_code}</h3>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>

            <dl style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '6px 12px', margin: '0 0 16px', fontSize: '14px' }}>
              <dt style={{ color: '#94a3b8' }}>Citizen</dt><dd style={{ margin: 0 }}>{selected.citizen_name}</dd>
              <dt style={{ color: '#94a3b8' }}>Phone</dt><dd style={{ margin: 0 }}>{selected.phone}</dd>
              <dt style={{ color: '#94a3b8' }}>Email</dt><dd style={{ margin: 0 }}>{selected.email || '—'}</dd>
              <dt style={{ color: '#94a3b8' }}>Department</dt><dd style={{ margin: 0 }}>{selected.department}</dd>
              <dt style={{ color: '#94a3b8' }}>Received</dt><dd style={{ margin: 0 }}>{fmt(selected.created_at)}</dd>
              <dt style={{ color: '#94a3b8' }}>Subject</dt><dd style={{ margin: 0, fontWeight: 600 }}>{selected.subject}</dd>
            </dl>
            <p style={{ background: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '8px', fontSize: '14px', color: '#cbd5e1', whiteSpace: 'pre-wrap', margin: '0 0 12px' }}>{selected.description}</p>
            {selected.attachment_url && (
              <button type="button" onClick={() => openAttachment(selected)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '14px', marginBottom: '16px' }}>
                <Paperclip size={15} /> Open attachment
              </button>
            )}

            <label style={{ display: 'block', margin: '8px 0 6px', fontWeight: 600, fontSize: '14px' }} htmlFor="c-status">Status</label>
            <select id="c-status" value={status} onChange={(e) => setStatus(e.target.value)} style={input}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <label style={{ display: 'block', margin: '14px 0 6px', fontWeight: 600, fontSize: '14px' }} htmlFor="c-notes">Note shown to the citizen when they track this complaint</label>
            <textarea id="c-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} style={{ ...input, resize: 'vertical' }} placeholder="Response or action taken…" />

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 14, color: selected.email ? '#e2e8f0' : '#64748b' }}>
              <input type="checkbox" checked={notify && !!selected.email} disabled={!selected.email} onChange={(e) => setNotify(e.target.checked)} />
              {selected.email ? `E-mail this status and note to the citizen (${selected.email})` : 'The citizen gave no e-mail address: nothing will be e-mailed'}
            </label>

            {error && <p style={{ color: '#fca5a5', fontSize: '14px', margin: '12px 0 0' }}>{error}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
              <button type="button" onClick={() => setSelected(null)} style={{ padding: '9px 16px', background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ padding: '9px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
