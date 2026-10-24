# Architecture and data map

```
 citizens ──► client (React + Vite + Tailwind, EN/AM)  ─┐
                                                        ├─► backend (Express 5, mysql2) ─► MySQL debretaborPortal
 staff    ──► admin  (React + Vite, dark dashboard)    ─┘             │
                                                                      └─► uploads/ (public) · private-uploads/ (complaints)
```

## Backend (`backend/src`)
| Folder | Role |
|---|---|
| `resources/*.js` | **One file per table**: field specs (type, required, max, enum), file columns, visibility rule, filters, search columns, order. The single source of truth for validation, SQL and API docs |
| `crud/createCrud.js`, `crudRouter.js` | Generic list / get / create / update / upsert / delete handlers and the REST router built from a resource |
| `controllers/` | Hand-written logic: auth, complaints (tracking codes, private attachments), stats |
| `middleware/` | `authMiddleware` (JWT + DB re-check, roles), `upload` (multer + real file-type check), `rateLimit`, `errorHandler` |
| `utils/` | `fields.js` (value coercion), `files.js` (upload paths and clean-up) |
| `config/db.js` | Pool, UTF-8, date handling (`DATE`/`DATETIME` as strings, session time zone) |
| `tests/` | `npm test` — CRUD rules, security, uploads (no database needed) |

## Table ↔ API ↔ screens
| Table | API | Admin page | Public page |
|---|---|---|---|
| `users` | `/api/auth/*` | Login, Profile | — (staff only) |
| `news` | `/api/news` | News & Updates | Home "Latest news", `/announcements/news` |
| `tenders` | `/api/tenders` | Tenders | `/announcements/tender` |
| `vacancies` | `/api/vacancies` | Job Vacancies | `/announcements/vacancy` |
| `events` | `/api/events` | Events | `/announcements/events` |
| `noticeboard` | `/api/noticeboard` | Noticeboard | Home panel, `/announcements/notices` |
| `photo_gallery` | `/api/photos` | Photo Gallery | `/resources/media/gallery` |
| `video_gallery` | `/api/videos` | Video Gallery | `/resources/media/video` |
| `places` | `/api/places` | Tourism Places | `/explore/park` · `monument` · `museum` |
| `doing_business` | `/api/business` | Doing Business | `/explore/business` |
| `projects` | `/api/projects` | Projects | `/projects/programs` · `/projects/projects` |
| `council_contents` | `/api/council` | City Council | `/council/*` |
| `sub_cities` | `/api/executive/sub-cities` | Sub-Cities | `/gov/subcity` |
| `executive_contents` | `/api/executive` | Executive Cabinet | `/gov/mayors` · `cabinet` · `structure` · `bureau`, home "Mayor's message" |
| `about_city` | `/api/about` | About City | `/about/history` · `geography` · `community` · `administration` |
| `complaints` | `/api/complaints/*` | Citizen Complaints | `/services/online` |
| `subscribers` | `/api/subscribers/*` | E-mail Subscribers | footer + home form, `/unsubscribe/:token` |
| `city_facts` | `/api/city-facts` | City Facts | Home band above "Latest Updates" |

Counts for the dashboard come from `GET /api/stats`.

## Conventions
* **Bilingual**: every text column pair `x_en` / `x_am`; English is the required base, Amharic optional. The client's `pick(obj,'field')` shows Amharic when present, otherwise English; the admin forms always edit both.
* **Visibility**: tables with `is_published` / `is_active` hide drafts from public endpoints; the dashboard reads `/admin/all`. Notices also expire (`expiry_date`).
* **Enums** in the schema are mirrored in the resource configs and in the dashboard forms, and checked automatically by the schema comparison in the review (see `docs/SECURITY.md` for the process; re-run it after changing `schema.sql`).
* **Schema note**: `sub_cities` has only `head_office_location_am` (no English column). If you need English, add `head_office_location_en VARCHAR(255) NULL` to the table, to `resources/subCities.js`, and to the admin and public forms.
* **Public site extras**: light / high-visibility / dark theme and text size are stored in the visitor's browser; footer contact details come from `VITE_CONTACT_*` variables; the home "at a glance" figures come from the `city_facts` table (dashboard → City Facts).
* **E-mail**: `utils/mailer.js` (nodemailer, optional). Used for the subscription confirmation, complaint status replies and dashboard broadcasts. Without `SMTP_HOST` nothing is sent and everything else works. Every e-mail to a subscriber carries a personal unsubscribe link (random 256-bit token).

## Admin roles
| Role | Content | Complaints | Subscribers | Users |
|---|---|---|---|---|
| Admin | full | read, handle, delete | list, delete, send | register |
| Editor | create / edit / delete | read, handle | list, delete, send | — |
| Viewer | read incl. drafts | none | none | — |
