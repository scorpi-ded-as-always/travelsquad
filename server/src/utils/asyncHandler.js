/**
 * Wraps async route handlers to automatically forward errors to Express error middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (err.statusCode) res.status(err.statusCode);
    next(err);
  });
};

module.exports = asyncHandler;
