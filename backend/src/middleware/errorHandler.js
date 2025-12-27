export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Structured server-side log
  console.error('[errorHandler]', {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message,
    userId: req.user?.userId,
    bodyKeys: Object.keys(req.body || {}),
    params: req.params,
    query: req.query,
  });

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};
