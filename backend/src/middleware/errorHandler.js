const { sendError } = require('../utils/response');

/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Unhandled Error]:', err);

  // Prisma Unique Constraint Error (P2002)
  if (err.code === 'P2002') {
    const target = err.meta?.target ? err.meta.target.join(', ') : 'field';
    return sendError(res, `A record with this ${target} already exists.`, [err.message], 409);
  }

  // Prisma Record Not Found Error (P2025)
  if (err.code === 'P2025') {
    return sendError(res, 'Requested record was not found.', [], 404);
  }

  // Syntax or Parsing Error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'Malformed JSON payload provided.', [], 400);
  }

  // Custom HTTP Error Status
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(
    res,
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An internal server error occurred. Please try again later.'
      : message,
    [],
    statusCode
  );
};

// 404 Handler
const notFoundHandler = (req, res) => {
  return sendError(res, `Route ${req.originalUrl} not found`, [], 404);
};

module.exports = {
  errorHandler,
  notFoundHandler
};
