require('./helpers');
const { test } = require('node:test');

// multer is replaced by a pass-through: these tests exercise OUR checks (signature, size, type), not multer's multipart parser.
const multerPath = require.resolve('multer');
function fakeMulter() { const pass = () => (req, res, next) => next(); return { fields: pass, none: pass, single: pass }; }
fakeMulter.diskStorage = (o) => o;
fakeMulter.MulterError = class MulterError extends Error {};
require.cache[multerPath] = { id: multerPath, filename: multerPath, loaded: true, exports: fakeMulter };
const assert = require('assert'); const fs = require('fs'); const path = require('path');
const B = require('path').join(__dirname, '..', 'src');
const { UPLOAD_DIR } = require(B + '/utils/files');
const upload = require(B + '/middleware/upload');
const run = (mw, req) => new Promise((resolve) => mw(req, {}, (err) => resolve(err || null)));
const put = (name, bytes, field = 'document') => { const p = path.join(UPLOAD_DIR, name); fs.writeFileSync(p, Buffer.from(bytes)); return { fieldname: field, originalname: name, filename: name, path: p, destination: UPLOAD_DIR, size: bytes.length }; };
test('Uploads: signature, size and type checks', async () => {
  const mw = upload.fields([{ name: 'document', maxCount: 1 }]);
  const pdf = put('ok.pdf', [...Buffer.from('%PDF-1.7 hello')]);
  assert.equal(await run(mw, { files: { document: [pdf] } }), null, 'real pdf accepted');
  const png = put('ok.png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
  assert.equal(await run(mw, { files: { document: [png] } }), null, 'real png accepted');
  const webp = put('ok.webp', [...Buffer.from('RIFF\0\0\0\0WEBPVP8 ')]);
  assert.equal(await run(mw, { files: { document: [webp] } }), null, 'real webp accepted');
  const html = put('evil.pdf', [...Buffer.from('<html><script>alert(1)</script>')]);
  let err = await run(mw, { files: { document: [html] } });
  assert(err && err.status === 400, 'html renamed to .pdf rejected');
  await new Promise((s) => setTimeout(s, 50)); assert(!fs.existsSync(html.path), 'rejected file deleted from disk');
  const exe = put('x.jpg', [0x4d, 0x5a, 0x90, 0]);
  err = await run(mw, { files: { document: [exe] } }); assert(err && err.status === 400, 'exe renamed to .jpg rejected');
  const mp4 = put('v.mp4', [0, 0, 0, 0x18, ...Buffer.from('ftypisom')], 'video');
  assert.equal(await run(upload.fields([{ name: 'video', maxCount: 1 }]), { files: { video: [mp4] } }), null, 'real mp4 accepted');
  const big = { ...put('big.pdf', [...Buffer.from('%PDF-1.7')]), size: 11 * 1024 * 1024 };
  err = await run(mw, { files: { document: [big] } }); assert(err && err.status === 413, '>10MB document rejected');
  ['ok.pdf', 'ok.png', 'ok.webp', 'v.mp4', 'x.jpg', 'big.pdf', 'evil.pdf'].forEach((f) => fs.rmSync(path.join(UPLOAD_DIR, f), { force: true }));
});
