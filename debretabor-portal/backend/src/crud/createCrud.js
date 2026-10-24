// Schema-driven CRUD handlers. One resource config (see ../resources/*.js) produces:
//   list, adminList, getOne, create, update, upsert, remove
// Every column name comes from the config (i.e. from the SQL schema), never from user input, and every
// value is validated/coerced against its field spec before it reaches MySQL.
const pool = require('../config/db');
const HttpError = require('../utils/HttpError');
const { coerce, SKIP } = require('../utils/fields');
const { toUrl, removeFiles, uploadedPaths } = require('../utils/files');

const MAX_ROWS = 500;
const q = (name) => `\`${name}\``;
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const parseJsonArray = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v !== 'string') return null;
  try { const p = JSON.parse(v); return Array.isArray(p) ? p : null; } catch { return null; }
};

function createCrud(config) {
  const {
    table,
    label = table,
    fields = {},
    files = {},            // { inputName: { column, multiple?, max?, required? } }
    publicWhere = null,    // SQL condition (alias t) every public read must satisfy
    filters = {},          // { queryParam: 't.column' } equality filters
    search = [],           // columns searched by ?search=
    orderBy = 't.created_at DESC',
    key = 'id',            // column used by getOne / upsert lookups
    select = `SELECT t.* FROM ${table} t`,
    validate,              // (mergedRow) => { field: 'message' }
    beforeCreate           // (values, req) => void
  } = config;

  const fileColumns = Object.values(files).map((f) => f.column);

  // ---- helpers -----------------------------------------------------------------------------------------
  const parseKey = (raw) => {
    if (key === 'id') {
      const n = Number(raw);
      if (!Number.isInteger(n) || n < 1) throw new HttpError(404, `${label} not found.`);
      return n;
    }
    const spec = fields[key];
    if (!spec || (spec.type === 'enum' && !spec.values.includes(raw))) throw new HttpError(404, `${label} not found.`);
    return raw;
  };

  const fetchRow = async (value, { publicOnly = false } = {}) => {
    const cond = [`t.${q(key)} = ?`];
    if (publicOnly && publicWhere) cond.push(`(${publicWhere})`);
    const [rows] = await pool.query(`${select} WHERE ${cond.join(' AND ')} LIMIT 1`, [value]);
    return rows[0] || null;
  };

  // Validates req.body (+ uploaded files) against the field specs.
  // current === null  -> create (all required fields enforced)
  // current === row   -> partial update (only fields that were sent are touched)
  const readInput = (req, current) => {
    const body = req.body || {};
    const uploaded = req.files || {};
    const raw = { ...body };
    const errors = {};
    const values = {};
    const replacedFiles = [];

    // single-file inputs: an uploaded file wins over a posted URL text field
    for (const [input, f] of Object.entries(files)) {
      if (f.multiple) continue;
      const file = (uploaded[input] || [])[0];
      if (file) raw[f.column] = toUrl(file);
      // a posted text value may keep the current file or point to an external link, but never to another record's upload
      else if (typeof raw[f.column] === 'string' && raw[f.column].startsWith('/uploads/') && (!current || raw[f.column] !== current[f.column])) {
        errors[f.column] = `${f.column} must be an uploaded file or an http(s) link`;
        delete raw[f.column];
      }
    }

    for (const [name, spec] of Object.entries(fields)) {
      try {
        // on create, a required field that was not sent at all is an error (coerce() skips undefined)
        const v = coerce(spec, !current && spec.required && raw[name] === undefined ? '' : raw[name]);
        if (v !== SKIP) values[name] = v;
      } catch (e) {
        errors[name] = `${name} ${e.message}`;
      }
    }

    // multi-file inputs (JSON array columns)
    for (const [input, f] of Object.entries(files)) {
      if (!f.multiple) continue;
      const newUrls = (uploaded[input] || []).map(toUrl);
      const currentList = current ? parseJsonArray(current[f.column]) || [] : [];
      const keepRaw = body[`existing_${input}`];
      let final = null;

      if (!current) {
        final = newUrls;
      } else if (newUrls.length || keepRaw !== undefined) {
        const keep = keepRaw === undefined ? [] : (parseJsonArray(keepRaw) || []).filter((u) => currentList.includes(u));
        final = keep.concat(newUrls);
      }

      if (final !== null) {
        if (f.max && final.length > f.max) errors[input] = `${input}: at most ${f.max} files are allowed`;
        else if (f.required && final.length === 0) errors[input] = `${input}: at least one file is required`;
        else {
          values[f.column] = JSON.stringify(final);
          replacedFiles.push(...currentList.filter((u) => !final.includes(u)));
        }
      } else if (!current && f.required) {
        errors[input] = `${input}: at least one file is required`;
      }
    }

    if (!Object.keys(errors).length && validate) Object.assign(errors, validate({ ...(current || {}), ...values }) || {});

    // single-file columns that changed: the previous uploaded file is no longer referenced
    if (current) {
      for (const f of Object.values(files)) {
        if (!f.multiple && values[f.column] !== undefined && current[f.column] && current[f.column] !== values[f.column]) {
          replacedFiles.push(current[f.column]);
        }
      }
    }
    return { values, errors, replacedFiles };
  };

  const failIfInvalid = (errors) => {
    if (Object.keys(errors).length) throw new HttpError(400, Object.values(errors).join('; '), errors);
  };

  const buildWhere = (req, publicOnly) => {
    const conds = [];
    const params = [];
    if (publicOnly && publicWhere) conds.push(`(${publicWhere})`);
    for (const [param, col] of Object.entries(filters)) {
      const v = req.query[param];
      if (typeof v === 'string' && v !== '') { conds.push(`${col} = ?`); params.push(v); }
    }
    const term = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
    if (term && search.length) {
      conds.push(`(${search.map((c) => `t.${q(c)} LIKE ?`).join(' OR ')})`);
      const like = `%${term.replace(/[\\%_]/g, '\\$&')}%`;
      search.forEach(() => params.push(like));
    }
    return { where: conds.length ? `WHERE ${conds.join(' AND ')}` : '', params };
  };

  const listHandler = (publicOnly) => wrap(async (req, res) => {
    const { where, params } = buildWhere(req, publicOnly);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || MAX_ROWS, 1), MAX_ROWS);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const [rows] = await pool.query(
      `${select} ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...params, limit, (page - 1) * limit]
    );
    const out = { success: true, count: rows.length, data: rows };
    if (req.query.limit !== undefined) {
      const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM ${table} t ${where}`, params);
      Object.assign(out, { total, page, limit });
    }
    res.status(200).json(out);
  });

  // ---- handlers ----------------------------------------------------------------------------------------
  const getOne = wrap(async (req, res) => {
    const row = await fetchRow(parseKey(req.params[key === 'id' ? 'id' : key]), { publicOnly: true });
    if (!row) throw new HttpError(404, `${label} not found.`);
    res.status(200).json({ success: true, data: row });
  });

  const create = wrap(async (req, res) => {
    const newPaths = uploadedPaths(req);
    try {
      const { values, errors } = readInput(req, null);
      if (beforeCreate) beforeCreate(values, req);
      failIfInvalid(errors);
      const cols = Object.keys(values);
      if (!cols.length) throw new HttpError(400, 'No data provided.');
      const [result] = await pool.query(
        `INSERT INTO ${table} (${cols.map(q).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
        cols.map((c) => values[c])
      );
      const row = await fetchRow(result.insertId);
      res.status(201).json({ success: true, message: `${label} created successfully.`, id: result.insertId, data: row });
    } catch (err) {
      removeFiles(newPaths);
      throw err;
    }
  });

  const applyUpdate = async (req, current) => {
    const { values, errors, replacedFiles } = readInput(req, current);
    failIfInvalid(errors);
    const cols = Object.keys(values);
    if (cols.length) {
      await pool.query(
        `UPDATE ${table} SET ${cols.map((c) => `${q(c)} = ?`).join(', ')} WHERE ${q(key)} = ?`,
        [...cols.map((c) => values[c]), current[key]]
      );
      removeFiles(replacedFiles);
    }
    return fetchRow(current[key]);
  };

  const update = wrap(async (req, res) => {
    const newPaths = uploadedPaths(req);
    try {
      const current = await fetchRow(parseKey(req.params[key === 'id' ? 'id' : key]));
      if (!current) throw new HttpError(404, `${label} not found.`);
      const row = await applyUpdate(req, current);
      res.status(200).json({ success: true, message: `${label} updated successfully.`, data: row });
    } catch (err) {
      removeFiles(newPaths);
      throw err;
    }
  });

  // Create-or-update by the unique `key` column (about_city.category).
  const upsert = wrap(async (req, res) => {
    const newPaths = uploadedPaths(req);
    try {
      const keyValue = parseKey(req.params[key] ?? req.body[key]);
      const current = await fetchRow(keyValue);
      if (current) {
        const row = await applyUpdate(req, current);
        return res.status(200).json({ success: true, message: `${label} updated successfully.`, data: row });
      }
      req.body = { ...req.body, [key]: keyValue };
      const { values, errors } = readInput(req, null);
      failIfInvalid(errors);
      const cols = Object.keys(values);
      await pool.query(
        `INSERT INTO ${table} (${cols.map(q).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
        cols.map((c) => values[c])
      );
      const row = await fetchRow(keyValue);
      res.status(201).json({ success: true, message: `${label} created successfully.`, data: row });
    } catch (err) {
      removeFiles(newPaths);
      throw err;
    }
  });

  const remove = wrap(async (req, res) => {
    const current = await fetchRow(parseKey(req.params[key === 'id' ? 'id' : key]));
    if (!current) throw new HttpError(404, `${label} not found.`);
    await pool.query(`DELETE FROM ${table} WHERE ${q(key)} = ?`, [current[key]]);
    fileColumns.forEach((col) => removeFiles(parseJsonArray(current[col]) || current[col]));
    res.status(200).json({ success: true, message: `${label} deleted successfully.` });
  });

  return {
    list: listHandler(true),
    adminList: listHandler(false),
    getOne, create, update, upsert, remove,
    _readInput: readInput // exposed for unit tests
  };
}

module.exports = createCrud;
