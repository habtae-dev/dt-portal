// E-mail subscription, broadcast and complaint-reply behaviour (stubbed DB and stubbed nodemailer).
require('./helpers');
const { test } = require('node:test');
const assert = require('assert');
const Module = require('module');

// Fake nodemailer: records every message instead of sending it.
const outbox = [];
const realLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'nodemailer') return { createTransport: () => ({ sendMail: async (m) => { if (/fail@/.test(m.to)) throw new Error('boom'); outbox.push(m); } }) };
  return realLoad.call(this, request, ...rest);
};

const B = require('path').join(__dirname, '..', 'src');
const sc = require(B + '/controllers/subscribersController');
const cc = require(B + '/controllers/complaintsController');
const createCrud = require(B + '/crud/createCrud');
const sql = () => globalThis.__sql;
const call = (fn, req) => new Promise((resolve) => {
  const r = { code: 200, body: null, status(c) { this.code = c; return this; }, json(b) { this.body = b; resolve(this); return this; }, set() { return this; } };
  Promise.resolve(fn(req, r, (err) => { r.err = err; resolve(r); })).catch((e) => { r.err = e; resolve(r); });
});
const st = (r) => (r.err ? r.err.status : r.code);
const tick = () => new Promise((s) => setTimeout(s, 30));
const reset = () => { globalThis.__sql.length = 0; outbox.length = 0; };

