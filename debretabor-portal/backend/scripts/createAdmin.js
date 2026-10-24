// Usage:  npm run create-admin -- <username> <email> <password> [Admin|Editor|Viewer]
//         or keep the password out of your shell history:  ADMIN_PASSWORD='...' npm run create-admin -- <username> <email> "" Admin
// Creates a user with a real bcrypt hash (the schema seeds no users).
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

(async () => {
  const [username, rawEmail, argPassword, role = 'Admin'] = process.argv.slice(2);
  const password = argPassword || process.env.ADMIN_PASSWORD;
  const email = (rawEmail || '').toLowerCase();
  if (!username || !email || !password) {
    console.error('Usage: npm run create-admin -- <username> <email> <password> [Admin|Editor|Viewer]');
    process.exit(1);
  }
  if (password.length < 8 || password.length > 72) { console.error('Password must be 8-72 characters.'); process.exit(1); }
  if (!['Admin', 'Editor', 'Viewer'].includes(role)) { console.error('Invalid role.'); process.exit(1); }
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)', [username, email, hash, role]);
    console.log(`Created ${role} "${username}" <${email}>`);
  } catch (e) {
    console.error('Failed:', e.code === 'ER_DUP_ENTRY' ? 'username or email already exists' : e.message);
    process.exitCode = 1;
  } finally { await pool.end(); }
})();
