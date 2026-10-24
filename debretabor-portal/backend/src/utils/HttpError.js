// Throw from any handler; middleware/errorHandler.js turns it into a JSON response.
class HttpError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors; // optional { field: "problem" }
  }
}
module.exports = HttpError;
