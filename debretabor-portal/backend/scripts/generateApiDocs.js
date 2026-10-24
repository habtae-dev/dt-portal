// Regenerates docs/API.md from the real resource configs, so the field tables can never drift from the code.
//   npm run docs:api
const fs = require('fs');
const path = require('path');

const MOUNTS = {
  '/executive/sub-cities': 'subCities', '/news': 'news', '/tenders': 'tenders', '/vacancies': 'vacancies', '/events': 'events',
  '/noticeboard': 'noticeboard', '/photos': 'photoGallery', '/videos': 'videoGallery', '/places': 'places',
  '/business': 'doingBusiness', '/projects': 'projects', '/council': 'council', '/executive': 'executive', '/about': 'aboutCity', '/city-facts': 'cityFacts'
};

const dir = path.join(__dirname, '..', 'src', 'resources');
const fieldRow = (name, f) => {
  const type = f.type === 'enum' ? `enum: ${f.values.join(' \\| ')}` : f.type + (f.max ? `(${f.max})` : '') + (f.min !== undefined ? `, min ${f.min}` : '');
  const req = f.required ? '**yes**' : f.notNull ? 'no (default)' : 'no';
  return `| \`${name}\` | ${type} | ${req} |`;
};

let out = '';
for (const [mount, file] of Object.entries(MOUNTS)) {
  const c = require(path.join(dir, file));
  const base = `/api${mount}`;
  const idParam = c.key && c.key !== 'id' ? `:${c.key}` : ':id';
  const routes = new Set(c.routes || ['list', 'adminList', 'get', 'create', 'update', 'remove']);

  out += `### ${c.label} — \`${base}\`\n\n`;
  out += '| Method | Path | Access | Purpose |\n|---|---|---|---|\n';
  if (routes.has('list')) out += `| GET | \`${base}\` | public | List${c.publicWhere ? ' (published / active only)' : ''}. Query: ${['`search`', ...Object.keys(c.filters || {}).map((k) => `\`${k}\``), '`limit`', '`page`'].join(', ')} |\n`;
  if (routes.has('adminList')) out += `| GET | \`${base}/admin/all\` | any signed-in user | Same filters, **including drafts / hidden / expired** |\n`;
  if (routes.has('get')) out += `| GET | \`${base}/${idParam}\` | public | One record${c.publicWhere ? ' (404 if not visible)' : ''} |\n`;
  if (routes.has('create')) out += `| POST | \`${base}\` | Admin, Editor | Create |\n`;
  if (routes.has('upsert')) out += `| PUT | \`${base}/${idParam}\` | Admin, Editor | Create or update the row for this ${c.key} |\n`;
  if (routes.has('update')) out += `| PUT | \`${base}/${idParam}\` | Admin, Editor | Partial update (only the fields you send) |\n`;
  if (routes.has('remove')) out += `| DELETE | \`${base}/${idParam}\` | Admin, Editor | Delete (also removes its uploaded files) |\n`;
  out += '\n';
  out += `Table \`${c.table}\`${c.publicWhere ? ` · public rows: \`${c.publicWhere}\`` : ' · every row is public'} · order: \`${c.orderBy}\`\n\n`;
  out += '| Field | Type | Required |\n|---|---|---|\n';
  out += Object.entries(c.fields).map(([n, f]) => fieldRow(n, f)).join('\n') + '\n';
  const fl = Object.entries(c.files || {});
  if (fl.length) {
    out += '\n**File inputs** (send as `multipart/form-data`):\n\n| Input | Stored in | Notes |\n|---|---|---|\n';
    out += fl.map(([n, f]) => `| \`${n}\` | \`${f.column}\` | ${f.multiple ? `up to ${f.max || 10} files, JSON array${f.required ? ', at least 1' : ''}; on update send \`existing_${n}\` (JSON array of URLs to keep)` : 'one file; a new upload replaces the old one'} |`).join('\n') + '\n';
  }
  out += '\n';
}

const head = fs.readFileSync(path.join(__dirname, 'api-docs', 'head.md'), 'utf8');
const tail = fs.readFileSync(path.join(__dirname, 'api-docs', 'tail.md'), 'utf8');
const target = path.join(__dirname, '..', '..', 'docs', 'API.md');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, `${head}\n## 5. Content resources\n\n${out}${tail}`);
console.log('Wrote', target);
