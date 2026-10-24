const crypto = require('crypto');
const pool = require('../config/db');
const HttpError = require('../utils/HttpError');
const mail = require('../utils/mailer');

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TOKEN_RE = /^[a-f0-9]{64}$/;
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// POST /api/subscribers  (public) {email, language?}
// The reply is the same whether the address is new, already subscribed or re-activated,
// so the form cannot be used to find out who is subscribed.
const subscribe = wrap(async (req, res) => {
  const email = str(req.body?.email, 150).toLowerCase();
  const language = req.body?.language === 'am' ? 'am' : 'en';
  if (!email || email.length > 150 || !EMAIL_RE.test(email)) throw new HttpError(400, 'Please enter a valid e-mail address.');

  const token = crypto.randomBytes(32).toString('hex');
  const [result] = await pool.query(
    `INSERT INTO subscribers (email, language, unsubscribe_token) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE language = VALUES(language), is_active = 1`,
    [email, language, token]
  );
  // affectedRows: 1 = new row, 2 = existing row changed, 0 = existing and identical
  if (result.affectedRows === 1) {
    const url = mail.unsubscribeUrl(token);
    mail.sendMail({
      to: email,
      subject: 'Subscription confirmed / ምዝገባዎ ተረጋግጧል - Debre Tabor City Administration',
      text: `You are now subscribed to Debre Tabor City Administration updates (complaint responses, vacancies, tenders, news and notices).\n\nአሁን ለደብረ ታቦር ከተማ አስተዳደር መረጃዎች (የቅሬታ ምላሾች፣ ክፍት የሥራ ቦታዎች፣ ጨረታዎች፣ ዜናዎች እና ማስታወቂያዎች) ተመዝግበዋል።\n\nUnsubscribe / ምዝገባ ለመሰረዝ: ${url}`,
      html: mail.layout({
        paragraphs: ['You are now subscribed to Debre Tabor City Administration updates: complaint responses, vacancies, tenders, news and notices.',
          'አሁን ለደብረ ታቦር ከተማ አስተዳደር መረጃዎች (የቅሬታ ምላሾች፣ ክፍት የሥራ ቦታዎች፣ ጨረታዎች፣ ዜናዎች እና ማስታወቂያዎች) ተመዝግበዋል።'],
        unsubscribe: url
      }),
      headers: { 'List-Unsubscribe': `<${url}>` }
    });
  }
  res.status(201).json({ success: true, message: 'Thank you! You are subscribed.' });
});

// POST /api/subscribers/unsubscribe  (public) {token}
const unsubscribe = wrap(async (req, res) => {
  const token = str(req.body?.token, 64);
  if (!TOKEN_RE.test(token)) throw new HttpError(400, 'This unsubscribe link is not valid.');
  const [result] = await pool.query('UPDATE subscribers SET is_active = 0 WHERE unsubscribe_token = ?', [token]);
  if (!result.affectedRows) throw new HttpError(404, 'This unsubscribe link is not valid.');
  res.status(200).json({ success: true, message: 'You have been unsubscribed.' });
});

// GET /api/subscribers  (Admin/Editor)  ?search= &active=1|0
const list = wrap(async (req, res) => {
  const conds = []; const params = [];
  if (typeof req.query.search === 'string' && req.query.search.trim()) {
    conds.push('email LIKE ?'); params.push(`%${req.query.search.trim().slice(0, 100).replace(/[\\%_]/g, '\\$&')}%`);
  }
  if (req.query.active === '1' || req.query.active === '0') { conds.push('is_active = ?'); params.push(Number(req.query.active)); }
  const [rows] = await pool.query(
    `SELECT id, email, language, is_active, created_at FROM subscribers ${conds.length ? `WHERE ${conds.join(' AND ')}` : ''}
     ORDER BY created_at DESC LIMIT 5000`, params
  );
  res.status(200).json({ success: true, count: rows.length, data: rows, mail_configured: mail.configured() });
});

