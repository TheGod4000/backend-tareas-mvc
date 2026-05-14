'use strict';

const { verify } = require('../utils/jwt');
const env = require('../config/env');

function requireAuth(req, res, next) {
  try {
    const token = req.cookies && req.cookies[env.COOKIE_ACCESS_NAME];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const decoded = verify(token);
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      username: decoded.username,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth };
