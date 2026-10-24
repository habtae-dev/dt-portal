// Turns raw request values into values that are valid for the column described by a field spec.
// Spec: { type, required, max, min, values (enum), notNull }
//   type: string | text | int | decimal | bool | enum | date | datetime | time | url
//   notNull: column is NOT NULL with a DB default -> an empty value means "leave it alone"
const SKIP = Symbol('skip');

const RE = {
  date: /^(\d{4})-(\d{2})-(\d{2})(?:$|[T ])/,
  datetime: /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/,
  time: /^(\d{2}):(\d{2})(?::(\d{2}))?$/
};

const isEmpty = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

const toBool = (v) => {
  if (typeof v === 'boolean') return v ? 1 : 0;
  const s = String(v).trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(s)) return 1;
  if (['false', '0', 'no', 'off'].includes(s)) return 0;
  return null;
};

const validDate = (y, m, d) => {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};

// Returns the cleaned value, SKIP (don't touch the column), or throws Error(message).
function coerce(spec, raw) {
  if (raw === undefined) return SKIP;
  // objects/arrays (e.g. a repeated or bracketed form key) are never valid column values
  if (raw !== null && typeof raw === 'object') throw new Error('is not valid');

  if (isEmpty(raw)) {
    if (spec.required) throw new Error('is required');
    if (spec.notNull) return SKIP;
    return spec.type === 'bool' ? SKIP : null;
  }

  switch (spec.type) {
    case 'string':
    case 'text':
    case 'url': {
      const s = String(raw).trim();
      const max = spec.max || (spec.type === 'text' ? 65535 : 255);
      if (s.length > max) throw new Error(`must be at most ${max} characters`);
      if (spec.type === 'url' && !/^(https?:\/\/|\/uploads\/)/i.test(s)) throw new Error('must be an http(s) URL or an uploaded file path');
      return s;
    }
    case 'int': {
      const n = Number(raw);
      if (!Number.isInteger(n)) throw new Error('must be a whole number');
      if (spec.min !== undefined && n < spec.min) throw new Error(`must be at least ${spec.min}`);
      return n;
    }
    case 'decimal': {
      const n = Number(raw);
      if (!Number.isFinite(n)) throw new Error('must be a number');
      if (spec.min !== undefined && n < spec.min) throw new Error(`must be at least ${spec.min}`);
      if (Math.abs(n) >= 1e13) throw new Error('is too large');
      return Math.round(n * 100) / 100;
    }
    case 'bool': {
      const b = toBool(raw);
      if (b === null) throw new Error('must be true or false');
      return b;
    }
    case 'enum': {
      const s = String(raw).trim();
      if (!spec.values.includes(s)) throw new Error(`must be one of: ${spec.values.join(', ')}`);
      return s;
    }
    case 'date': {
      const m = RE.date.exec(String(raw).trim());
      if (!m || !validDate(+m[1], +m[2], +m[3])) throw new Error('must be a valid date (YYYY-MM-DD)');
      return `${m[1]}-${m[2]}-${m[3]}`;
    }
    case 'datetime': {
      const s = String(raw).trim();
      const m = RE.datetime.exec(s);
      if (!m) throw new Error('must be a valid date and time (YYYY-MM-DD HH:MM)');
      const [y, mo, d] = m[1].split('-').map(Number);
      if (!validDate(y, mo, d) || +m[2] > 23 || +m[3] > 59) throw new Error('must be a valid date and time');
      return `${m[1]} ${m[2]}:${m[3]}:${m[4] || '00'}`;
    }
    case 'time': {
      const m = RE.time.exec(String(raw).trim());
      if (!m || +m[1] > 23 || +m[2] > 59) throw new Error('must be a valid time (HH:MM)');
      return `${m[1]}:${m[2]}:${m[3] || '00'}`;
    }
    default:
      throw new Error(`unsupported field type "${spec.type}"`);
  }
}

module.exports = { coerce, SKIP, toBool };
