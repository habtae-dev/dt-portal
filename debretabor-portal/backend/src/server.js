const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const rateLimit = require('./middleware/rateLimit');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { UPLOAD_DIR } = require('./utils/files');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET must be set in backend/.env and be at least 32 characters.');
  process.exit(1);
}

const app = express();
app.set('trust proxy', process.env.TRUST_PROXY === 'true'); // true behind nginx / Cloudflare

// Security headers
app.disable('x-powered-by');
const isProd = process.env.NODE_ENV === 'production';
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cross-Origin-Resource-Policy': 'cross-origin', // uploads are loaded by the separate client/admin origins
    // the API only returns JSON and files: nothing it sends may ever run as a page
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; sandbox"
  });
  if (isProd) res.set('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  next();
});

// CORS: only the configured front-ends (comma-separated CORS_ORIGINS)
const allowed = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174')
  .split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.includes(origin)) return cb(null, true);
    const err = new Error('Not allowed by CORS'); err.isCors = true;
    return cb(err);
  },
  maxAge: 600
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' })); // flat key=value only (no nested objects)

app.use('/uploads', (req, res, next) => {
  res.set('Content-Security-Policy', "default-src 'none'; sandbox");
  next();
}, express.static(UPLOAD_DIR, { dotfiles: 'deny', index: false, maxAge: '7d' }));

// Rate limits
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 600 }));
// login: limited per IP and, separately, per target e-mail so one account cannot be brute-forced from many addresses
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many login attempts. Try again in 15 minutes.' }));
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000, max: 8, message: 'Too many login attempts for this account. Try again in 15 minutes.',
  keyFn: (req) => `email:${String(req.body?.email || '').toLowerCase().slice(0, 150)}`
}));
app.use('/api/complaints/submit', rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: 'Too many complaints submitted from this address. Try again later.' }));
const signupLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: 'Too many sign-ups from this address. Try again later.' });
app.use('/api/subscribers', (req, res, next) => (req.method === 'POST' && req.path === '/' ? signupLimit(req, res, next) : next())); // sign-up only
app.use('/api/subscribers/unsubscribe', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
app.use('/api/subscribers/test', rateLimit({ windowMs: 60 * 60 * 1000, max: 20, message: 'Too many test e-mails. Try again later.' }));
app.use('/api/subscribers/broadcast', rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: 'Broadcast limit reached. Try again later.' }));
app.use('/api/complaints/track', rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many lookups. Try again later.' }));

app.use('/api', require('./routes'));

app.get('/', (req, res) => res.json({ message: 'Welcome to Debre Tabor City Administration Portal API' }));
app.get('/health', (req, res) => res.json({ ok: true }));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // E-mail self-check: tells you at start-up whether subscription / complaint e-mails can be sent, and why not.
  const mail = require('./utils/mailer');
  if (!mail.configured()) console.warn(`Mail: NOT configured - ${mail.problems().join('; ')}. See docs/EMAIL.md`);
  else mail.verify().then((r) => (r.ok ? console.log(`Mail: ready (${mail.status().provider}, from ${mail.status().from})`) : console.warn(`Mail: configured but NOT working - ${r.error}`)));
});