// DELETE /api/subscribers/:id  (Admin/Editor)
const remove = wrap(async (req, res) => {
  const [r] = await pool.query('DELETE FROM subscribers WHERE id = ?', [Number(req.params.id) || 0]);
  if (!r.affectedRows) throw new HttpError(404, 'Subscriber not found.');
  res.status(200).json({ success: true, message: 'Subscriber deleted.' });
});

// POST /api/subscribers/broadcast  (Admin/Editor)
// {subject_en, message_en, subject_am?, message_am?, link?}  -> e-mail to every active subscriber.
// Amharic subscribers get the Amharic text when you wrote it, otherwise the English one.
const broadcast = wrap(async (req, res) => {
  const b = req.body || {};
  const en = { subject: str(b.subject_en, 200), message: str(b.message_en, 10000) };
  const am = { subject: str(b.subject_am, 200) || en.subject, message: str(b.message_am, 10000) || en.message };
  const link = str(b.link, 500);
  if (!en.subject || !en.message) throw new HttpError(400, 'subject_en and message_en are required.');
  if (link && !/^https?:\/\//i.test(link)) throw new HttpError(400, 'link must start with http:// or https://');
  if (!mail.configured()) throw new HttpError(503, `E-mail is not configured on the server: ${mail.problems().join('; ')}. See docs/EMAIL.md`);

  const [subs] = await pool.query('SELECT email, language, unsubscribe_token FROM subscribers WHERE is_active = 1');
  let sent = 0; let failed = 0; let firstError = '';
  const queue = [...subs];
  const worker = async () => {
    for (let s = queue.shift(); s; s = queue.shift()) {
      const m = s.language === 'am' ? am : en;
      const url = mail.unsubscribeUrl(s.unsubscribe_token);
      const r = await mail.sendMail({
        to: s.email, subject: m.subject,
        text: `${m.message}${link ? `\n\n${link}` : ''}\n\nUnsubscribe / ምዝገባ ለመሰረዝ: ${url}`,
        html: mail.layout({ paragraphs: [m.message], link, linkLabel: s.language === 'am' ? 'ተጨማሪ ይመልከቱ' : 'Read more', unsubscribe: url }),
        headers: { 'List-Unsubscribe': `<${url}>` }
      });
      if (r.sent) sent += 1; else { failed += 1; firstError = firstError || r.error || ''; }
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  res.status(200).json({ success: true, total: subs.length, sent, failed, error: firstError || undefined });
});

// GET /api/subscribers/mail-status  (Admin/Editor) -> is e-mail set up, and does the login to the mail server work?
const mailStatus = wrap(async (req, res) => {
  const st = mail.status();
  const check = st.configured ? await mail.verify() : { ok: false, error: st.problems.join('; ') };
  res.status(200).json({ success: true, data: { ...st, working: check.ok, error: check.ok ? undefined : check.error } });
});

// POST /api/subscribers/test  (Admin/Editor) {to?} -> sends one test message and reports the real result
const testMail = wrap(async (req, res) => {
  const to = str(req.body?.to, 150).toLowerCase() || String(req.user?.email || '').toLowerCase();
  if (!EMAIL_RE.test(to)) throw new HttpError(400, 'Enter a valid e-mail address to send the test to.');
  const r = await mail.sendMail({
    to, subject: 'Test e-mail / የሙከራ ኢሜይል - Debre Tabor City Administration',
    text: 'E-mail sending from the Debre Tabor portal works.\n\nከደብረ ታቦር ፖርታል ኢሜይል መላክ ይሰራል።',
    html: mail.layout({ paragraphs: ['E-mail sending from the Debre Tabor portal works.', 'ከደብረ ታቦር ፖርታል ኢሜይል መላክ ይሰራል።'] })
  });
  res.status(r.sent ? 200 : 502).json({ success: r.sent, message: r.sent ? `Test e-mail sent to ${to}.` : `Could not send: ${r.error}`, to });
});

module.exports = { subscribe, unsubscribe, list, remove, broadcast, mailStatus, testMail };
