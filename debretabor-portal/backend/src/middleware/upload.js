const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const HttpError = require('../utils/HttpError');
const { UPLOAD_DIR, PRIVATE_DIR, removeFiles, uploadedFiles, uploadedPaths } = require('../utils/files');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(PRIVATE_DIR, { recursive: true });

const storageFor = (dir) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  // unguessable name; the extension is limited to the allow-list below
  filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname).toLowerCase()}`)
});

// extension AND declared mimetype must match the allow-list (the real bytes are checked afterwards, see SIGNATURES)
const DOCS_AND_IMAGES = {
  '.jpg': ['image/jpeg'], '.jpeg': ['image/jpeg'], '.png': ['image/png'],
  '.webp': ['image/webp'], '.pdf': ['application/pdf']
};
const VIDEOS = {
  '.mp4': ['video/mp4'], '.webm': ['video/webm'], '.mov': ['video/quicktime'],
  '.mkv': ['video/x-matroska', 'video/matroska'], '.avi': ['video/x-msvideo', 'video/avi']
};

// Magic bytes: a renamed .exe/.html cannot pass as an image or PDF just by lying about its name and type.
const startsWith = (buf, hex, offset = 0) => buf.length >= offset + hex.length / 2 && buf.subarray(offset, offset + hex.length / 2).toString('hex') === hex;
const SIGNATURES = {
  '.jpg': (b) => startsWith(b, 'ffd8ff'),
  '.jpeg': (b) => startsWith(b, 'ffd8ff'),
  '.png': (b) => startsWith(b, '89504e470d0a1a0a'),
  '.webp': (b) => startsWith(b, '52494646') && startsWith(b, '57454250', 8),
  '.pdf': (b) => startsWith(b, '255044462d'),
  '.mp4': (b) => startsWith(b, '66747970', 4),
  '.mov': (b) => startsWith(b, '66747970', 4) || startsWith(b, '6d6f6f76', 4) || startsWith(b, '6d646174', 4) || startsWith(b, '77696465', 4),
  '.webm': (b) => startsWith(b, '1a45dfa3'),
  '.mkv': (b) => startsWith(b, '1a45dfa3'),
  '.avi': (b) => startsWith(b, '52494646') && startsWith(b, '41564920', 8)
};

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isVideoField = file.fieldname === 'video';
  const allowed = (isVideoField ? VIDEOS : DOCS_AND_IMAGES)[ext];
  if (allowed && allowed.includes(file.mimetype)) return cb(null, true);
  return cb(new HttpError(400, isVideoField
    ? 'Only video files (MP4, MKV, WEBM, MOV, AVI) are allowed for videos.'
    : 'Only images (JPEG, PNG, WEBP) and PDF documents are allowed.'));
};

const VIDEO_MAX = 100 * 1024 * 1024;
const OTHER_MAX = 10 * 1024 * 1024;
const limits = { fileSize: VIDEO_MAX, files: 20, fields: 60, fieldSize: 200 * 1024 };

const publicUpload = multer({ storage: storageFor(UPLOAD_DIR), fileFilter, limits });
const privateUpload = multer({ storage: storageFor(PRIVATE_DIR), fileFilter, limits: { ...limits, fileSize: OTHER_MAX } });

const hasValidSignature = (file) => {
  const check = SIGNATURES[path.extname(file.originalname).toLowerCase()];
  if (!check) return false;
  let fd;
  try {
    fd = fs.openSync(file.path, 'r');
    const buf = Buffer.alloc(16);
    fs.readSync(fd, buf, 0, 16, 0);
    return check(buf);
  } catch { return false; } finally { if (fd !== undefined) fs.closeSync(fd); }
};

// after multer: enforce the stricter size cap for images/PDFs and verify the real file type; on failure delete everything saved.
const verify = (mw) => (req, res, next) => {
  mw(req, res, (err) => {
    if (err) { removeFiles(uploadedPaths(req)); return next(err); }
    const files = uploadedFiles(req);
    if (files.some((f) => f.fieldname !== 'video' && f.size > OTHER_MAX)) {
      removeFiles(uploadedPaths(req));
      return next(new HttpError(413, 'Images and documents must be 10MB or smaller.'));
    }
    if (!files.every(hasValidSignature)) {
      removeFiles(uploadedPaths(req));
      return next(new HttpError(400, 'One of the files is not a valid image, PDF or video.'));
    }
    next();
  });
};

module.exports = {
  // fields([{ name, maxCount }]) for resources with files; none() still parses multipart text fields
  fields: (specs) => verify(specs.length ? publicUpload.fields(specs) : publicUpload.none()),
  single: (name) => verify(publicUpload.single(name)),
  // private (non-public) single attachment, used by citizen complaints
  privateSingle: (name) => verify(privateUpload.single(name))
};
