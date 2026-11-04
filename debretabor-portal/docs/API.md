# Debre Tabor Portal — API Cheat Sheet

**Base URL:** `http://localhost:5000/api` (use the real host in production). Bodies are JSON; routes with files use `multipart/form-data`.

## 1. Basics

| Topic | Rule |
| --- | --- |
| Success | `{ success: true, data }` · lists add `count` · paged lists add `total`, `page`, `limit` |
| Failure | `{ success: false, message, errors? }` (`errors` only for validation) |
| Auth | `Authorization: Bearer <JWT>` from `POST /auth/login` (valid 12 h). Account is re-checked on every request |
| Roles | **Admin**: everything, plus delete complaints · **Editor**: create/update/delete content, handle complaints · **Viewer**: read-only (sees drafts via `/admin/all`, no complaints) |
| Languages | Each text has `_en` (required if NOT NULL) and optional `_am`. Show `_am`, fall back to `_en` |
| List query | `limit` (1–500, default 500), `page`, `search`, plus resource filters. Unknown filters are ignored |
| Visibility | Public `GET` shows only published / active / non-expired rows. `/admin/all` shows all |
| Dates | `DATE` `YYYY-MM-DD` · `DATETIME` `YYYY-MM-DDTHH:mm:ss` (local, +03:00) · `TIME` `HH:mm:ss`. Send `YYYY-MM-DD HH:mm` or `YYYY-MM-DDTHH:mm` |
| Booleans | `true/false/1/0/yes/no/on/off` |
| Update | `PUT` changes only the fields you send |

**Status codes:** `200` ok · `201` created · `400` bad input · `401` no/invalid token or disabled account · `403` not allowed · `404` not found · `409` duplicate · `413` file too large · `429` rate limit · `500` server error

**Rate limits (per IP):** all `/api/*` 600 per 15 min · login 10 per 15 min (and 8 per 15 min per e-mail) · complaint submit 10 per hour · complaint track 30 per 15 min

## 2. Auth — `/auth`

| Method | Path | Access | Body / Result |
| --- | --- | --- | --- |
| POST | `/login` | Public | `{ email, password }` → `{ token, user }`. Same `401` for any failure |
| GET | `/profile` | Signed in | → `{ user }` |
| PUT | `/profile` | Signed in | `{ username?, email?, current_password?, new_password? }` (password change needs `current_password`) |

Passwords are 8–72 characters. E-mails are stored in lower case.

