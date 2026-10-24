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
