const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const mysql = require('mysql2/promise');

// All timestamps are stored/read as Debre Tabor wall-clock time (EAT, UTC+03:00 by default).
const TZ = /^[+-]\d{2}:\d{2}$/.test(process.env.DB_TIMEZONE || '') ? process.env.DB_TIMEZONE : '+03:00';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'debretaborPortal',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Return temporal columns as plain strings so they never shift with the Node process time zone:
  //   DATE      -> "2026-09-22"
  //   DATETIME  -> "2026-09-22T10:00:00"   (parses as local time in every browser)
  typeCast(field, next) {
    if (field.type === 'DATE') return field.string();
    if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
      const s = field.string();
      return s ? s.replace(' ', 'T') : null;
    }
    return next();
  }
});

pool.on('connection', (conn) => conn.query(`SET time_zone = '${TZ}'`));

pool.getConnection()
  .then((c) => { console.log(`Database connected (thread ${c.threadId})`); c.release(); })
  .catch((err) => console.error('Error connecting to the database:', err.message));

module.exports = pool;
