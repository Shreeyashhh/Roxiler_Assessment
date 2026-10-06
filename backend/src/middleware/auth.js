const jwt = require('jsonwebtoken');
const config = require('../config');
const { sendError } = require('../utils/response');

/**
 * JWT Authentication Middleware
 * Verifies bearer token in Authorization header
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, 'Access token missing or invalid', [], 401);
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Authentication token has expired. Please login again.', [], 401);
    }
    return sendError(res, 'Invalid authentication token.', [], 401);
  }
};

/**
 * Role Authorization Middleware
 * Verifies user role against allowed roles
 */
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized request', [], 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`,
        [],
        403
      );
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole
};
