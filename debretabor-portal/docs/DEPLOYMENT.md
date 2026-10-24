# Deployment guide

## Requirements
Node.js 20+, MySQL 8 (or MariaDB 10.5+), nginx (or any static host + reverse proxy), a domain with HTTPS.

## 1. Database
```bash
mysql -u root -p < database/schema.sql        # creates debretaborPortal - DROPS existing tables, run once only
mysql -u root -p -e "CREATE USER 'debretabor_app'@'localhost' IDENTIFIED BY '<strong password>';
 GRANT SELECT,INSERT,UPDATE,DELETE ON debretaborPortal.* TO 'debretabor_app'@'localhost';"
```
The schema inserts two starter city facts (population, elevation); edit or delete them in the dashboard and add the official city area. Schedule `mysqldump` backups and back up `backend/uploads` and `backend/private-uploads`.

## 2. API
```bash
cd backend && cp .env.example .env            # fill DB_*, JWT_SECRET, CORS_ORIGINS, NODE_ENV=production, TRUST_PROXY=true
npm ci --omit=dev
npm run create-admin -- admin you@example.org "" Admin   # with ADMIN_PASSWORD='...' in the environment
npm test                                       # optional, needs dev dependencies (npm ci)
NODE_ENV=production node src/server.js         # or: pm2 start src/server.js --name dt-api
```
Make sure the process user can write `backend/uploads` and `backend/private-uploads`.

## 3. Front ends (build once, serve the `dist/` folders)
```bash
cd client && cp .env.example .env   # VITE_API_BASE_URL=https://api.example.org/api  VITE_API_ORIGIN=https://api.example.org
                                    # VITE_ADMIN_URL=https://admin.example.org/admin/login  + VITE_CONTACT_*
npm ci && npm run build
cd ../admin && cp .env.example .env # VITE_API_ORIGIN=https://api.example.org
npm ci && npm run build
```
Both are single-page apps: configure the server to fall back to `index.html`.

## 4. nginx sketch
```nginx
server { server_name api.example.org; client_max_body_size 110m;
  location / { proxy_pass http://127.0.0.1:5000; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header Host $host; } }
server { server_name example.org;       root /var/www/dt/client/dist; location / { try_files $uri /index.html; } }
server { server_name admin.example.org; root /var/www/dt/admin/dist;  location / { try_files $uri /index.html; } }
```
Add TLS (certbot) and the security headers from `docs/SECURITY.md`. Set `CORS_ORIGINS=https://example.org,https://admin.example.org`.

## 5. Release checklist
- [ ] `JWT_SECRET` is new and random; `.env` files are not in git
- [ ] `NODE_ENV=production`, `TRUST_PROXY=true` behind nginx
- [ ] MySQL user is not root; backups run and a restore was tested
- [ ] `npm audit` clean for all three packages; `npm test` passes
- [ ] Facts banner / contact details filled in (`VITE_*`), photos are licensed
- [ ] First admin created, test logins for Editor and Viewer roles
- [ ] Submit a test complaint, track it, open its attachment as staff

## E-mail (subscribers, complaint replies)
Follow [EMAIL.md](EMAIL.md). In short: `SMTP_SERVICE=gmail` + `SMTP_USER` + App Password (or your provider's `SMTP_HOST`), `PUBLIC_SITE_URL` = the real website, `VITE_PUBLIC_SITE_URL` in `admin/.env`, `npm install` in `backend/`, restart, and check Dashboard → E-mail Subscribers → *E-mail status*.
