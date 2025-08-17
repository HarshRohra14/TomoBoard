const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let error = {
    message: 'Internal Server Error',
    status: 500,
    code: 'INTERNAL_ERROR'
  };

  // Prisma errors
  if (err.code && err.code.startsWith('P')) {
    switch (err.code) {
      case 'P2002':
        error = {
          message: 'A record with this data already exists',
          status: 409,
          code: 'DUPLICATE_ENTRY',
          field: err.meta?.target?.[0] || 'unknown'
        };
        break;
      case 'P2025':
        error = {
          message: 'Record not found',
          status: 404,
          code: 'NOT_FOUND'
        };
        break;
      case 'P2014':
        error = {
          message: 'Invalid data provided',
          status: 400,
          code: 'INVALID_DATA'
        };
        break;
      default:
        error = {
          message: 'Database operation failed',
          status: 500,
          code: 'DATABASE_ERROR'
        };
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error = {
      message: 'Validation failed',
      status: 400,
      code: 'VALIDATION_ERROR',
      details: err.details || err.message
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      status: 401,
      code: 'TOKEN_INVALID'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      status: 401,
      code: 'TOKEN_EXPIRED'
    };
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File too large',
      status: 400,
      code: 'FILE_TOO_LARGE'
    };
  }

  // Custom application errors
  if (err.status && err.message) {
    error = {
      message: err.message,
      status: err.status,
      code: err.code || 'APPLICATION_ERROR'
    };
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && error.status === 500) {
    error.message = 'Internal Server Error';
    error.details = undefined;
  }

  res.status(error.status).json({
    error: error.message,
    code: error.code,
    ...(error.details && { details: error.details }),
    ...(error.field && { field: error.field }),
    timestamp: new Date().toISOString(),
    path: req.path
  });
};

module.exports = errorHandler;
