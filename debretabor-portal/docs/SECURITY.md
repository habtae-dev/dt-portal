# Security review and hardening

Review date: 2026-10-13 · scope: backend, admin dashboard, public client, database schema. Everything marked **fixed** is covered by `npm test` in `backend/`.

## Findings that were fixed

| # | Severity | Finding | Fix |
|---|---|---|---|
| 1 | High | Citizen complaint attachments (IDs, letters) were saved in the public `/uploads` folder with guessable names | Stored in `backend/private-uploads/` (not served); read only via `GET /api/complaints/:id/attachment` with a staff token |
| 2 | High | A JWT stayed valid for 24 h after the account was disabled or demoted, and the role came from the token | The token is verified **and** the user is re-read from MySQL on every request; role and `is_active` come from the database; lifetime is 12 h; only `HS256` is accepted |
| 3 | High | Objects in JSON/multipart bodies (`{"email":{"a":1}}`, `status[]=x`) could reach SQL parameters (mysql2 expands objects into `col = val` pairs) | Auth and complaint inputs must be plain strings; the field coercer rejects objects/arrays; `urlencoded` is flat-only (`extended:false`); list filters accept strings only |
| 4 | Medium | Upload checks trusted the browser-sent file type | Extension + declared type + real header bytes (JPEG/PNG/WEBP/PDF/MP4/WEBM/MKV/MOV/AVI); rejected files are deleted; random 64-bit names from `crypto` |
| 5 | Medium | Login revealed whether an e-mail exists (response time, "account deactivated" message) | One bcrypt comparison always runs; one generic 401 for unknown / wrong password / disabled |
| 6 | Medium | Brute force only limited per IP | Additional limit of 8 attempts / 15 min per e-mail address |
| 7 | Medium | Read-only **Viewer** role could read all complaints (phone numbers) | Complaint routes require Admin or Editor |
| 8 | Medium | An editor could set `document_url=/uploads/<another record's file>`; deleting the record then deleted the other file | A posted `/uploads/...` path is accepted only if it is the record's own current file |
| 9 | Medium | Public news API exposed staff user names (`author_name`) | Removed from the public select |
| 10 | Low | Missing API headers / CORS failure returned 500 | `Content-Security-Policy: default-src 'none'; sandbox` on API and uploads, `X-Frame-Options: DENY`, `Permissions-Policy`, HSTS in production, CORS denial returns 403 |
| 11 | Low | Weak input rules on register/profile (no length/e-mail checks, passwords > 72 bytes silently truncated by bcrypt) | Password 8–72 chars, e-mail format, length limits; `ER_DATA_TOO_LONG` maps to 400 |
| 12 | Low | `create-admin` needed the password on the command line | May be passed as `ADMIN_PASSWORD` instead |
| 13 | Info | A `backend/.env` (real credentials) was inside the zip you sent | Never commit or zip it; `.gitignore` covers it. **Rotate any secret that left your machine** |

## E-mail subscription (added later)

| Risk | Control |
|---|---|
| List harvesting through the sign-up form | Same `201` reply for new, existing and re-activated addresses; 10 sign-ups / hour / IP |
| Using the form to spam a third party | A single confirmation mail only for brand-new addresses; every mail has a one-click unsubscribe (token = 32 random bytes) |
| Address list leaking | List / delete / broadcast need Admin or Editor (not Viewer); unsubscribe tokens are never returned by the API |
| HTML / header injection from message text | Messages are HTML-escaped, `link` must be http(s), subjects are length-limited and sanitised by nodemailer |
| Mail-bomb through the dashboard | Broadcast limited to 10 per hour; sends 3 at a time |
| Mail errors breaking requests | Mailer never throws; without SMTP settings nothing is sent |
| Production advice | Use a dedicated sender domain with SPF / DKIM / DMARC; keep `SMTP_PASS` only in `backend/.env` |

## Already in place

* All SQL is parameterised; column names come only from the resource configs (the schema), never from user input; `LIKE` wildcards are escaped; `limit` is capped at 500.
* Writes only accept configured fields (no mass assignment); enums, lengths, dates and URLs (http/https or own uploads only — no `javascript:`) are validated.
* bcrypt password hashes (cost 10); the server refuses to start without a 32+ character `JWT_SECRET`.
* React escapes all output; there is no `dangerouslySetInnerHTML`; external links use `rel="noopener noreferrer"`.
* Rate limits on every API route, login, complaint submission and tracking; 1 MB JSON limit.

## Known limits / recommendations

1. **Token storage.** The admin app keeps the JWT in `localStorage`, so an XSS bug would expose it. Mitigate with the CSP below, keep dependencies updated, and consider moving to an `HttpOnly` cookie + CSRF token if the admin grows.
2. **Rate limiter is in memory** (one Node process). Behind several instances use Redis (`express-rate-limit` + store) and set `TRUST_PROXY=true` so client IPs are real.
3. **No CAPTCHA** on complaint submission; the 10/hour/IP limit is the only spam control. Add hCaptcha/Turnstile if abused.
4. **No user-management screen**: create staff with `POST /api/auth/register` (Admin) or `npm run create-admin`; to disable a user set `users.is_active = 0` (takes effect immediately).
5. **Dependencies**: run `npm audit` in `backend`, `admin`, `client` before every release and keep the lock files committed. (Packages could not be installed in the review sandbox, so no audit was run there.)
6. **Database user**: use a dedicated account with only `SELECT, INSERT, UPDATE, DELETE` on `debretaborPortal`. `schema.sql` **drops all tables** — never run it on a live database; use it once, then take backups.
7. **Antivirus**: uploads are type-checked, not scanned. Add ClamAV if untrusted users may upload (today only staff and the optional complaint attachment can).
8. **Audit trail**: complaint handling stores `handled_by`; content edits are not logged.

## Recommended web-server headers (nginx, for `client` and `admin`)

```
add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: https://www.google.com https://maps.gstatic.com https://API_HOST; media-src 'self' https://API_HOST; frame-src https://www.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self' https://API_HOST; object-src 'none'; base-uri 'self'; frame-ancestors 'none'" always;
add_header X-Content-Type-Options nosniff always;
add_header Referrer-Policy strict-origin-when-cross-origin always;
add_header Strict-Transport-Security "max-age=15552000; includeSubDomains" always;
```
Replace `API_HOST` with your API origin (the admin dashboard additionally needs it under `img-src`/`connect-src`).
