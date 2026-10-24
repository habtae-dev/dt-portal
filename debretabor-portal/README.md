# Debre Tabor City Administration Portal

Bilingual (English / አማርኛ) city portal: public website, staff dashboard and REST API with a MySQL database.

| Folder | What | Dev URL |
|---|---|---|
| `backend/` | Express 5 API, schema-driven CRUD, JWT roles, uploads, tests | http://localhost:5000 |
| `client/` | Public site (React, Vite, Tailwind) | http://localhost:5173 |
| `admin/` | Staff dashboard (React, Vite) | http://localhost:5174/admin/login |
| `database/schema.sql` | Complete MySQL schema (18 tables), no sample data except two starter city facts | — |
| `docs/` | `API.md` · `ARCHITECTURE.md` · `SECURITY.md` · `DEPLOYMENT.md` | — |

## Quick start
```bash
# 1. database (recreates all tables - first run only!)
mysql -u root -p < database/schema.sql

# 2. API
cd backend && cp .env.example .env     # set DB_*, and JWT_SECRET (>= 32 random chars, see the file)
npm install                              # includes nodemailer
ADMIN_PASSWORD='choose-a-strong-one' npm run create-admin -- admin you@example.org "" Admin
npm run dev                            # http://localhost:5000/health

# 3. front ends (two terminals)
cd client && cp .env.example .env && npm install && npm run dev
cd admin  && cp .env.example .env && npm install && npm run dev
```
Sign in at http://localhost:5174/admin/login. Tests: `cd backend && npm test`.

## What it does
* **Public site**: news, tenders, vacancies, events, notices, council, executive and sub-cities, About pages, places and business guides, projects, photo and video galleries, search, online complaint filing and tracking by code, **e-mail subscription** (footer and home page), a "city at a glance" band (area, population…) above Latest Updates, EN/AM switch, accessibility bar (text size, high-visibility and dark themes).
* **Dashboard**: create / edit / hide / delete every content type in both languages, upload images, PDFs and videos, handle complaints (status + note shown to the citizen), counters and "complaints waiting" alert, **City Facts** editor, **E-mail Subscribers** (list + send an update to everyone, optionally pre-filled from a vacancy/tender/news/event/notice), works on phones. Complaint status changes are e-mailed to the citizen automatically.
* **API**: one config file per table produces the routes, validation, SQL, file clean-up and the API documentation.

## Configuration summary
| File | Important keys |
|---|---|
| `backend/.env` | `DB_*`, `JWT_SECRET`, `CORS_ORIGINS`, `TRUST_PROXY`, `NODE_ENV`, `DB_TIMEZONE`, e-mail: `SMTP_SERVICE` or `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `PUBLIC_SITE_URL` (see docs/EMAIL.md) |
| `client/.env` | `VITE_API_BASE_URL`, `VITE_API_ORIGIN`, `VITE_ADMIN_URL`, optional `VITE_CONTACT_*` |
| `admin/.env` | `VITE_API_ORIGIN`, `VITE_PUBLIC_SITE_URL` |

## Documentation
* [API reference](docs/API.md) — every endpoint, field, filter and rule (generated: `npm run docs:api`)
* [Architecture & data map](docs/ARCHITECTURE.md) — folders, table ↔ API ↔ screen map, roles
* [Security review](docs/SECURITY.md) — what was found and fixed, remaining recommendations
* [E-mail setup & troubleshooting](docs/EMAIL.md) — Gmail in 5 steps, status checks, common errors
* [Deployment](docs/DEPLOYMENT.md) — production setup, nginx, release checklist

## Not built yet
Resources / Legislation pages and newsletter (no tables for them), staff-user management screen, audit log, CAPTCHA, a scheduled digest e-mail (broadcasts are sent manually from the dashboard).
