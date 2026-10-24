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

## 5. Content resources

### Sub-city — `/api/executive/sub-cities`

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/executive/sub-cities` | public | List (published / active only). Query: `search`, `limit`, `page` |
| GET | `/api/executive/sub-cities/admin/all` | any signed-in user | Same filters, **including drafts / hidden / expired** |
| GET | `/api/executive/sub-cities/:id` | public | One record (404 if not visible) |
| POST | `/api/executive/sub-cities` | Admin, Editor | Create |
| PUT | `/api/executive/sub-cities/:id` | Admin, Editor | Partial update (only the fields you send) |
| DELETE | `/api/executive/sub-cities/:id` | Admin, Editor | Delete (also removes its uploaded files) |

Table `sub_cities` · public rows: `t.is_active = 1` · order: `t.name_en ASC`

| Field | Type | Required |
|---|---|---|
| `name_en` | string(150) | **yes** |
| `name_am` | string(150) | no |
| `description_en` | text | no |
| `description_am` | text | no |
| `head_office_location_am` | string(255) | no |
| `contact_phone` | string(50) | no |
| `is_active` | bool | no |

### News article — `/api/news`

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/news` | public | List (published / active only). Query: `search`, `category`, `limit`, `page` |
| GET | `/api/news/admin/all` | any signed-in user | Same filters, **including drafts / hidden / expired** |
| GET | `/api/news/:id` | public | One record (404 if not visible) |
| POST | `/api/news` | Admin, Editor | Create |
| PUT | `/api/news/:id` | Admin, Editor | Partial update (only the fields you send) |
| DELETE | `/api/news/:id` | Admin, Editor | Delete (also removes its uploaded files) |

Table `news` · public rows: `t.is_published = 1` · order: `t.created_at DESC`

| Field | Type | Required |
|---|---|---|
| `title_en` | string(255) | **yes** |
| `title_am` | string(255) | no |
| `content_en` | text | **yes** |
| `content_am` | text | no |
| `category` | string(100) | no (default) |
| `is_published` | bool | no |

**File inputs** (send as `multipart/form-data`):

| Input | Stored in | Notes |
|---|---|---|
| `images` | `images` | up to 5 files, JSON array; on update send `existing_images` (JSON array of URLs to keep) |

### Tender — `/api/tenders`

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/tenders` | public | List. Query: `search`, `status`, `limit`, `page` |
| GET | `/api/tenders/admin/all` | any signed-in user | Same filters, **including drafts / hidden / expired** |
| GET | `/api/tenders/:id` | public | One record |
| POST | `/api/tenders` | Admin, Editor | Create |
| PUT | `/api/tenders/:id` | Admin, Editor | Partial update (only the fields you send) |
| DELETE | `/api/tenders/:id` | Admin, Editor | Delete (also removes its uploaded files) |

Table `tenders` · every row is public · order: `t.created_at DESC`

| Field | Type | Required |
|---|---|---|
| `reference_no` | string(100) | **yes** |
| `title_en` | string(255) | **yes** |
| `title_am` | string(255) | no |
| `description_en` | text | no |
| `description_am` | text | no |
| `document_url` | url(500) | no |
| `submission_place` | string(255) | no (default) |
| `submission_instructions_en` | text | no |
| `submission_instructions_am` | text | no |
| `closing_date` | datetime | **yes** |
| `status` | enum: Open \| Closed \| Awarded | no (default) |

**File inputs** (send as `multipart/form-data`):

| Input | Stored in | Notes |
|---|---|---|
| `document` | `document_url` | one file; a new upload replaces the old one |

### Vacancy — `/api/vacancies`

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/vacancies` | public | List. Query: `search`, `status`, `department`, `employment_type`, `limit`, `page` |
| GET | `/api/vacancies/admin/all` | any signed-in user | Same filters, **including drafts / hidden / expired** |
| GET | `/api/vacancies/:id` | public | One record |
| POST | `/api/vacancies` | Admin, Editor | Create |
| PUT | `/api/vacancies/:id` | Admin, Editor | Partial update (only the fields you send) |
| DELETE | `/api/vacancies/:id` | Admin, Editor | Delete (also removes its uploaded files) |

Table `vacancies` · every row is public · order: `t.deadline ASC`

