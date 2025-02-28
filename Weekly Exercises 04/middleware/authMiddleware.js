// middleware/authMiddleware.js - JWT verification middleware
const jwt = require('jsonwebtoken');

// Authentication middleware
const authenticate = (req, res, next) => {
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

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }

    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authenticate;