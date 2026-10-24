const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Verifies the Bearer token AND re-reads the account, so a deactivated user or a changed role takes effect
// immediately instead of when the token expires. req.user = { id, username, email, role } from the database.
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  let payload;
  try {
    payload = jwt.verify(authHeader.slice(7).trim(), process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }

  try {
    const [rows] = await pool.query('SELECT id, username, email, role, is_active FROM users WHERE id = ? LIMIT 1', [Number(payload.id) || 0]);
    const user = rows[0];
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'This account no longer has access.' });
    }
    req.user = { id: user.id, username: user.username, email: user.email, role: user.role };
    return next();
  } catch (err) {
    return next(err);
  }
};

// Role guard: verifies the token, then checks the role is in the allowed list.
const requireRole = (...roles) => (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err);
    if (roles.includes(req.user.role)) return next();
    return res.status(403).json({ success: false, message: `Access denied. ${roles.join(' or ')} role required.` });
  });
};

const verifyAdmin = requireRole('Admin');
const verifyEditor = requireRole('Admin', 'Editor'); // Viewer is read-only

module.exports = { verifyToken, verifyAdmin, verifyEditor, requireRole };