| Field | Type | Required |
|---|---|---|
| `job_code` | string(50) | **yes** |
| `position_title_en` | string(255) | **yes** |
| `position_title_am` | string(255) | no |
| `department` | string(150) | **yes** |
| `employment_type` | enum: Permanent \| Contract | no (default) |
| `quantity` | int, min 1 | no (default) |
| `description_en` | text | no |
| `description_am` | text | no |
| `qualifications_en` | text | no |
| `qualifications_am` | text | no |
| `document_url` | url(500) | no |
| `application_place` | string(255) | no (default) |
| `deadline` | date | **yes** |
| `status` | enum: Open \| Closed | no (default) |

**File inputs** (send as `multipart/form-data`):

| Input | Stored in | Notes |
|---|---|---|
| `document` | `document_url` | one file; a new upload replaces the old one |

### Event — `/api/events`

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/events` | public | List (published / active only). Query: `search`, `limit`, `page` |
| GET | `/api/events/admin/all` | any signed-in user | Same filters, **including drafts / hidden / expired** |
| GET | `/api/events/:id` | public | One record (404 if not visible) |
| POST | `/api/events` | Admin, Editor | Create |
| PUT | `/api/events/:id` | Admin, Editor | Partial update (only the fields you send) |
| DELETE | `/api/events/:id` | Admin, Editor | Delete (also removes its uploaded files) |

Table `events` · public rows: `t.is_published = 1` · order: `t.event_date ASC`

| Field | Type | Required |
|---|---|---|
| `title_en` | string(255) | **yes** |
| `title_am` | string(255) | no |
| `description_en` | text | no |
| `description_am` | text | no |
| `event_date` | date | **yes** |
| `start_time` | time | no |
| `end_time` | time | no |
| `location_en` | string(255) | **yes** |
| `location_am` | string(255) | no |
| `image_url` | url(500) | no |
| `is_published` | bool | no |

**File inputs** (send as `multipart/form-data`):

| Input | Stored in | Notes |
|---|---|---|
| `image` | `image_url` | one file; a new upload replaces the old one |

### Notice — `/api/noticeboard`

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/noticeboard` | public | List (published / active only). Query: `search`, `priority`, `limit`, `page` |
| GET | `/api/noticeboard/admin/all` | any signed-in user | Same filters, **including drafts / hidden / expired** |
| GET | `/api/noticeboard/:id` | public | One record (404 if not visible) |
| POST | `/api/noticeboard` | Admin, Editor | Create |
| PUT | `/api/noticeboard/:id` | Admin, Editor | Partial update (only the fields you send) |
| DELETE | `/api/noticeboard/:id` | Admin, Editor | Delete (also removes its uploaded files) |

Table `noticeboard` · public rows: `t.is_active = 1 AND t.expiry_date >= CURDATE()` · order: `FIELD(t.priority, 'Urgent', 'Important', 'Normal'), t.created_at DESC`

| Field | Type | Required |
|---|---|---|
| `title_en` | string(255) | **yes** |
| `title_am` | string(255) | no |
| `notice_body_en` | text | **yes** |
| `notice_body_am` | text | no |
| `target_audience` | string(150) | no (default) |
| `priority` | enum: Normal \| Important \| Urgent | no (default) |
| `document_url` | url(500) | no |
| `is_active` | bool | no |
| `expiry_date` | date | **yes** |

**File inputs** (send as `multipart/form-data`):

| Input | Stored in | Notes |
|---|---|---|
| `document` | `document_url` | one file; a new upload replaces the old one |

### Photo album — `/api/photos`

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/photos` | public | List (published / active only). Query: `search`, `category`, `limit`, `page` |
| GET | `/api/photos/admin/all` | any signed-in user | Same filters, **including drafts / hidden / expired** |
| GET | `/api/photos/:id` | public | One record (404 if not visible) |
| POST | `/api/photos` | Admin, Editor | Create |
| PUT | `/api/photos/:id` | Admin, Editor | Partial update (only the fields you send) |
| DELETE | `/api/photos/:id` | Admin, Editor | Delete (also removes its uploaded files) |

Table `photo_gallery` · public rows: `t.is_published = 1` · order: `t.created_at DESC`

| Field | Type | Required |
|---|---|---|
| `title_en` | string(255) | **yes** |
| `title_am` | string(255) | no |
| `category` | string(100) | no (default) |
| `is_published` | bool | no |

**File inputs** (send as `multipart/form-data`):

| Input | Stored in | Notes |
|---|---|---|
| `images` | `images` | up to 10 files, JSON array, at least 1; on update send `existing_images` (JSON array of URLs to keep) |

### Video — `/api/videos`

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/videos` | public | List (published / active only). Query: `search`, `category`, `limit`, `page` |
| GET | `/api/videos/admin/all` | any signed-in user | Same filters, **including drafts / hidden / expired** |
| GET | `/api/videos/:id` | public | One record (404 if not visible) |
| POST | `/api/videos` | Admin, Editor | Create |
| PUT | `/api/videos/:id` | Admin, Editor | Partial update (only the fields you send) |
| DELETE | `/api/videos/:id` | Admin, Editor | Delete (also removes its uploaded files) |

