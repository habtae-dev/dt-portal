const fs = require('fs');
const path = require('path');

// Public uploads (news photos, tender PDFs ...) are served statically from /uploads.
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
// Citizen complaint attachments may contain personal documents: they live OUTSIDE the static folder and are only
// reachable through the authenticated GET /api/complaints/:id/attachment endpoint.
const PRIVATE_DIR = path.join(__dirname, '..', '..', 'private-uploads');

const toUrl = (file) => `/uploads/${file.filename}`;
const toPrivateUrl = (file) => `/private/${file.filename}`;

// Maps a stored path to a real file, or null when the value is not one of our own paths (external links are never touched).
const resolveStored = (u) => {
  if (typeof u !== 'string') return null;
  if (u.startsWith('/uploads/')) return path.join(UPLOAD_DIR, path.basename(u));
  if (u.startsWith('/private/')) return path.join(PRIVATE_DIR, path.basename(u));
  return null;
};

const removeFiles = (urls) => {
  [].concat(urls || []).forEach((u) => {
    const file = resolveStored(u);
    if (file) fs.unlink(file, () => {});
  });
};

// Every file multer saved for a request (single, array or fields shape).
const uploadedFiles = (req) => [].concat(req.file || [], Array.isArray(req.files) ? req.files : Object.values(req.files || {}).flat());
const uploadedPaths = (req) => uploadedFiles(req).map((f) => (f.destination === PRIVATE_DIR ? toPrivateUrl(f) : toUrl(f)));

module.exports = { UPLOAD_DIR, PRIVATE_DIR, toUrl, toPrivateUrl, resolveStored, removeFiles, uploadedFiles, uploadedPaths };
