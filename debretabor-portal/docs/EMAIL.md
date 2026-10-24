# E-mail setup and troubleshooting

The portal sends three kinds of e-mail. All of them use the same settings in `backend/.env`.

| E-mail | Sent when | To |
|---|---|---|
| Complaint received | a citizen files a complaint and typed an e-mail address | that address (contains the tracking code) |
| **Complaint status / response** | staff press **Save** on a complaint (the "E-mail this status and note to the citizen" box is ticked by default) | the e-mail on the complaint |
| Subscription confirmation | someone subscribes in the footer / home page / complaint form | that address |
| Updates | staff use **E-mail Subscribers → Send an update** (can be pre-filled from a vacancy, tender, news item, event or notice) | all active subscribers |

Every message is bilingual (English + Amharic); subscribers get the language they chose.

## 1. Gmail in 5 steps
1. Google account → Security → turn on **2-Step Verification**.
2. Open https://myaccount.google.com/apppasswords and create an App Password (16 characters). Your normal password will **not** work.
3. In `backend/.env`:
   ```
   SMTP_SERVICE=gmail
   SMTP_USER=yourname@gmail.com
   SMTP_PASS=abcd efgh ijkl mnop
   PUBLIC_SITE_URL=http://localhost:5173
   ```
   (leave `SMTP_HOST` empty, `MAIL_FROM` is optional)
4. `cd backend && npm install` (adds nodemailer) and **restart** the backend. `.env` is only read at start-up.
5. The start-up log says either `Mail: ready (gmail, from ...)` or the exact reason it is not working. In the dashboard open **E-mail Subscribers**: the *E-mail status* box must be green; press **Send test e-mail**.

Other providers: set `SMTP_HOST`, `SMTP_PORT` (587, or 465 with `SMTP_SECURE=true`), `SMTP_USER`, `SMTP_PASS`, and `MAIL_FROM`.

## 2. Where do I see what went wrong?
* Backend console at start-up: `Mail: NOT configured - ...` or `Mail: configured but NOT working - ...`
* Dashboard → E-mail Subscribers → *E-mail status* (live check of the login) and *Send test e-mail* (shows the real error).
* Dashboard → Citizen Complaints → after **Save** a green / orange bar says whether the citizen was e-mailed, or why not.

## 3. Common problems
| Message | Cause and fix |
|---|---|
| `SMTP_HOST is empty (or set SMTP_SERVICE=gmail)` | Nothing selected. Use `SMTP_SERVICE=gmail` or fill `SMTP_HOST` |
| `SMTP_USER is not an e-mail address` / `MAIL_FROM is empty` | `SMTP_USER` must be the full address (`name@gmail.com`), not a display name |
| `login refused ... (535 / EAUTH)` | Wrong password. Gmail needs an **App Password** with 2-Step Verification, not the account password |
| `cannot reach the mail server (ENOTFOUND / ETIMEDOUT / ECONNECTION)` | Wrong `SMTP_HOST`/`SMTP_PORT`, no internet, or a firewall blocks port 587/465 |
| `nodemailer is not installed` | Run `npm install` in `backend/` and restart |
| Status shows green but nothing arrives | Look in the spam folder; with Gmail the sender is always the logged-in address; check the address on the complaint |
| Citizen not e-mailed | The complaint has no e-mail address, or "notify" was unticked when saving |
| Links in e-mails point to localhost | Set `PUBLIC_SITE_URL` (backend) and `VITE_PUBLIC_SITE_URL` (admin) to the real website address |

## 4. Good practice
* Gmail allows roughly 500 messages a day; for a larger list use a transactional provider (Brevo, Mailgun, SES …) with your own domain and SPF / DKIM / DMARC records.
* Never commit `backend/.env`; if a password was shared by mistake, create a new App Password and delete the old one.
* Every subscriber e-mail carries a personal unsubscribe link; unsubscribed addresses are not mailed again.