Table `video_gallery` · public rows: `t.is_published = 1` · order: `t.created_at DESC`

| Field | Type | Required |
|---|---|---|
| `title_en` | string(255) | **yes** |
| `title_am` | string(255) | no |
| `description_en` | text | no |
| `description_am` | text | no |
| `video_url` | url(500) | **yes** |
| `thumbnail_url` | url(500) | no |
| `category` | string(100) | no (default) |
| `is_published` | bool | no |

**File inputs** (send as `multipart/form-data`):

| Input | Stored in | Notes |
|---|---|---|
| `video` | `video_url` | one file; a new upload replaces the old one |
| `thumbnail` | `thumbnail_url` | one file; a new upload replaces the old one |

### Place — `/api/places`

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/places` | public | List (published / active only). Query: `search`, `category`, `limit`, `page` |
| GET | `/api/places/admin/all` | any signed-in user | Same filters, **including drafts / hidden / expired** |
| GET | `/api/places/:id` | public | One record (404 if not visible) |
| POST | `/api/places` | Admin, Editor | Create |
| PUT | `/api/places/:id` | Admin, Editor | Partial update (only the fields you send) |
| DELETE | `/api/places/:id` | Admin, Editor | Delete (also removes its uploaded files) |

Table `places` · public rows: `t.is_published = 1` · order: `t.created_at DESC`

| Field | Type | Required |
|---|---|---|
| `name_en` | string(255) | **yes** |
| `name_am` | string(255) | no |
| `category` | enum: Park \| Monument \| Museum | **yes** |
| `description_en` | text | no |
| `description_am` | text | no |
| `location_en` | string(255) | no |
| `location_am` | string(255) | no |
| `google_maps_url` | url(500) | no |
| `is_published` | bool | no |

**File inputs** (send as `multipart/form-data`):

| Input | Stored in | Notes |
|---|---|---|
| `images` | `images` | up to 5 files, JSON array; on update send `existing_images` (JSON array of URLs to keep) |

### Business guide — `/api/business`

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/business` | public | List (published / active only). Query: `search`, `category`, `limit`, `page` |
| GET | `/api/business/admin/all` | any signed-in user | Same filters, **including drafts / hidden / expired** |
| GET | `/api/business/:id` | public | One record (404 if not visible) |
| POST | `/api/business` | Admin, Editor | Create |
| PUT | `/api/business/:id` | Admin, Editor | Partial update (only the fields you send) |
| DELETE | `/api/business/:id` | Admin, Editor | Delete (also removes its uploaded files) |

Table `doing_business` · public rows: `t.is_published = 1` · order: `t.created_at DESC`

| Field | Type | Required |
|---|---|---|
| `title_en` | string(255) | **yes** |
| `title_am` | string(255) | no |
| `category` | enum: Investment Guide \| Business License \| Incentives \| Opportunities | **yes** |
| `content_en` | text | **yes** |
| `content_am` | text | no |
| `document_url` | url(500) | no |
| `is_published` | bool | no |

**File inputs** (send as `multipart/form-data`):

| Input | Stored in | Notes |
|---|---|---|
| `document` | `document_url` | one file; a new upload replaces the old one |