test('Subscribers: sign-up, unsubscribe, broadcast, complaint replies, city facts', async () => {
  // ---- sign-up validation
  reset();
  for (const bad of [undefined, '', 'nope', 'a@b', 'a b@c.com', { $ne: 1 }, ['a@b.co'], 'x'.repeat(200) + '@a.com']) {
    const r = await call(sc.subscribe, { body: { email: bad } });
    assert.equal(st(r), 400, `rejects ${JSON.stringify(bad)}`);
  }
  assert.equal(sql().length, 0, 'nothing written for invalid input');

  // ---- sign-up: normalised, parameterised, upsert; welcome mail only for brand-new rows
  delete process.env.SMTP_HOST;
  globalThis.__handler = () => [{ affectedRows: 1 }];
  let r = await call(sc.subscribe, { body: { email: '  Abebe@Example.ORG ', language: 'am' } });
  assert.equal(r.code, 201);
  const ins = sql()[0];
  assert(/INSERT INTO subscribers/.test(ins.sql) && /ON DUPLICATE KEY UPDATE/.test(ins.sql));
  assert.equal(ins.params[0], 'abebe@example.org'); assert.equal(ins.params[1], 'am'); assert.match(ins.params[2], /^[a-f0-9]{64}$/);
  assert.equal(outbox.length, 0, 'no SMTP configured -> nothing sent, still succeeds');

  process.env.SMTP_HOST = 'smtp.test'; process.env.MAIL_FROM = 'Test <no-reply@test.et>'; process.env.PUBLIC_SITE_URL = 'https://dt.example/';
  reset(); await call(sc.subscribe, { body: { email: 'new@example.org' } }); await tick();
  assert.equal(outbox.length, 1); assert(outbox[0].text.includes(`https://dt.example/unsubscribe/${sql()[0].params[2]}`), 'unsubscribe link built from PUBLIC_SITE_URL');
  reset(); globalThis.__handler = () => [{ affectedRows: 2 }]; // already subscribed -> same reply, no second mail
  r = await call(sc.subscribe, { body: { email: 'new@example.org' } }); await tick();
  assert.equal(r.code, 201); assert.equal(outbox.length, 0);
  globalThis.__handler = () => [{ affectedRows: 1 }];
  reset(); r = await call(sc.subscribe, { body: { email: 'fail@example.org' } }); await tick();
  assert.equal(r.code, 201, 'a mail failure never breaks the sign-up');

  // ---- unsubscribe
  for (const bad of [undefined, 'abc', { a: 1 }, 'z'.repeat(64)]) assert.equal(st(await call(sc.unsubscribe, { body: { token: bad } })), 400);
  globalThis.__handler = () => [{ affectedRows: 0 }];
  assert.equal(st(await call(sc.unsubscribe, { body: { token: 'a'.repeat(64) } })), 404);
  reset(); globalThis.__handler = () => [{ affectedRows: 1 }];
  assert.equal((await call(sc.unsubscribe, { body: { token: 'a'.repeat(64) } })).code, 200);
  assert(/SET is_active = 0 WHERE unsubscribe_token = \?/.test(sql()[0].sql));

  // ---- list: filters are parameters; no token is ever returned
  reset(); globalThis.__handler = () => [[{ id: 1, email: 'a@b.co' }]];
  await call(sc.list, { query: { search: '50%_x', active: '1' } });
  assert(!/unsubscribe_token/.test(sql()[0].sql.split('FROM')[0]), 'token not selected');
  assert(sql()[0].params.includes('%50\\%\\_x%'));
  reset(); await call(sc.list, { query: { search: { $ne: 1 }, active: "1 OR 1=1" } });
  assert(!/WHERE/.test(sql()[0].sql), 'non-string / non-0|1 filters ignored');

  // ---- broadcast
  reset(); globalThis.__handler = () => [[]];
  assert.equal(st(await call(sc.broadcast, { body: { subject_en: 's' } })), 400, 'message required');
  assert.equal(st(await call(sc.broadcast, { body: { subject_en: 's', message_en: 'm', link: 'javascript:alert(1)' } })), 400);
  delete process.env.SMTP_HOST;
  assert.equal(st(await call(sc.broadcast, { body: { subject_en: 's', message_en: 'm' } })), 503, 'clear error when SMTP is not set');
  process.env.SMTP_HOST = 'smtp.test'; process.env.MAIL_FROM = 'Test <no-reply@test.et>';
  reset();
  globalThis.__handler = () => [[
    { email: 'en@x.org', language: 'en', unsubscribe_token: 'a'.repeat(64) },
    { email: 'am@x.org', language: 'am', unsubscribe_token: 'b'.repeat(64) },
    { email: 'am2@x.org', language: 'am', unsubscribe_token: 'c'.repeat(64) },
    { email: 'fail@x.org', language: 'en', unsubscribe_token: 'd'.repeat(64) }
  ]];
  r = await call(sc.broadcast, { body: { subject_en: 'New vacancy', message_en: 'Apply <b>now</b>', subject_am: 'አዲስ ክፍት ቦታ', link: 'https://dt.example/announcements/vacancy/3' } });
  assert.equal(r.code, 200); assert.deepEqual([r.body.total, r.body.sent, r.body.failed], [4, 3, 1]);
  const toAm = outbox.find((m) => m.to === 'am@x.org'); const toEn = outbox.find((m) => m.to === 'en@x.org');
  assert.equal(toAm.subject, 'አዲስ ክፍት ቦታ'); assert.equal(toEn.subject, 'New vacancy');
  assert(toEn.html.includes('Apply &lt;b&gt;now&lt;/b&gt;') && !toEn.html.includes('<b>now'), 'message text is HTML-escaped');
  assert(toEn.text.includes('/unsubscribe/' + 'a'.repeat(64)) && toEn.headers['List-Unsubscribe'], 'every mail has its own unsubscribe link');
  assert(/WHERE is_active = 1/.test(sql()[0].sql), 'only active subscribers');

  // ---- complaint status mail goes to the citizen only when an address exists
  reset(); globalThis.__handler = (s) => (/^UPDATE/.test(s) ? [{ affectedRows: 1 }] : [[{ tracking_code: 'DT-CMP-AAAA1111', citizen_name: 'Almaz', email: 'almaz@x.org', subject: 'Light', status: 'Resolved' }]]);
  r = await call(cc.updateComplaintStatus, { params: { id: '1' }, body: { status: 'Resolved', admin_notes: 'Fixed <today>' }, user: { id: 2 } });
  assert.equal(r.code, 200); assert.equal(r.body.email, 'sent', 'dashboard is told the mail was sent'); assert.equal(outbox.length, 1); assert.equal(outbox[0].to, 'almaz@x.org');
  assert(outbox[0].text.includes('Resolved') && outbox[0].text.includes('DT-CMP-AAAA1111') && !outbox[0].html.includes('<today>'));
  reset(); globalThis.__handler = (s) => (/^UPDATE/.test(s) ? [{ affectedRows: 1 }] : [[{ tracking_code: 'X', citizen_name: 'N', email: null, subject: 'S' }]]);
  r = await call(cc.updateComplaintStatus, { params: { id: '1' }, body: { status: 'In Progress' }, user: { id: 2 } });
  assert.equal(outbox.length, 0, 'no address -> no mail'); assert.equal(r.body.email, 'no-address');
  // staff can untick "notify"; a failing mail server is reported, never thrown
  reset(); globalThis.__handler = (s) => (/^UPDATE/.test(s) ? [{ affectedRows: 1 }] : [[{ tracking_code: 'X', citizen_name: 'N', email: 'fail@x.org', subject: 'S', status: 'Resolved' }]]);
  r = await call(cc.updateComplaintStatus, { params: { id: '1' }, body: { status: 'Resolved', notify: false }, user: { id: 2 } });
  assert.equal(r.body.email, 'skipped'); assert.equal(outbox.length, 0);
  r = await call(cc.updateComplaintStatus, { params: { id: '1' }, body: { status: 'Resolved' }, user: { id: 2 } });
  assert.equal(r.code, 200); assert.equal(r.body.email, 'failed'); assert(r.body.error);
  delete process.env.SMTP_HOST; delete process.env.MAIL_FROM;
  r = await call(cc.updateComplaintStatus, { params: { id: '1' }, body: { status: 'Resolved' }, user: { id: 2 } });
  assert.equal(r.body.email, 'not-configured'); assert.equal(r.code, 200, 'status still saved when e-mail is not set up');

  // ---- mail settings helper: Gmail preset, problems in plain words, test mail, status
  const mailer = require(B + '/utils/mailer');
  for (const k of ['SMTP_HOST', 'SMTP_SERVICE', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM']) delete process.env[k];
  assert(mailer.problems().length && !mailer.configured());
  process.env.SMTP_USER = 'dt portal'; process.env.SMTP_PASS = 'x'; process.env.SMTP_HOST = '';
  assert(mailer.problems().some((p) => /SMTP_HOST/.test(p)) && mailer.problems().some((p) => /MAIL_FROM|e-mail address/.test(p)), 'the exact mistake in the reported .env is explained');
  process.env.SMTP_SERVICE = 'gmail'; process.env.SMTP_USER = 'dt@gmail.com'; process.env.SMTP_PASS = 'abcd efgh ijkl mnop';
  assert(mailer.configured(), 'gmail preset needs only user + app password'); assert.match(mailer.status().from, /dt@gmail\.com/); assert(!JSON.stringify(mailer.status()).includes('abcd'), 'status never contains the password');
  reset(); globalThis.__handler = () => [[]];
  r = await call(sc.testMail, { body: {}, user: { id: 1, email: 'admin@x.org' } }); assert.equal(r.code, 200); assert.equal(outbox[0].to, 'admin@x.org');
  r = await call(sc.testMail, { body: { to: 'fail@x.org' }, user: { id: 1 } }); assert.equal(r.code, 502); assert.match(r.body.message, /Could not send/);
  assert.equal(st(await call(sc.testMail, { body: { to: 'bad' }, user: { id: 1 } })), 400);
  r = await call(sc.mailStatus, { user: { id: 1 } }); assert.equal(r.code, 200); assert.equal(r.body.data.configured, true);

  // ---- city facts: public sees published rows in order; required EN pair; sort_order integer
  const facts = createCrud(require(B + '/resources/cityFacts'));
  reset(); globalThis.__handler = () => [[]];
  await call(facts.list, { query: {}, params: {} });
  assert(sql()[0].sql.includes('t.is_published = 1') && sql()[0].sql.includes('ORDER BY t.sort_order ASC'));
  r = await call(facts.create, { body: { label_en: 'Area' }, files: undefined, user: { id: 1 } });
  assert.equal(st(r), 400, 'value_en required');
  globalThis.__handler = (s) => (/^INSERT/.test(s) ? [{ insertId: 7 }] : [[{ id: 7 }]]);
  r = await call(facts.create, { body: { label_en: 'Area', label_am: 'ስፋት', value_en: '1,000 km²', sort_order: '3' }, user: { id: 1 } });
  assert.equal(r.code, 201);
  assert.equal(st(await call(facts.create, { body: { label_en: 'Area', value_en: '1', sort_order: 'abc' }, user: { id: 1 } })), 400);
});
