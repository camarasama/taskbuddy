// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // PostgreSQL errors
  if (err.code === '23505') {
    // Duplicate key error
    error.message = 'Duplicate entry. This record already exists.';
    error.statusCode = 400;
  }

  if (err.code === '23503') {
    // Foreign key constraint error
    error.message = 'Referenced record does not exist.';
    error.statusCode = 400;
  }

  if (err.code === '22P02') {
    // Invalid text representation
    error.message = 'Invalid data format.';
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.statusCode = 401;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(val => val.message);
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Handle 404 - Not Found
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};
