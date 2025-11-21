// backend/middleware/auth.js
const { verifyAccessToken } = require('../utils/jwt');

/**
 * Middleware to protect routes. Expects Authorization: Bearer <token>
 */
module.exports = function (req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Invalid authorization format' });
    }

    const token = parts[1];
    const decoded = verifyAccessToken(token);
    // attach minimal info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (err) {
    // Token expired or invalid
    return res.status(401).json({ error: 'Invalid or expired token', details: err.message });
  }
};
