# Debre Tabor Portal — REST API

Base URL: `http://localhost:5000/api` (set the real host in production). All bodies are JSON unless a route accepts files, in which case use `multipart/form-data`.
This file is **generated** from the code (`npm run docs:api` in `backend/`); the sections 5+ field tables always match `database/schema.sql`.

## 1. Conventions

| Topic | Rule |
|---|---|
| Success | `{ "success": true, "data": ... }` · lists add `count` · paged lists (`?limit=`) add `total`, `page`, `limit` |
| Failure | `{ "success": false, "message": "...", "errors": { field: "..." } }` (`errors` only for validation) |
| Auth | `Authorization: Bearer <JWT>` obtained from `POST /api/auth/login` (valid 12 h). The account is re-checked on every request, so a deactivated user or changed role applies immediately |
| Roles | **Admin** (everything, can register users, delete complaints) · **Editor** (create/update/delete content, handle complaints) · **Viewer** (read-only: sees drafts via `/admin/all`, no complaint access) |
| Bilingual | Every text has `<field>_en` (required where the schema says NOT NULL) and `<field>_am` (optional). Clients show `_am` and fall back to `_en` |
| Lists | `?limit=` (1–500, default 500), `?page=`, `?search=` (matches the resource's text columns, `%`/`_` are escaped), plus per-resource filters (listed below). Unknown filters are ignored |
| Public visibility | Public `GET` returns only published / active / non-expired rows. `GET /admin/all` returns everything |
| Dates | `DATE` → `YYYY-MM-DD` · `DATETIME` → `YYYY-MM-DDTHH:mm:ss` (Debre Tabor local time, `DB_TIMEZONE`, default +03:00) · `TIME` → `HH:mm:ss`. Send `YYYY-MM-DD HH:mm` or `YYYY-MM-DDTHH:mm` |
| Booleans | `true/false/1/0/yes/no/on/off` |
| Partial update | `PUT` only changes the fields you send; omitted fields are untouched |
| Files | See §4 |

### Status codes

`200` ok · `201` created · `400` validation / bad input · `401` missing, invalid or expired token, or account disabled · `403` role not allowed / origin not allowed · `404` not found · `409` duplicate unique value (reference no., job code, e-mail) · `413` file too large · `429` rate limit · `500` server error (details only in the server log)

### Rate limits (per IP, in memory)

| Route | Limit |
|---|---|
| `/api/*` | 600 / 15 min |
| `POST /api/auth/login` | 10 / 15 min per IP **and** 8 / 15 min per e-mail |
| `POST /api/complaints/submit` | 10 / hour |
| `GET /api/complaints/track/*` | 30 / 15 min |

## 2. Authentication — `/api/auth`

| Method | Path | Access | Body | Result |
|---|---|---|---|---|
| POST | `/login` | public | `{ email, password }` | `{ token, user: { id, username, email, role } }` · same `401` for unknown e-mail, wrong password and disabled account |
| GET | `/profile` | signed in | — | `{ user }` |
| PUT | `/profile` | signed in | `{ username?, email?, current_password?, new_password? }` | Changing the password needs `current_password` |
| POST | `/register` | Admin | `{ username, email, password, role? }` | `201 { userId }` · role ∈ Admin/Editor/Viewer (default Editor) |

Passwords: 8–72 characters. E-mails are stored lower-case.

## 3. Citizen complaints — `/api/complaints`

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/submit` | public | `multipart/form-data`: `citizen_name*`, `phone*`, `department*`, `subject*`, `description*`, `email`, `attachment` (image/PDF ≤ 10 MB). Returns `201 { tracking_code }` e.g. `DT-CMP-7K4Q9XM2` |
| GET | `/track/:tracking_code` | public | Only `tracking_code, department, subject, status, admin_notes, created_at, updated_at` |
| GET | `/` | Admin, Editor | All complaints. Query: `status` (Pending / In Progress / Resolved / Rejected), `department`, `search`, `limit`, `page` |
| GET | `/:id` | Admin, Editor | One complaint (all columns) |
| GET | `/:id/attachment` | Admin, Editor | Streams the private attachment (send the token; open as a blob) |
| PUT | `/:id` | Admin, Editor | `{ status, admin_notes? }` — records who handled it |
| DELETE | `/:id` | Admin | Deletes the row and its attachment |

Attachments are stored **outside** the public `/uploads` folder and are never reachable without a staff token.

## 4. Files and uploads

* Images: JPEG, PNG, WEBP · documents: PDF · videos (`video` input only): MP4, WEBM, MOV, MKV, AVI.
* Limits: 10 MB per image/PDF, 100 MB per video, 20 files and 60 fields per request.
* The extension, the declared type **and the file's real header bytes** must agree, otherwise `400` and nothing is stored.
* Public files are served from `/uploads/<name>`; stored values in the database are these relative paths. External `http(s)` links are also accepted wherever a URL column exists; a `/uploads/...` path that does not belong to the record being edited is rejected.
* Replacing or deleting a record removes its old files from disk.

## 4b. Dashboard counters

`GET /api/stats` (any signed-in user) → `{ news, tenders, vacancies, complaints, events, noticeboard, photos, videos, places, business, projects, council, executive, subCities, pendingComplaints }` (row counts).

`GET /health` → `{ ok: true }` (no auth, for load balancers).
