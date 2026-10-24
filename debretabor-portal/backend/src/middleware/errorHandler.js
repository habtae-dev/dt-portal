const multer = require('multer');

const notFound = (req, res) => res.status(404).json({ success: false, message: 'Route not found.' });

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;
  let errors = err.errors;

  if (err instanceof multer.MulterError) {
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large.' : `Upload error: ${err.message}`;
  } else if (err.type === 'entity.parse.failed') {
    status = 400; message = 'Malformed JSON body.';
  } else if (err.code === 'ER_DUP_ENTRY') {
    status = 409; message = 'A record with this unique value (e.g. reference number, job code, email) already exists.';
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'WARN_DATA_TRUNCATED' || err.code === 'ER_TRUNCATED_WRONG_VALUE' || err.code === 'ER_DATA_TOO_LONG') {
    status = 400; message = 'One of the submitted values is not valid.';
  } else if (err.isCors) {
    status = 403; message = 'Origin not allowed.';
  } else if (status >= 500) {
    console.error('Unhandled error:', err);
    message = 'Internal server error.';
    errors = undefined;
  }

  res.status(status).json({ success: false, message, ...(errors ? { errors } : {}) });
};

module.exports = { notFound, errorHandler };
