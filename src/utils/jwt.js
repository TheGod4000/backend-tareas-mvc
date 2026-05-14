'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

function sign(payload, options = {}) {
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_EXPIRES_IN,
    ...options,
  });
}

function verify(token) {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
}

module.exports = { sign, verify };
