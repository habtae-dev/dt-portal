const fs = require('fs');
const crypto = require('crypto');
const pool = require('../config/db');
const HttpError = require('../utils/HttpError');
const { toPrivateUrl, resolveStored, removeFiles } = require('../utils/files');
const mail = require('../utils/mailer');

const STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Unguessable tracking code, e.g. DT-CMP-7K4Q9XM2 (8 chars, no look-alike characters).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const generateTrackingCode = () => {
  const bytes = crypto.randomBytes(8);
  let code = '';
  for (let i = 0; i < 8; i++) code += ALPHABET[bytes[i] % ALPHABET.length];
  return `DT-CMP-${code}`;
};

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// POST /api/complaints/submit  (public, multipart: optional "attachment")
const submitComplaint = wrap(async (req, res) => {
  const attachment_url = req.file ? toPrivateUrl(req.file) : null; // stored outside the public /uploads folder
  try {
    const b = req.body || {};
    const data = {
      citizen_name: clean(b.citizen_name, 150),
      phone: clean(b.phone, 30),
      email: clean(b.email, 150) || null,
      department: clean(b.department, 150),
      subject: clean(b.subject, 255),
      description: clean(b.description, 10000)
    };

    const errors = {};
    ['citizen_name', 'phone', 'department', 'subject', 'description'].forEach((f) => { if (!data[f]) errors[f] = `${f} is required`; });
    if (data.phone && !/^[+\d][\d\s()-]{6,}$/.test(data.phone)) errors.phone = 'phone must be a valid phone number';
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'email must be a valid email address';
    if (Object.keys(errors).length) throw new HttpError(400, Object.values(errors).join('; '), errors);

    let tracking_code;
    let result;
    for (let attempt = 0; attempt < 5; attempt++) {
      tracking_code = generateTrackingCode();
      try {
        [result] = await pool.query(
          `INSERT INTO complaints (tracking_code, citizen_name, phone, email, department, subject, description, attachment_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [tracking_code, data.citizen_name, data.phone, data.email, data.department, data.subject, data.description, attachment_url]
        );
        break;
      } catch (err) {
        if (err.code !== 'ER_DUP_ENTRY' || attempt === 4) throw err;
      }
    }
    notifyCitizen(result.insertId, 'received').catch(() => {}); // confirmation with the tracking code (after the reply is queued)
    res.status(201).json({ success: true, message: 'Complaint submitted successfully.', tracking_code, complaintId: result.insertId });
  } catch (err) {
    removeFiles(attachment_url);
    throw err;
  }
});

// GET /api/complaints/track/:tracking_code  (public) -> only fields a citizen may see
const trackComplaint = wrap(async (req, res) => {
  const code = String(req.params.tracking_code || '').trim().toUpperCase();
  const [rows] = await pool.query(
    `SELECT tracking_code, department, subject, status, admin_notes, created_at, updated_at
     FROM complaints WHERE tracking_code = ? LIMIT 1`,
    [code]
  );
  if (!rows.length) throw new HttpError(404, 'No complaint found with this tracking code.');
  res.status(200).json({ success: true, data: rows[0] });
});

// GET /api/complaints  (staff)  ?status= &department= &search= &limit= &page=
const getAllComplaints = wrap(async (req, res) => {
  const conds = [];
  const params = [];
  const { status, department, search } = req.query;
  if (typeof status === 'string' && status) {
    if (!STATUSES.includes(status)) throw new HttpError(400, `status must be one of: ${STATUSES.join(', ')}`);
    conds.push('c.status = ?'); params.push(status);
  }
  if (typeof department === 'string' && department) { conds.push('c.department = ?'); params.push(department); }
  if (typeof search === 'string' && search.trim()) {
    const like = `%${search.trim().slice(0, 100).replace(/[\\%_]/g, '\\$&')}%`;
    conds.push('(c.tracking_code LIKE ? OR c.citizen_name LIKE ? OR c.subject LIKE ?)');
    params.push(like, like, like);
  }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 500, 1), 500);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

  const [rows] = await pool.query(
    `SELECT c.*, u.username AS handled_by_admin FROM complaints c
     LEFT JOIN users u ON c.handled_by = u.id ${where}
     ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit]
  );
  res.status(200).json({ success: true, count: rows.length, data: rows });
});

// GET /api/complaints/:id  (staff)
const getComplaintById = wrap(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.*, u.username AS handled_by_admin FROM complaints c
     LEFT JOIN users u ON c.handled_by = u.id WHERE c.id = ? LIMIT 1`,
    [Number(req.params.id) || 0]
  );
  if (!rows.length) throw new HttpError(404, 'Complaint not found.');
  res.status(200).json({ success: true, data: rows[0] });
});


// E-mails the citizen (if they gave an address) about their complaint. Never throws.
// Resolves to { email: 'sent' | 'failed' | 'no-address' | 'not-configured', error? } so the dashboard can tell staff what happened.
async function notifyCitizen(id, kind, note) {
  try {
    const [rows] = await pool.query('SELECT tracking_code, citizen_name, email, subject, status FROM complaints WHERE id = ? LIMIT 1', [id]);
    const c = rows[0];
    if (!c || !c.email) return { email: 'no-address' };
    if (!mail.configured()) return { email: 'not-configured', error: mail.problems().join('; ') };
    const link = `${mail.siteUrl()}/services/online`;
    const received = kind === 'received';
    const en = received
      ? `Dear ${c.citizen_name},\n\nWe received your complaint "${c.subject}". Your tracking code is ${c.tracking_code}. Keep it to follow the progress.`
      : `Dear ${c.citizen_name},\n\nYour complaint "${c.subject}" (code ${c.tracking_code}) is now: ${c.status}.${note ? `\n\nResponse from the office:\n${note}` : ''}`;
    const am = received
      ? `ውድ ${c.citizen_name}፣\n\nቅሬታዎን "${c.subject}" ተቀብለናል። የመከታተያ ኮድዎ ${c.tracking_code} ነው። ሂደቱን ለመከታተል ያስቀምጡት።`
      : `ውድ ${c.citizen_name}፣\n\nየቅሬታዎ "${c.subject}" (ኮድ ${c.tracking_code}) ሁኔታ አሁን: ${c.status}።${note ? `\n\nከጽህፈት ቤቱ የተሰጠ ምላሽ፦\n${note}` : ''}`;
    const r = await mail.sendMail({
      to: c.email,
      subject: received ? `Complaint received ${c.tracking_code} / ቅሬታዎ ደርሶናል` : `Complaint ${c.tracking_code}: ${c.status} / ቅሬታ ${c.tracking_code}`,
      text: `${en}\n\n----\n\n${am}\n\n${link}`,
      html: mail.layout({ paragraphs: [en, am], link, linkLabel: 'Track your complaint / ቅሬታዎን ይከታተሉ' })
    });
    return r.sent ? { email: 'sent' } : { email: 'failed', error: r.error };
  } catch (e) {
    console.error('Complaint e-mail failed:', e.code || e.message);
    return { email: 'failed', error: 'unexpected error' };
  }
}

// PUT /api/complaints/:id  (Editor/Admin)
const updateComplaintStatus = wrap(async (req, res) => {
  const { status, admin_notes } = req.body || {};
  if (typeof status !== 'string' || !STATUSES.includes(status)) throw new HttpError(400, `status must be one of: ${STATUSES.join(', ')}`);
  const [result] = await pool.query(
    'UPDATE complaints SET status = ?, admin_notes = ?, handled_by = ? WHERE id = ?',
    [status, clean(admin_notes, 10000) || null, req.user.id, Number(req.params.id) || 0]
  );
  if (!result.affectedRows) throw new HttpError(404, 'Complaint not found.');
  // E-mail the citizen unless staff untick "notify" in the dashboard. The result is reported back to the dashboard.
  const nv = (req.body || {}).notify; const notify = nv === undefined || nv === true || nv === 'true';
  const mailResult = notify ? await notifyCitizen(Number(req.params.id) || 0, 'status', clean(admin_notes, 10000)) : { email: 'skipped' };
  res.status(200).json({ success: true, message: 'Complaint status updated successfully.', ...mailResult });
});

// DELETE /api/complaints/:id  (Admin)
const deleteComplaint = wrap(async (req, res) => {
  const id = Number(req.params.id) || 0;
  const [rows] = await pool.query('SELECT attachment_url FROM complaints WHERE id = ?', [id]);
  if (!rows.length) throw new HttpError(404, 'Complaint not found.');
  await pool.query('DELETE FROM complaints WHERE id = ?', [id]);
  removeFiles(rows[0].attachment_url);
  res.status(200).json({ success: true, message: 'Complaint deleted successfully.' });
});

// GET /api/complaints/:id/attachment  (Editor/Admin) -> streams the private attachment
const downloadAttachment = wrap(async (req, res) => {
  const [rows] = await pool.query('SELECT attachment_url FROM complaints WHERE id = ? LIMIT 1', [Number(req.params.id) || 0]);
  const file = rows.length ? resolveStored(rows[0].attachment_url) : null;
  if (!file || !fs.existsSync(file)) throw new HttpError(404, 'Attachment not found.');
  res.set({ 'Content-Disposition': 'inline', 'Cache-Control': 'private, no-store', 'Content-Security-Policy': "default-src 'none'; sandbox" });
  res.sendFile(file);
});

module.exports = { submitComplaint, trackComplaint, getAllComplaints, getComplaintById, updateComplaintStatus, deleteComplaint, downloadAttachment };
