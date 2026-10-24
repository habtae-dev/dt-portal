// Test helper: replaces the MySQL pool with an in-memory fake so the tests need no database.
//   globalThis.__sql      -> every query that was executed ({ sql, params })
//   globalThis.__handler  -> (sql, params) => result, set by each test to script the database
process.env.JWT_SECRET = process.env.JWT_SECRET || 'x'.repeat(40);
const dbPath = require.resolve('../src/config/db');

globalThis.__sql = [];
globalThis.__handler = null;
const pool = {
  async query(sql, params) {
    globalThis.__sql.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    const h = globalThis.__handler;
    return h ? h(sql, params) : [[], []];
  },
  on() {},
  async end() {}
};
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: pool };

module.exports = { pool };