### Project — `/api/projects`

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/projects` | public | List (published / active only). Query: `search`, `category`, `status`, `limit`, `page` |
| GET | `/api/projects/admin/all` | any signed-in user | Same filters, **including drafts / hidden / expired** |
| GET | `/api/projects/:id` | public | One record (404 if not visible) |
| POST | `/api/projects` | Admin, Editor | Create |
| PUT | `/api/projects/:id` | Admin, Editor | Partial update (only the fields you send) |
| DELETE | `/api/projects/:id` | Admin, Editor | Delete (also removes its uploaded files) |

Table `projects` · public rows: `t.is_published = 1` · order: `t.created_at DESC`

| Field | Type | Required |
|---|---|---|
| `category` | enum: Program \| Project | no (default) |
| `title_en` | string(255) | **yes** |
| `title_am` | string(255) | no |
| `description_en` | text | no |
| `description_am` | text | no |
| `status` | enum: Planned \| Ongoing \| Completed \| On Hold | no (default) |
| `budget` | decimal, min 0 | no |
| `location_en` | string(255) | no |
| `location_am` | string(255) | no |
| `start_date` | date | no |
| `end_date` | date | no |
| `document_url` | url(500) | no |
| `is_published` | bool | no |

**File inputs** (send as `multipart/form-data`):

| Input | Stored in | Notes |
|---|---|---|
| `images` | `images` | up to 5 files, JSON array; on update send `existing_images` (JSON array of URLs to keep) |
| `document` | `document_url` | one file; a new upload replaces the old one |

### Council content — `/api/council`

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/council` | public | List (published / active only). Query: `search`, `subcategory`, `limit`, `page` |
| GET | `/api/council/admin/all` | any signed-in user | Same filters, **including drafts / hidden / expired** |
| GET | `/api/council/:id` | public | One record (404 if not visible) |
| POST | `/api/council` | Admin, Editor | Create |
| PUT | `/api/council/:id` | Admin, Editor | Partial update (only the fields you send) |
| DELETE | `/api/council/:id` | Admin, Editor | Delete (also removes its uploaded files) |

Table `council_contents` · public rows: `t.is_published = 1` · order: `t.created_at ASC`

| Field | Type | Required |
|---|---|---|
| `subcategory` | enum: overview \| structure \| speaker \| standing_committees | **yes** |
| `title_en` | string(255) | **yes** |
| `title_am` | string(255) | no |
| `content_en` | text | no |
| `content_am` | text | no |
| `image_url` | url(500) | no |
| `document_url` | url(500) | no |
| `is_published` | bool | no |

**File inputs** (send as `multipart/form-data`):

| Input | Stored in | Notes |
|---|---|---|
| `image` | `image_url` | one file; a new upload replaces the old one |
| `document` | `document_url` | one file; a new upload replaces the old one |

### Executive content — `/api/executive`

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/executive` | public | List (published / active only). Query: `search`, `category`, `limit`, `page` |
| GET | `/api/executive/admin/all` | any signed-in user | Same filters, **including drafts / hidden / expired** |
| GET | `/api/executive/:id` | public | One record (404 if not visible) |
| POST | `/api/executive` | Admin, Editor | Create |
| PUT | `/api/executive/:id` | Admin, Editor | Partial update (only the fields you send) |
| DELETE | `/api/executive/:id` | Admin, Editor | Delete (also removes its uploaded files) |

Table `executive_contents` · public rows: `t.is_published = 1` · order: `t.created_at ASC`

| Field | Type | Required |
|---|---|---|
| `category` | enum: mayor \| cabinet \| structure \| bureau | **yes** |
| `title_en` | string(255) | **yes** |
| `title_am` | string(255) | no |
| `person_name_en` | string(150) | no |
| `person_name_am` | string(150) | no |
| `position_en` | string(150) | no |
| `position_am` | string(150) | no |
| `content_en` | text | no |
| `content_am` | text | no |
| `image_url` | url(500) | no |
| `document_url` | url(500) | no |
| `is_published` | bool | no |

**File inputs** (send as `multipart/form-data`):

| Input | Stored in | Notes |
|---|---|---|
| `image` | `image_url` | one file; a new upload replaces the old one |
| `document` | `document_url` | one file; a new upload replaces the old one |

### About section — `/api/about`

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/about` | public | List (published / active only). Query: `search`, `category`, `limit`, `page` |
| GET | `/api/about/admin/all` | any signed-in user | Same filters, **including drafts / hidden / expired** |
| GET | `/api/about/:category` | public | One record (404 if not visible) |
| PUT | `/api/about/:category` | Admin, Editor | Create or update the row for this category |

Table `about_city` · public rows: `t.is_published = 1` · order: `t.id ASC`

| Field | Type | Required |
|---|---|---|
| `category` | enum: history \| geography \| community \| city_administration | **yes** |
| `title_en` | string(255) | **yes** |
| `title_am` | string(255) | no |
| `content_en` | text | **yes** |
| `content_am` | text | no |
| `image_url` | url(500) | no |
| `is_published` | bool | no |

**File inputs** (send as `multipart/form-data`):

| Input | Stored in | Notes |
|---|---|---|
| `image` | `image_url` | one file; a new upload replaces the old one |

