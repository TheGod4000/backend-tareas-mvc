'use strict';

const crypto = require('crypto');
const env = require('../config/env');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
// originalUrl is matched (full path including the /api prefix). Query string is stripped.
const EXEMPT_PATHS = new Set([
  '/api/auth/login',
  '/api/auth/logout',
]);

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function setCsrfCookie(res, token) {
  res.cookie(env.COOKIE_CSRF_NAME, token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: false,
    path: '/',
  });
}

function timingSafeEqualStr(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  try {
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (_) {
    return false;
  }
}

function csrfProtection(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  // Use originalUrl (the unmodified full URL incl. /api prefix), strip query string.
  const fullPath = (req.originalUrl || req.url || '').split('?')[0];
  if (EXEMPT_PATHS.has(fullPath)) return next();

  const cookieToken = req.cookies && req.cookies[env.COOKIE_CSRF_NAME];
  const headerToken = req.get('x-csrf-token');

  if (!cookieToken || !headerToken || !timingSafeEqualStr(cookieToken, headerToken)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  return next();
}

function issueCsrfToken(req, res) {
  const token = generateToken();
  setCsrfCookie(res, token);
  return res.json({ csrfToken: token });
}

module.exports = {
  csrfProtection,
  issueCsrfToken,
  setCsrfCookie,
  generateToken,
};