## 3. Complaints — `/complaints`

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/submit` | Public | `multipart`: `citizen_name*`, `phone*`, `department*`, `subject*`, `description*`, `email`, `attachment` (image/PDF, max 10 MB) → `201 { tracking_code }` |
| GET | `/track/:code` | Public | Safe fields only: code, department, subject, status, admin\_notes, dates |
| GET | `/` | Admin, Editor | List. Filters: `status` (Pending, In Progress, Resolved, Rejected), `department`, `search`, `limit`, `page` |
| GET | `/:id` | Admin, Editor | Full record |
| GET | `/:id/attachment` | Admin, Editor | Private attachment (token required) |
| PUT | `/:id` | Admin, Editor | `{ status, admin_notes?, notify? }` — records who handled it |
| DELETE | `/:id` | Admin | Delete row and attachment |

Attachments are stored outside `/uploads` and need a staff token.

## 4. Files

- **Types:** JPEG, PNG, WEBP, PDF; videos (`video` input only): MP4, WEBM, MOV, MKV, AVI.
- **Limits:** 10 MB per image/PDF, 100 MB per video, 20 files and 60 fields per request.
- **Checks:** extension, declared type and real file header must agree, or `400` and nothing is stored.
- **Storage:** public files at `/uploads/<name>` (relative paths in the DB). External `http(s)` links are allowed in URL columns; another record's `/uploads/...` path is rejected.
- **Clean-up:** replacing or deleting a record deletes its old files.

## 5. Utility routes

- `GET /stats` (signed in): row counts for news, tenders, vacancies, complaints, events, noticeboard, photos, videos, places, business, projects, council, executive, subCities, pendingComplaints.
- `GET /health`: `{ ok: true }`, no auth.

## 6. Content resources

### Standard routes

Every resource below (except About) has these. `<base>` is its path.

| Method | Path | Access |
| --- | --- | --- |
| GET | `<base>` | Public (published/active only) |
| GET | `<base>/admin/all` | Signed in (includes drafts/hidden/expired) |
| GET | `<base>/:id` | Public (404 if not visible) |
| POST | `<base>` | Admin, Editor |
| PUT | `<base>/:id` | Admin, Editor |
| DELETE | `<base>/:id` | Admin, Editor (also deletes files) |

### Overview

| Resource | Base path | Extra filters | Public rows | Order |
| --- | --- | --- | --- | --- |
| News | `/news` | `category` | published | newest |
| Tenders | `/tenders` | `status` | all | newest |
| Vacancies | `/vacancies` | `status`, `department`, `employment_type` | all | deadline ↑ |
| Events | `/events` | — | published | event date ↑ |
| Notices | `/noticeboard` | `priority` | active and not expired | Urgent → Important → Normal, then newest |
| Photo albums | `/photos` | `category` | published | newest |
| Videos | `/videos` | `category` | published | newest |
| Places | `/places` | `category` | published | newest |
| Business guide | `/business` | `category` | published | newest |
| Projects | `/projects` | `category`, `status` | published | newest |
| Council | `/council` | `subcategory` | published | oldest |
| Executive | `/executive` | `category` | published | oldest |
| Sub-cities | `/executive/sub-cities` | — | active | name A–Z |
| City facts | `/city-facts` | — | published | `sort_order`, `id` |
| About | `/about` | `category` | published | `id` |

All resources also accept `search`, `limit`, `page`.

### Fields

**\*** = required. Everything else is optional. Fields marked *(default)* have a default value. `_am` fields are optional Amharic versions.

**News** (`news`)

| Field | Type |
| --- | --- |
| `title_en`\*, `title_am` | string(255) |
| `content_en`\*, `content_am` | text |
| `category` *(default)* | string(100) |
| `is_published` | bool |

Files: `images` (up to 5). On update send `existing_images` (JSON array of URLs to keep).

**Tenders** (`tenders`)

| Field | Type |
| --- | --- |
| `reference_no`\* (unique) | string(100) |
| `title_en`\*, `title_am` | string(255) |
| `description_en`, `description_am` | text |
| `submission_place` *(default)* | string(255) |
| `submission_instructions_en`, `_am` | text |
| `closing_date`\* | datetime |
| `status` *(default)* | Open, Closed, Awarded |
| `document_url` | url(500) |

Files: `document` → `document_url`.

**Vacancies** (`vacancies`)

| Field | Type |
| --- | --- |
| `job_code`\* (unique) | string(50) |
| `position_title_en`\*, `_am` | string(255) |
| `department`\* | string(150) |
| `employment_type` *(default)* | Permanent, Contract |
| `quantity` *(default)* | int, min 1 |
| `description_en`, `_am`, `qualifications_en`, `_am` | text |
| `application_place` *(default)* | string(255) |
| `deadline`\* | date |
| `status` *(default)* | Open, Closed |
| `document_url` | url(500) |

Files: `document` → `document_url`.

**Events** (`events`)

| Field | Type |
| --- | --- |
| `title_en`\*, `title_am` | string(255) |
| `description_en`, `_am` | text |
| `event_date`\* | date |
| `start_time`, `end_time` | time |
| `location_en`\*, `location_am` | string(255) |
| `image_url` | url(500) |
| `is_published` | bool |

Files: `image` → `image_url`.

**Notices** (`noticeboard`)

| Field | Type |
| --- | --- |
| `title_en`\*, `title_am` | string(255) |
| `notice_body_en`\*, `_am` | text |
| `target_audience` *(default)* | string(150) |
| `priority` *(default)* | Normal, Important, Urgent |
| `expiry_date`\* | date |
| `document_url` | url(500) |
| `is_active` | bool |

Files: `document` → `document_url`.

**Photo albums** (`photo_gallery`)

| Field | Type |
| --- | --- |
| `title_en`\*, `title_am` | string(255) |
| `category` *(default)* | string(100) |
| `is_published` | bool |

Files: `images` (1–10, required). On update send `existing_images`.

**Videos** (`video_gallery`)

| Field | Type |
| --- | --- |
| `title_en`\*, `title_am` | string(255) |
| `description_en`, `_am` | text |
| `video_url`\*, `thumbnail_url` | url(500) |
| `category` *(default)* | string(100) |
| `is_published` | bool |

Files: `video` → `video_url`, `thumbnail` → `thumbnail_url`.

**Places** (`places`)

| Field | Type |
| --- | --- |
| `name_en`\*, `name_am` | string(255) |
| `category`\* | Park, Monument, Museum |
| `description_en`, `_am` | text |
| `location_en`, `location_am` | string(255) |
| `google_maps_url` | url(500) |
| `is_published` | bool |

Files: `images` (up to 5). On update send `existing_images`.

**Business guide** (`doing_business`)

| Field | Type |
| --- | --- |
| `title_en`\*, `title_am` | string(255) |
| `category`\* | Investment Guide, Business License, Incentives, Opportunities |
| `content_en`\*, `content_am` | text |
| `document_url` | url(500) |
| `is_published` | bool |

Files: `document` → `document_url`.

**Projects** (`projects`)

| Field | Type |
| --- | --- |
| `category` *(default)* | Program, Project |
| `title_en`\*, `title_am` | string(255) |
| `description_en`, `_am` | text |
| `status` *(default)* | Planned, Ongoing, Completed, On Hold |
| `budget` | decimal, min 0 |
| `location_en`, `location_am` | string(255) |
| `start_date`, `end_date` | date |
| `document_url` | url(500) |
| `is_published` | bool |

Files: `images` (up to 5, use `existing_images` on update), `document` → `document_url`.

**Council** (`council_contents`)

| Field | Type |
| --- | --- |
| `subcategory`\* | overview, structure, speaker, standing\_committees |
| `title_en`\*, `title_am` | string(255) |
| `content_en`, `_am` | text |
| `image_url`, `document_url` | url(500) |
| `is_published` | bool |

Files: `image` → `image_url`, `document` → `document_url`.

**Executive** (`executive_contents`)

| Field | Type |
| --- | --- |
| `category`\* | mayor, cabinet, structure, bureau |
| `title_en`\*, `title_am` | string(255) |
| `person_name_en`, `_am`, `position_en`, `_am` | string(150) |
| `content_en`, `_am` | text |
| `image_url`, `document_url` | url(500) |
| `is_published` | bool |

Files: `image` → `image_url`, `document` → `document_url`.

**Sub-cities** (`sub_cities`)

| Field | Type |
| --- | --- |
| `name_en`\*, `name_am` | string(150) |
| `description_en`, `_am` | text |
| `head_office_location_am` | string(255) |
| `contact_phone` | string(50) |
| `is_active` | bool |

**City facts** (`city_facts`)

| Field | Type |
| --- | --- |
| `label_en`\*, `label_am` | string(100) |
| `value_en`\*, `value_am` | string(100) |
| `note_en`, `note_am` | string(150) |
| `icon` | string(16) |
| `sort_order` *(default)* | int |
| `is_published` | bool |

**About** (`about_city`) — one row per category, no POST or DELETE

| Method | Path | Access |
| --- | --- | --- |
| GET | `/about`, `/about/admin/all`, `/about/:category` | Public / signed in / public |
| PUT | `/about/:category` | Admin, Editor (create or update) |

| Field | Type |
| --- | --- |
| `category`\* | history, geography, community, city\_administration |
| `title_en`\*, `title_am` | string(255) |
| `content_en`\*, `content_am` | text |
| `image_url` | url(500) |
| `is_published` | bool |

Files: `image` → `image_url`.

> Tip: in every resource, a new file upload replaces the old file.

## 7. E-mail subscriptions — `/subscribers`

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/` | Public (10/h per IP) | `{ email, language: en\|am }` subscribe or re-activate. Always `201` for a valid address, so nobody can probe who is subscribed |
| POST | `/unsubscribe` | Public | `{ token }` from the e-mail link |
| GET | `/` | Admin, Editor | List. Filters: `search`, `active=1\|0`. Tokens are never returned |
| DELETE | `/:id` | Admin, Editor | Remove a subscriber |
| GET | `/mail-status` | Admin, Editor | Is e-mail set up and working? |
| POST | `/test` | Admin, Editor | `{ to? }` send one test e-mail (`502` with the reason on failure) |
| POST | `/broadcast` | Admin, Editor | `{ subject_en*, message_en*, subject_am, message_am, link }` → `{ total, sent, failed }`. `503` if SMTP is not configured |

