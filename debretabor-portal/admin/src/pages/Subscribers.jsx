import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { Send, Trash2, Search, Mail, CheckCircle2, AlertTriangle } from 'lucide-react';

const input = { width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' };
const label = { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#cbd5e1' };
const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', marginBottom: '24px' };

// Where each announcement type lives on the public site and which fields give its title.
const SOURCES = {
  news: { label: 'News', api: '/api/news', path: '/announcements/news', title: 'title' },
  vacancies: { label: 'Job vacancy', api: '/api/vacancies', path: '/announcements/vacancy', title: 'title' },
  tenders: { label: 'Tender', api: '/api/tenders', path: '/announcements/tender', title: 'title' },
  events: { label: 'Event', api: '/api/events', path: '/announcements/events', title: 'title' },
  noticeboard: { label: 'Notice', api: '/api/noticeboard', path: '/announcements/notices', title: 'title' }
};
const SITE_URL = (import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5173').replace(/\/+$/, '');
const EMPTY = { subject_en: '', message_en: '', subject_am: '', message_am: '', link: '' };

export default function Subscribers() {
  const [rows, setRows] = useState([]);
  const [mail, setMail] = useState(null);   // { configured, working, error, problems, from, provider }
  const [testTo, setTestTo] = useState('');
  const [testMsg, setTestMsg] = useState(null);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState(EMPTY);
  const [kind, setKind] = useState('');
  const [items, setItems] = useState([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/subscribers');
      setRows(res.data.data || []);
    } catch (e) { setResult({ ok: false, text: e.response?.data?.message || 'Could not load subscribers.' }); } finally { setLoading(false); }
  }, []);
  const checkMail = useCallback(async () => {
    setMail(null);
    try { setMail((await api.get('/api/subscribers/mail-status')).data.data); }
    catch (e) { setMail({ configured: false, working: false, error: e.response?.data?.message || 'Could not check the e-mail settings.', problems: [] }); }
  }, []);
  useEffect(() => { load(); checkMail(); }, [load, checkMail]);
  const mailOk = !!(mail && mail.working);

  const sendTest = async () => {
    setTesting(true); setTestMsg(null);
    try {
      const r = await api.post('/api/subscribers/test', testTo.trim() ? { to: testTo.trim() } : {});
      setTestMsg({ ok: true, text: r.data.message });
    } catch (e) { setTestMsg({ ok: false, text: e.response?.data?.message || 'Test failed.' }); }
    finally { setTesting(false); checkMail(); }
  };

  // choose "Vacancy" etc. -> list the latest published items to prefill the message
  useEffect(() => {
    if (!kind) { setItems([]); return; }
    api.get(SOURCES[kind].api, { params: { limit: 20 } }).then((r) => setItems(r.data.data || [])).catch(() => setItems([]));
  }, [kind]);

  const prefill = (id) => {
    const it = items.find((x) => String(x.id) === id);
    if (!it) return;
    const s = SOURCES[kind];
    setMsg({
      subject_en: `${s.label}: ${it[`${s.title}_en`] || ''}`.slice(0, 200),
      subject_am: it[`${s.title}_am`] || '',
      message_en: `A new ${s.label.toLowerCase()} has been published on the Debre Tabor City Administration website:\n\n${it[`${s.title}_en`] || ''}`,
      message_am: it[`${s.title}_am`] ? `በደብረ ታቦር ከተማ አስተዳደር ድረ-ገጽ አዲስ መረጃ ታትሟል፦\n\n${it[`${s.title}_am`]}` : '',
      link: `${SITE_URL}${s.path}/${it.id}`
    });
  };

  const send = async (e) => {
    e.preventDefault();
    const active = rows.filter((r) => r.is_active).length;
    if (!window.confirm(`Send this e-mail to ${active} active subscriber(s)?`)) return;
    setSending(true); setResult(null);
    try {
      const res = await api.post('/api/subscribers/broadcast', msg);
      setResult({ ok: !res.data.failed, text: `Sent to ${res.data.sent} of ${res.data.total} subscribers${res.data.failed ? ` (${res.data.failed} failed: ${res.data.error || 'unknown error'})` : ''}.` });
      setMsg(EMPTY); setKind('');
    } catch (err) { setResult({ ok: false, text: err.response?.data?.message || 'Sending failed.' }); } finally { setSending(false); }
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete ${r.email}?`)) return;
    try { await api.delete(`/api/subscribers/${r.id}`); load(); } catch { alert('Failed to delete.'); }
  };

  const shown = rows.filter((r) => r.email.toLowerCase().includes(q.trim().toLowerCase()));
  const active = rows.filter((r) => r.is_active).length;
  const set = (k) => (e) => setMsg({ ...msg, [k]: e.target.value });

  return (
    <div style={{ color: '#f8fafc' }}>
      <h3 style={{ margin: '0 0 5px 0', fontSize: '22px', color: '#ffffff', fontWeight: 700 }}>E-mail Subscribers (ተመዝጋቢዎች)</h3>
      <p style={{ margin: '0 0 22px', fontSize: '14px', color: '#94a3b8' }}>
        Citizens who subscribed on the website: {rows.length} total, {active} active. Complaint replies are e-mailed automatically when you change a complaint’s status (if the citizen gave an address).
      </p>

      <div style={{ ...card, borderColor: mail === null ? '#334155' : mailOk ? '#34d399' : '#fb923c' }}>
        <h4 style={{ margin: '0 0 8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {mailOk ? <CheckCircle2 size={18} color="#34d399" /> : <AlertTriangle size={18} color="#fb923c" />} E-mail status
        </h4>
        {mail === null ? <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>Checking the mail server…</p> : mailOk ? (
          <p style={{ margin: 0, color: '#6ee7b7', fontSize: 14 }}>Working. Sending from <b>{mail.from}</b> via {mail.provider}.</p>
        ) : (
          <div style={{ fontSize: 14, color: '#fdba74' }}>
            <p style={{ margin: '0 0 6px' }}><b>E-mail is not working yet.</b> {mail.error}</p>
            {mail.problems?.length > 0 && <ul style={{ margin: '0 0 6px 18px', padding: 0 }}>{mail.problems.map((p) => <li key={p}>{p}</li>)}</ul>}
            <p style={{ margin: 0, color: '#94a3b8' }}>Fix <code>backend/.env</code> (see docs/EMAIL.md), restart the backend, then press “Check again”. Subscriptions are still being saved.</p>
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14, alignItems: 'center' }}>
          <input style={{ ...input, flex: '1 1 240px', width: 'auto' }} type="email" placeholder="Send a test e-mail to… (blank = my own address)" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
          <button type="button" onClick={sendTest} disabled={testing || !mail?.configured} style={{ padding: '10px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', opacity: testing || !mail?.configured ? 0.5 : 1 }}>{testing ? 'Sending…' : 'Send test e-mail'}</button>
          <button type="button" onClick={checkMail} style={{ padding: '10px 16px', background: 'transparent', color: '#93c5fd', border: '1px solid #334155', borderRadius: 6, cursor: 'pointer' }}>Check again</button>
        </div>
        {testMsg && <p role="status" style={{ margin: '10px 0 0', fontSize: 13, color: testMsg.ok ? '#34d399' : '#f87171' }}>{testMsg.text}</p>}
      </div>

      <form onSubmit={send} style={card}>
        <h4 style={{ margin: '0 0 14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}><Send size={17} /> Send an update to all active subscribers</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={label}>Start from a published item (optional)</label>
            <select style={input} value={kind} onChange={(e) => { setKind(e.target.value); }}>
              <option value="">Write my own message</option>
              {Object.entries(SOURCES).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
            </select>
          </div>
          {kind && (
            <div>
              <label style={label}>Item</label>
              <select style={input} defaultValue="" onChange={(e) => prefill(e.target.value)}>
                <option value="" disabled>Choose…</option>
                {items.map((it) => <option key={it.id} value={it.id}>{it[`${SOURCES[kind].title}_en`]}</option>)}
              </select>
            </div>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '14px' }}>
          <div><label style={label}>Subject (English) *</label><input style={input} required maxLength={200} value={msg.subject_en} onChange={set('subject_en')} /></div>
          <div><label style={label}>Subject (Amharic)</label><input style={input} maxLength={200} value={msg.subject_am} onChange={set('subject_am')} /></div>
          <div><label style={label}>Message (English) *</label><textarea style={{ ...input, height: '110px' }} required maxLength={10000} value={msg.message_en} onChange={set('message_en')} /></div>
          <div><label style={label}>Message (Amharic) — sent to Amharic subscribers</label><textarea style={{ ...input, height: '110px' }} maxLength={10000} value={msg.message_am} onChange={set('message_am')} /></div>
        </div>
        <div style={{ marginTop: '14px' }}><label style={label}>Link (optional, https://…)</label><input style={input} type="url" maxLength={500} value={msg.link} onChange={set('link')} /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button type="submit" disabled={sending || !mailOk || active === 0} style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', opacity: sending || !mailOk || active === 0 ? 0.5 : 1 }}>
            {sending ? 'Sending…' : `Send to ${active} subscriber(s)`}
          </button>
          {!mailOk && mail && <span style={{ fontSize: 12, color: '#fdba74' }}>Sending is disabled until e-mail status above is “Working”.</span>}
          {result && <span role="status" style={{ fontSize: '13px', color: result.ok ? '#34d399' : '#f87171' }}>{result.text}</span>}
        </div>
      </form>

      <div style={{ marginBottom: '14px', position: 'relative' }}>
        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input style={{ ...input, padding: '10px 12px 10px 40px' }} placeholder="Search e-mail…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {loading ? <p style={{ color: '#94a3b8' }}>Loading…</p> : (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '480px' }}>
            <thead><tr style={{ backgroundColor: '#0f172a', color: '#94a3b8', fontSize: '13px' }}>
              {['E-mail', 'Language', 'Status', 'Subscribed', ''].map((h, i) => <th key={i} style={{ padding: '14px 18px' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {shown.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}><Mail size={16} style={{ verticalAlign: 'middle' }} /> No subscribers found.</td></tr>
              ) : shown.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid #334155', fontSize: '14px', color: '#cbd5e1' }}>
                  <td style={{ padding: '12px 18px', color: '#fff' }}>{r.email}</td>
                  <td style={{ padding: '12px 18px' }}>{r.language === 'am' ? 'አማርኛ' : 'English'}</td>
                  <td style={{ padding: '12px 18px', color: r.is_active ? '#34d399' : '#f87171' }}>{r.is_active ? 'Active' : 'Unsubscribed'}</td>
                  <td style={{ padding: '12px 18px', color: '#94a3b8' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 18px', textAlign: 'right' }}><button aria-label={`Delete ${r.email}`} onClick={() => remove(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
