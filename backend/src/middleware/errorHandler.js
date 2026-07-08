/**
 * Global error handling middleware.
 * Catches any errors thrown/passed to next() in routes.
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Wraps an async route handler to automatically forward errors to next().
 * Eliminates the need for try/catch in every route.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };
