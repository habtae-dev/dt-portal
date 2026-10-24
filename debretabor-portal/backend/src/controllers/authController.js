const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ROLES = ['Admin', 'Editor', 'Viewer'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_TTL = process.env.JWT_EXPIRES_IN || '12h';

// Request values must be plain strings: objects/arrays in a JSON body would otherwise reach the SQL layer.
const str = (v) => (typeof v === 'string' ? v.trim() : '');

// bcrypt only uses the first 72 bytes; cap the length so huge passwords cannot be used to burn CPU.
const passwordProblem = (pw) => {
  if (typeof pw !== 'string' || pw.length < 8) return 'Password must be at least 8 characters.';
  if (pw.length > 72) return 'Password must be at most 72 characters.';
  return null;
};

// Used to spend the same time on unknown e-mails as on real ones (stops account enumeration by response time).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

// POST /api/auth/register  (Admin only)
const registerAdmin = async (req, res) => {
  try {
    const username = str(req.body?.username);
    const email = str(req.body?.email).toLowerCase();
    const { password, role } = req.body || {};

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }
    if (username.length > 100 || email.length > 150 || !EMAIL_RE.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid username or email.' });
    }
    const pwProblem = passwordProblem(password);
    if (pwProblem) return res.status(400).json({ success: false, message: pwProblem });
    if (role !== undefined && !ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Username or Email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, password_hash, role || 'Editor']
    );
    res.status(201).json({ success: true, message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// POST /api/auth/login
const loginAdmin = async (req, res) => {
  try {
    const email = str(req.body?.email).toLowerCase();
    const password = req.body?.password;

    if (!email || typeof password !== 'string' || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    const user = users[0];

    // always run one bcrypt comparison, whether or not the account exists
    const isMatch = await bcrypt.compare(password.slice(0, 72), user ? user.password_hash : DUMMY_HASH);

    // same answer for "unknown e-mail", "wrong password" and "deactivated account"
    if (!user || !isMatch || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_TTL, algorithm: 'HS256' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// GET /api/auth/profile
const getAdminProfile = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, user: users[0] });
  } catch (error) {
    console.error('Get Profile Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error while fetching profile.' });
  }
};

// PUT /api/auth/profile  (own username / email / password)
const updateAdminProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });
    const user = users[0];

    const username = str(req.body?.username) || user.username;
    const email = (str(req.body?.email) || user.email).toLowerCase();
    const { current_password, new_password } = req.body || {};

    if (username.length > 100 || email.length > 150 || !EMAIL_RE.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid username or email.' });
    }

    let password_hash = user.password_hash;
    if (new_password !== undefined && new_password !== '') {
      const problem = passwordProblem(new_password);
      if (problem) return res.status(400).json({ success: false, message: problem });
      if (typeof current_password !== 'string' || !current_password) {
        return res.status(400).json({ success: false, message: 'Current password is required to set a new password.' });
      }
      if (!(await bcrypt.compare(current_password.slice(0, 72), user.password_hash))) {
        return res.status(401).json({ success: false, message: 'Incorrect current password.' });
      }
      password_hash = await bcrypt.hash(new_password, 10);
    }

    const [clash] = await pool.query('SELECT id FROM users WHERE (email = ? OR username = ?) AND id <> ?', [email, username, userId]);
    if (clash.length > 0) return res.status(409).json({ success: false, message: 'Username or Email already in use.' });

    await pool.query('UPDATE users SET username = ?, email = ?, password_hash = ? WHERE id = ?', [username, email, password_hash, userId]);
    res.status(200).json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error while updating profile.' });
  }
};

module.exports = { registerAdmin, loginAdmin, getAdminProfile, updateAdminProfile };