### City fact — `/api/city-facts`

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/city-facts` | public | List (published / active only). Query: `search`, `limit`, `page` |
| GET | `/api/city-facts/admin/all` | any signed-in user | Same filters, **including drafts / hidden / expired** |
| GET | `/api/city-facts/:id` | public | One record (404 if not visible) |
| POST | `/api/city-facts` | Admin, Editor | Create |
| PUT | `/api/city-facts/:id` | Admin, Editor | Partial update (only the fields you send) |
| DELETE | `/api/city-facts/:id` | Admin, Editor | Delete (also removes its uploaded files) |

Table `city_facts` · public rows: `t.is_published = 1` · order: `t.sort_order ASC, t.id ASC`

| Field | Type | Required |
|---|---|---|
| `label_en` | string(100) | **yes** |
| `label_am` | string(100) | no |
| `value_en` | string(100) | **yes** |
| `value_am` | string(100) | no |
| `note_en` | string(150) | no |
| `note_am` | string(150) | no |
| `icon` | string(16) | no |
| `sort_order` | int | no (default) |
| `is_published` | bool | no |

## 5b. Subscriptions (e-mail updates)

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/subscribers` | public (10 per hour per IP) | `{ "email", "language": "en"\|"am" }` — subscribe (or re-activate). Always answers `201` for a valid address, so the form cannot be used to discover who is subscribed. A confirmation e-mail with an unsubscribe link is sent for new addresses |
| POST | `/api/subscribers/unsubscribe` | public | `{ "token" }` — token from the e-mail link (`/unsubscribe/:token` on the website) |
| GET | `/api/subscribers` | Admin, Editor | List. Query: `search`, `active=1\|0`. Returns `mail_configured` too. Tokens are never returned |
| DELETE | `/api/subscribers/:id` | Admin, Editor | Remove a subscriber |
| GET | `/api/subscribers/mail-status` | Admin, Editor | Is e-mail configured and does the mail-server login work? `{ configured, working, problems[], error, from, provider }` (never contains the password) |
| POST | `/api/subscribers/test` | Admin, Editor | `{ to? }` — send one test e-mail (default: your own address); `502` with the real reason when it fails |
| POST | `/api/subscribers/broadcast` | Admin, Editor | `{ subject_en*, message_en*, subject_am, message_am, link }` — e-mail all active subscribers (Amharic subscribers get the Amharic text if given). `503` if SMTP is not configured. Returns `{ total, sent, failed }` |

Complaint e-mails: filing a complaint with an e-mail address sends a confirmation with the tracking code. `PUT /api/complaints/:id` (`status`, `admin_notes`, optional `notify`, default true) e-mails the citizen the new status and note, in English and Amharic, and answers with `email`: `sent` \| `failed` (+`error`) \| `no-address` \| `not-configured` \| `skipped`. The status is saved in every case.
E-mail settings (`SMTP_SERVICE=gmail` or `SMTP_HOST`/`SMTP_PORT`/`SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `PUBLIC_SITE_URL`): see [EMAIL.md](EMAIL.md).

## 6. Examples

```bash
# log in
curl -s -X POST localhost:5000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.org","password":"********"}'

# public: latest news, page 1, 6 per page
curl -s 'localhost:5000/api/news?limit=6&page=1'

# create a tender with a PDF (Editor/Admin)
curl -s -X POST localhost:5000/api/tenders -H "Authorization: Bearer $TOKEN" \
  -F reference_no=DT/T/2026/001 -F title_en='Road works' -F closing_date='2026-11-15 10:00' \
  -F document=@spec.pdf

# keep two of three photos of a news article and add one more
curl -s -X PUT localhost:5000/api/news/12 -H "Authorization: Bearer $TOKEN" \
  -F 'existing_images=["/uploads/images-1.jpg","/uploads/images-2.jpg"]' -F images=@new.jpg

# subscribe to e-mail updates
curl -s -X POST localhost:5000/api/subscribers -H 'Content-Type: application/json' -d '{"email":"citizen@example.org","language":"am"}'

# citizen files a complaint, then tracks it
curl -s -X POST localhost:5000/api/complaints/submit -F citizen_name='Almaz T.' -F phone=0911000000 \
  -F department=Roads -F subject='Broken street light' -F description='Light is out on the main road'
curl -s localhost:5000/api/complaints/track/DT-CMP-7K4Q9XM2
```

## 7. Changing the API

Add or edit a file in `backend/src/resources/` (columns, enums, files, visibility, filters), mount it in `backend/src/routes/index.js`, run `npm test` and `npm run docs:api`. The CRUD layer builds the routes, validation, SQL, file clean-up and this documentation from that one file.