**Complaint e-mails:** a complaint with an e-mail gets a confirmation with its tracking code. `PUT /complaints/:id` e-mails the citizen the new status and note (English and Amharic) unless `notify=false`. The response `email` is `sent`, `failed`, `no-address`, `not-configured` or `skipped`; the status is always saved.

**Settings:** `SMTP_SERVICE=gmail` or `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE`, plus `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `PUBLIC_SITE_URL`. See `EMAIL.md`.

## 8. Examples

```bash
# log in
curl -s -X POST localhost:5000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.org","password":"********"}'

# public: latest news, 6 per page
curl -s 'localhost:5000/api/news?limit=6&page=1'

# create a tender with a PDF
curl -s -X POST localhost:5000/api/tenders -H "Authorization: Bearer $TOKEN" \
  -F reference_no=DT/T/2026/001 -F title_en='Road works' -F closing_date='2026-11-15 10:00' \
  -F document=@spec.pdf

# keep two photos of a news article and add one
curl -s -X PUT localhost:5000/api/news/12 -H "Authorization: Bearer $TOKEN" \
  -F 'existing_images=["/uploads/images-1.jpg","/uploads/images-2.jpg"]' -F images=@new.jpg

# subscribe
curl -s -X POST localhost:5000/api/subscribers -H 'Content-Type: application/json' \
  -d '{"email":"citizen@example.org","language":"am"}'

# file a complaint, then track it
curl -s -X POST localhost:5000/api/complaints/submit -F citizen_name='Almaz T.' -F phone=0911000000 \
  -F department=Roads -F subject='Broken street light' -F description='Light is out on the main road'
curl -s localhost:5000/api/complaints/track/DT-CMP-7K4Q9XM2
```

## 9. Changing the API

Edit or add a file in `backend/src/resources/`, mount it in `backend/src/routes/index.js`, then run `npm test` and `npm run docs:api`. Routes, validation, SQL, file clean-up and these docs are all generated from that one file.
