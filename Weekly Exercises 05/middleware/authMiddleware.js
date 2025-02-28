// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * Authentication middleware with role-based access control
 * @param {Array} allowedRoles - Array of roles allowed to access the route
 * @returns {Function} Express middleware
 */
const authenticate = (allowedRoles = []) => {
  return (req, res, next) => {
    // Extract the Authorization header
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and has the correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the decoded user info to the request object
      req.user = decoded;

      // Check if user has required role (if roles are specified)
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Access denied. You do not have permission to perform this action.'
        });
      }

      // User is authenticated and authorized
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }

      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};

module.exports = authenticate;