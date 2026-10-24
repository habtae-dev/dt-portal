// E-mail sending (SMTP via nodemailer). Optional: with no SMTP settings the portal still works and
// sendMail() just reports { sent:false, reason:'not-configured' }.
//
// Settings (backend/.env):
//   Gmail / Google Workspace (easiest):  SMTP_SERVICE=gmail  SMTP_USER=you@gmail.com  SMTP_PASS=<16-char App Password>
//   Any other provider:                  SMTP_HOST=...  SMTP_PORT=587  SMTP_SECURE=false  SMTP_USER=...  SMTP_PASS=...
//   Sender shown to readers:             MAIL_FROM="Debre Tabor City Administration <address>"  (defaults to SMTP_USER)
//   Public website address (links):      PUBLIC_SITE_URL=https://...
let transport;
let transportKey = '';
let loadError;

const env = (k) => String(process.env[k] || '').trim();
const looksLikeEmail = (s) => /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(s);

// Reads the settings every time so they are always the ones the server was started with.
function settings() {
  const service = env('SMTP_SERVICE').toLowerCase();
  const host = env('SMTP_HOST');
  const user = env('SMTP_USER');
  let pass = String(process.env.SMTP_PASS || '');
  // Google shows App Passwords as "abcd efgh ijkl mnop"; the spaces are not part of the password.
  if (service === 'gmail' || /gmail\.com$|googlemail\.com$/i.test(host)) pass = pass.replace(/\s+/g, '');
  const from = env('MAIL_FROM') || (looksLikeEmail(user) ? `Debre Tabor City Administration <${user}>` : '');
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = env('SMTP_SECURE').toLowerCase() === 'true' || port === 465;
  return { service, host, user, pass, from, port, secure };
}

// What is missing, in plain words (used by the dashboard and the startup log).
function problems() {
  const s = settings();
  const list = [];
  if (!s.service && !s.host) list.push('SMTP_HOST is empty (or set SMTP_SERVICE=gmail)');
  if (!s.from) list.push('MAIL_FROM is empty and SMTP_USER is not an e-mail address');
  if (s.user && !s.pass) list.push('SMTP_PASS is empty');
  if (s.user && !looksLikeEmail(s.user) && (s.service === 'gmail' || /gmail|google/i.test(s.host))) list.push('SMTP_USER must be your full Gmail address (name@gmail.com)');
  return list;
}

const configured = () => problems().length === 0;

function status() {
  const s = settings();
  const p = problems();
  const masked = s.user ? s.user.replace(/^(.).*(@.*)?$/, (m, a, b) => `${a}***${b || ''}`) : '';
  return { configured: p.length === 0, problems: p, provider: s.service || s.host || '', port: s.service ? undefined : s.port, secure: s.secure, user: masked, from: s.from, siteUrl: siteUrl() };
}

function getTransport() {
  const s = settings();
  const key = JSON.stringify([s.service, s.host, s.port, s.secure, s.user, s.pass]);
  if (transport && key === transportKey) return transport;
  try {
    const nodemailer = require('nodemailer');
    transport = nodemailer.createTransport({
      ...(s.service ? { service: s.service } : { host: s.host, port: s.port, secure: s.secure }),
      auth: s.user ? { user: s.user, pass: s.pass } : undefined,
      connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 20000,
      pool: true, maxConnections: 3
    });
    transportKey = key;
    loadError = null;
  } catch (e) {
    transport = null;
    loadError = e;
  }
  return transport;
}

// Short, safe description of an SMTP failure (never contains the password).
function explain(e) {
  const code = e.code || '';
  const resp = String(e.response || e.message || '').split('\n')[0].slice(0, 200);
  if (e.code === 'MODULE_NOT_FOUND') return 'nodemailer is not installed: run "npm install" in the backend folder and restart';
  if (code === 'EAUTH' || e.responseCode === 535) return `login refused by the mail server (${resp}). For Gmail use an App Password, not your normal password`;
  if (code === 'ESOCKET' || code === 'ECONNECTION' || code === 'ETIMEDOUT' || code === 'ENOTFOUND' || code === 'EDNS') return `cannot reach the mail server (${code}). Check SMTP_HOST/SMTP_PORT and the internet connection`;
  if (code === 'EENVELOPE') return `the recipient address was rejected (${resp})`;
  return `${code ? code + ': ' : ''}${resp}`;
}

// Checks the connection and login without sending anything. Never throws.
async function verify() {
  if (!configured()) return { ok: false, error: problems().join('; ') };
  const t = getTransport();
  if (!t) return { ok: false, error: explain(loadError || { code: 'MODULE_NOT_FOUND' }) };
  try { await t.verify(); return { ok: true }; } catch (e) { return { ok: false, error: explain(e) }; }
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const siteUrl = () => (env('PUBLIC_SITE_URL') || 'http://localhost:5173').replace(/\/+$/, '');
const unsubscribeUrl = (token) => `${siteUrl()}/unsubscribe/${token}`;

// Never throws: a mail problem must not break the request that triggered it.
// Returns { sent:true } or { sent:false, reason, error }.
async function sendMail({ to, subject, text, html, headers }) {
  if (!configured()) return { sent: false, reason: 'not-configured', error: problems().join('; ') };
  const t = getTransport();
  if (!t) { const error = explain(loadError || { code: 'MODULE_NOT_FOUND' }); console.error('Mailer:', error); return { sent: false, reason: 'mailer-unavailable', error }; }
  try {
    await t.sendMail({ from: settings().from, to, subject, text, html, headers });
    return { sent: true };
  } catch (e) {
    const error = explain(e);
    console.error('Mailer: send failed:', error);
    return { sent: false, reason: 'send-failed', error };
  }
}

// Wraps body paragraphs (plain strings) in a simple, safe HTML layout.
function layout({ paragraphs, link, linkLabel, unsubscribe }) {
  const body = paragraphs.filter(Boolean).map((p) => `<p style="margin:0 0 14px;line-height:1.6">${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
  const btn = link ? `<p style="margin:18px 0"><a href="${esc(link)}" style="background:#0066cc;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold">${esc(linkLabel || link)}</a></p>` : '';
  const foot = unsubscribe ? `<hr style="border:none;border-top:1px solid #ddd;margin:24px 0 10px"><p style="font-size:12px;color:#666">You receive this because you subscribed to Debre Tabor City Administration updates / ይህን መልዕክት የደረሰዎት ለደብረ ታቦር ከተማ አስተዳደር መረጃዎች ስለተመዘገቡ ነው። <a href="${esc(unsubscribe)}">Unsubscribe / ምዝገባ ሰርዝ</a></p>` : '';
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#222"><h2 style="color:#003366;margin:0 0 16px">Debre Tabor City Administration</h2>${body}${btn}${foot}</div>`;
}

module.exports = { sendMail, configured, problems, status, verify, layout, siteUrl, unsubscribeUrl, esc };
