// Security behaviour tests (stubbed DB). Run: NODE_PATH=$PWD/node_modules node t3.js
require('./helpers');
const { test } = require('node:test');
const assert = require('assert'); const fs = require('fs'); const path = require('path'); const jwt = require('jsonwebtoken'); const bcrypt = require('bcryptjs');
const B = require('path').join(__dirname, '..', 'src');
const auth = require(B + '/middleware/authMiddleware');
const ac = require(B + '/controllers/authController');
const cc = require(B + '/controllers/complaintsController');
const files = require(B + '/utils/files');
const { coerce } = require(B + '/utils/fields');
const createCrud = require(B + '/crud/createCrud');

const res = () => { const r = { code: 200, body: null, headers: {}, status(c) { this.code = c; return this; }, json(b) { this.body = b; this.done && this.done(); return this; }, set(h) { Object.assign(this.headers, h); return this; }, sendFile(f) { this.sent = f; this.done && this.done(); } }; return r; };
const call = (fn, req) => new Promise((resolve) => { const r = res(); r.done = () => resolve(r); Promise.resolve(fn(req, r, (err) => { r.nextCalled = true; r.err = err; resolve(r); })).catch((e) => { r.err = e; resolve(r); }); });
const sql = () => globalThis.__sql;
const st = (r) => (r.err ? r.err.status : r.code);
const tok = (p, opts = {}) => jwt.sign(p, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h', ...opts });

test('Security: auth, role guards, input hardening, private attachments', async () => {
  // ---- verifyToken re-reads the account
  globalThis.__handler = () => [[{ id: 5, username: 'ed', role: 'Editor', is_active: 1 }]];
  let r = await call(auth.verifyToken, { headers: { authorization: 'Bearer ' + tok({ id: 5, role: 'Admin' }) } });
  assert(r.nextCalled && !r.err, 'valid token passes');
  let req = { headers: { authorization: 'Bearer ' + tok({ id: 5, role: 'Admin' }) } }; await call(auth.verifyToken, req);
  assert.equal(req.user.role, 'Editor', 'role comes from the database, not from the token claim');

  globalThis.__handler = () => [[{ id: 5, username: 'ed', role: 'Editor', is_active: 0 }]];
  r = await call(auth.verifyToken, { headers: { authorization: 'Bearer ' + tok({ id: 5 }) } });
  assert.equal(r.code, 401, 'deactivated user is rejected immediately');
  globalThis.__handler = () => [[]];
  r = await call(auth.verifyToken, { headers: { authorization: 'Bearer ' + tok({ id: 99 }) } });
  assert.equal(r.code, 401, 'deleted user rejected');
  r = await call(auth.verifyToken, { headers: { authorization: 'Bearer ' + jwt.sign({ id: 5 }, 'wrong-secret'.repeat(4)) } });
  assert.equal(r.code, 401, 'bad signature');
  r = await call(auth.verifyToken, { headers: { authorization: 'Bearer ' + tok({ id: 5 }, { expiresIn: -10 }) } });
  assert.equal(r.code, 401, 'expired');
  r = await call(auth.verifyToken, { headers: { authorization: 'Bearer ' + jwt.sign({ id: 5 }, process.env.JWT_SECRET, { algorithm: 'HS512' }) } });
  assert.equal(r.code, 401, 'only HS256 accepted');
  r = await call(auth.verifyToken, { headers: {} });
  assert.equal(r.code, 401);

  // role guard
  globalThis.__handler = () => [[{ id: 7, username: 'v', role: 'Viewer', is_active: 1 }]];
  r = await call(auth.verifyEditor, { headers: { authorization: 'Bearer ' + tok({ id: 7, role: 'Admin' }) } });
  assert.equal(r.code, 403, 'Viewer cannot write even with a forged Admin claim');

  // ---- login: object injection, timing path, deactivated
  const hash = bcrypt.hashSync('correct-horse', 4);
  globalThis.__sql.length = 0;
  globalThis.__handler = () => [[]];
  r = await call(ac.loginAdmin, { body: { email: { email: 1 }, password: 'x' } });
  assert.equal(r.code, 400, 'object e-mail rejected before reaching SQL');
  r = await call(ac.loginAdmin, { body: { email: 'a@b.co', password: { $ne: 1 } } });
  assert.equal(r.code, 400);
  r = await call(ac.loginAdmin, { body: { email: 'nobody@x.et', password: 'whatever1' } });
  assert.equal(r.code, 401);
  globalThis.__handler = () => [[{ id: 1, username: 'a', email: 'a@x.et', role: 'Admin', is_active: 0, password_hash: hash }]];
  r = await call(ac.loginAdmin, { body: { email: 'A@X.et ', password: 'correct-horse' } });
  assert.equal(r.code, 401, 'deactivated + correct password gives the same generic answer');
  assert.equal(sql().at(-1).params[0], 'a@x.et', 'e-mail trimmed and lower-cased');
  globalThis.__handler = () => [[{ id: 1, username: 'a', email: 'a@x.et', role: 'Admin', is_active: 1, password_hash: hash }]];
  r = await call(ac.loginAdmin, { body: { email: 'a@x.et', password: 'correct-horse' } });
  assert.equal(r.code, 200); const dec = jwt.verify(r.body.token, process.env.JWT_SECRET); assert(dec.exp - dec.iat <= 12 * 3600, 'token lifetime <= 12h');
  r = await call(ac.loginAdmin, { body: { email: 'a@x.et', password: 'wrong-password' } });
  assert.equal(r.code, 401);

  // register validation
  globalThis.__handler = () => [[]];
  r = await call(ac.registerAdmin, { body: { username: 'u', email: 'not-an-email', password: 'longenough1' } }); assert.equal(r.code, 400);
  r = await call(ac.registerAdmin, { body: { username: 'u', email: 'u@x.et', password: 'a'.repeat(100) } }); assert.equal(r.code, 400, 'password > 72 chars rejected');
  r = await call(ac.registerAdmin, { body: { username: 'u', email: 'u@x.et', password: 'longenough1', role: 'Root' } }); assert.equal(r.code, 400);
  r = await call(ac.registerAdmin, { body: { username: { a: 1 }, email: 'u@x.et', password: 'longenough1' } }); assert.equal(r.code, 400);

  // ---- coerce rejects objects / arrays
  assert.throws(() => coerce({ type: 'string' }, { a: 1 }), /not valid/);
  assert.throws(() => coerce({ type: 'string' }, ['a', 'b']), /not valid/);
  assert.throws(() => coerce({ type: 'url' }, 'javascript:alert(1)'), /http/);
  assert.throws(() => coerce({ type: 'url' }, 'data:text/html,x'), /http/);

  // ---- CRUD: a posted /uploads/ path may not point at someone else's file
  const tenders = createCrud(require(B + '/resources/tenders'));
  const mk = (body, params = {}) => ({ body, files: {}, params, query: {}, user: { id: 1, role: 'Editor' } });
  globalThis.__handler = (q) => /^SELECT/.test(q) ? [[{ id: 4, reference_no: 'R', title_en: 't', closing_date: '2026-09-22T10:00:00', status: 'Open', document_url: '/uploads/mine.pdf', submission_place: 'x' }]] : [{ affectedRows: 1 }];
  r = await call(tenders.update, mk({ document_url: '/uploads/someone-elses.pdf' }, { id: '4' }));
  assert.equal(st(r), 400, 'cannot re-point to another upload');
  r = await call(tenders.update, mk({ document_url: '/uploads/mine.pdf', status: 'Closed' }, { id: '4' }));
  assert.equal(st(r), 200, 'keeping the current file is fine');
  r = await call(tenders.update, mk({ document_url: 'https://example.org/spec.pdf' }, { id: '4' }));
  assert.equal(st(r), 200, 'external link allowed');

  // ---- complaints: private attachment + typed filters
  const priv = path.join(files.PRIVATE_DIR, 'attachment-test.pdf'); fs.writeFileSync(priv, '%PDF-1.4');
  globalThis.__sql.length = 0;
  globalThis.__handler = (q) => /INSERT/.test(q) ? [{ insertId: 3 }] : [[]];
  r = await call(cc.submitComplaint, { body: { citizen_name: 'A', phone: '0911223344', department: 'Roads', subject: 's', description: 'd' }, file: { filename: 'attachment-test.pdf', destination: files.PRIVATE_DIR } });
  assert.equal(r.code, 201);
  const ins = sql().find((x) => /INSERT INTO complaints/.test(x.sql));
  assert.equal(ins.params.at(-1), '/private/attachment-test.pdf', 'stored as a private path, not /uploads');
  r = await call(cc.getAllComplaints, { query: { status: ['Pending', 'Resolved'], department: { x: 1 } } });
  assert.equal(r.code, 200); assert(!/c\.status = \?/.test(sql().at(-1).sql), 'array/object filters ignored');
  r = await call(cc.getAllComplaints, { query: { status: 'Hacked' } });
  assert(r.err && r.err.status === 400, 'unknown status rejected');
  globalThis.__handler = () => [[{ attachment_url: '/private/attachment-test.pdf' }]];
  r = await call(cc.downloadAttachment, { params: { id: '3' } });
  assert.equal(r.sent, priv); assert(/sandbox/.test(r.headers['Content-Security-Policy']));
  globalThis.__handler = () => [[{ attachment_url: '/private/../../etc/passwd' }]];
  r = await call(cc.downloadAttachment, { params: { id: '3' } });
  assert(r.err && r.err.status === 404, 'path traversal impossible (basename only)');
  files.removeFiles('/private/attachment-test.pdf'); await new Promise((s) => setTimeout(s, 50));
  assert(!fs.existsSync(priv), 'private file removed with the record');
});
